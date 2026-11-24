package com.cakehub.service.impl;

import com.cakehub.dto.cart.AddToCartRequest;
import com.cakehub.dto.cart.CartResponse;
import com.cakehub.dto.cart.UpdateCartItemRequest;
import com.cakehub.entity.Cart;
import com.cakehub.entity.CartItem;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.User;
import com.cakehub.mapper.CartMapper;
import com.cakehub.repository.CartItemRepository;
import com.cakehub.repository.CartRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.repository.UserRepository;
import com.cakehub.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartMapper cartMapper;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartForUser(String email) {
        Cart cart = getOrCreateCart(email);
        return cartMapper.toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String email, AddToCartRequest request) {
        Cart cart = getOrCreateCart(email);

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found with ID: " + request.getVariantId()));

        if (!Boolean.TRUE.equals(variant.getIsActive())) {
            throw new IllegalStateException("Product variant is currently inactive");
        }

        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + variant.getStockQuantity() + ")");
        }

        String normalizedMsg = request.getMessageOnCake() != null ? request.getMessageOnCake().trim() : null;
        String normalizedInstr = request.getSpecialInstructions() != null ? request.getSpecialInstructions().trim() : null;

        // Check if matching variant and customization already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .filter(item -> Objects.equals(item.getMessageOnCake(), normalizedMsg))
                .filter(item -> Objects.equals(item.getSpecialInstructions(), normalizedInstr))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > 20) {
                throw new IllegalArgumentException("Maximum allowed limit is 20 units per item line");
            }
            if (variant.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Total combined quantity exceeds available stock (" + variant.getStockQuantity() + ")");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .messageOnCake(normalizedMsg)
                    .specialInstructions(normalizedInstr)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        log.info("Added variant ID {} to cart for user {}", variant.getId(), email);
        return cartMapper.toCartResponse(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String email, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(email);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found with ID: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to the user's cart");
        }

        ProductVariant variant = item.getVariant();
        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + variant.getStockQuantity() + ")");
        }

        item.setQuantity(request.getQuantity());
        if (request.getMessageOnCake() != null) {
            item.setMessageOnCake(request.getMessageOnCake().trim());
        }
        if (request.getSpecialInstructions() != null) {
            item.setSpecialInstructions(request.getSpecialInstructions().trim());
        }

        cartItemRepository.save(item);
        Cart refreshedCart = cartRepository.findById(cart.getId()).orElseThrow();
        log.info("Updated cart item ID {} for user {}", cartItemId, email);
        return cartMapper.toCartResponse(refreshedCart);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String email, Long cartItemId) {
        Cart cart = getOrCreateCart(email);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found with ID: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to the user's cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart refreshedCart = cartRepository.findById(cart.getId()).orElseThrow();
        log.info("Removed cart item ID {} for user {}", cartItemId, email);
        return cartMapper.toCartResponse(refreshedCart);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Cleared all items from cart for user {}", email);
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found or inactive: " + email));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }
}