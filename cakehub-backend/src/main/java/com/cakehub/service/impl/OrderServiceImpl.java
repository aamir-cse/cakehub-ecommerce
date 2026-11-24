package com.cakehub.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cakehub.dto.order.CheckoutRequest;
import com.cakehub.dto.order.OrderResponse;
import com.cakehub.entity.Address;
import com.cakehub.entity.Cart;
import com.cakehub.entity.CartItem;
import com.cakehub.entity.Coupon;
import com.cakehub.entity.Order;
import com.cakehub.entity.OrderItem;
import com.cakehub.entity.OrderStatus;
import com.cakehub.entity.PaymentStatus;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.User;
import com.cakehub.mapper.OrderMapper;
import com.cakehub.repository.AddressRepository;
import com.cakehub.repository.CartItemRepository;
import com.cakehub.repository.CartRepository;
import com.cakehub.repository.CouponRepository;
import com.cakehub.repository.OrderItemRepository;
import com.cakehub.repository.OrderRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.repository.UserRepository;
import com.cakehub.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CouponRepository couponRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest request) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Address address = addressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new IllegalArgumentException("Address not found with ID: " + request.getDeliveryAddressId()));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Delivery address does not belong to the user");
        }

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Shopping cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart");
        }

        // Validate stock and compute subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new IllegalStateException("Item " + variant.getProduct().getName() + " is currently unavailable");
            }
            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for " + variant.getProduct().getName() + " (SKU: " + variant.getSku() + ")");
            }

            // Decrement inventory
            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            productVariantRepository.save(variant);

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .variant(variant)
                    .productNameSnapshot(variant.getProduct().getName())
                    .variantSkuSnapshot(variant.getSku())
                    .weightInKgSnapshot(variant.getWeightInKg())
                    .unitPrice(variant.getPrice())
                    .quantity(cartItem.getQuantity())
                    .totalPrice(itemTotal)
                    .messageOnCake(cartItem.getMessageOnCake())
                    .specialInstructions(cartItem.getSpecialInstructions())
                    .build();

            orderItems.add(orderItem);
        }

        // Validate & Apply Promo Coupon if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getCouponCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive promo code: " + request.getCouponCode()));

            if (coupon.getValidUntil().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Promo code " + coupon.getCode() + " has expired.");
            }
            if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new IllegalArgumentException("Minimum order of ₹" + coupon.getMinOrderAmount() + " required for " + coupon.getCode());
            }

            if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
                discountAmount = subtotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscountAmount() != null && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    discountAmount = coupon.getMaxDiscountAmount();
                }
            } else {
                discountAmount = coupon.getDiscountValue();
            }

            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }
        }

        BigDecimal discountedSubtotal = subtotal.subtract(discountAmount);
        BigDecimal tax = discountedSubtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = (discountedSubtotal.compareTo(new BigDecimal("499.00")) >= 0) ? BigDecimal.ZERO : new BigDecimal("49.00");
        BigDecimal grandTotal = discountedSubtotal.add(tax).add(deliveryFee);

        String orderNumber = "CK-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = Order.builder()
                .user(user)
                .deliveryAddress(address)
                .orderNumber(orderNumber)
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .deliveryDate(request.getDeliveryDate())
                .deliveryTimeSlot(request.getDeliveryTimeSlot())
                .deliveryInstructions(request.getDeliveryInstructions())
                .itemsSubtotal(subtotal)
                .taxAmount(tax)
                .deliveryFee(deliveryFee)
                .discountAmount(discountAmount)
                .totalAmount(grandTotal)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Empty cart post-checkout
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        log.info("Successfully placed order {} for user {} (discount: {})", savedOrder.getOrderNumber(), email, discountAmount);
        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String email, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderNumber));

        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Access denied to this order");
        }

        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(String email, Pageable pageable) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        return orderRepository.findAllByUserId(user.getId(), pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrdersForStaff(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        order.setOrderStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order ID {} status updated to {}", orderId, newStatus);
        return orderMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String email, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Order does not belong to user");
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED || order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order cannot be cancelled in status: " + order.getOrderStatus());
        }

        // Restore variant inventory
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            productVariantRepository.save(variant);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        log.info("Order ID {} cancelled by customer {}", orderId, email);
        return orderMapper.toResponse(cancelledOrder);
    }
}