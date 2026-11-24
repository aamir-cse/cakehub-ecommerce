package com.cakehub.mapper;

import com.cakehub.dto.cart.CartItemResponse;
import com.cakehub.dto.cart.CartResponse;
import com.cakehub.entity.Cart;
import com.cakehub.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "productId", source = "variant.product.id")
    @Mapping(target = "productName", source = "variant.product.name")
    @Mapping(target = "variantSku", source = "variant.sku")
    @Mapping(target = "weightInKg", source = "variant.weightInKg")
    @Mapping(target = "unitPrice", source = "variant.price")
    @Mapping(target = "primaryImageUrl", source = "variant.product.imageUrl")
    @Mapping(target = "itemTotal", expression = "java(calculateItemTotal(cartItem))")
    @Mapping(target = "isAvailable", expression = "java(isItemAvailable(cartItem))")
    CartItemResponse toItemResponse(CartItem cartItem);

    default CartResponse toCartResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItem> items = cart.getItems() != null ? cart.getItems() : Collections.emptyList();
        List<CartItemResponse> itemResponses = items.stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        // Standard bakery billing: 5% GST/Tax, free delivery above 500, else 50
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = (subtotal.compareTo(new BigDecimal("500.00")) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0)
                ? BigDecimal.ZERO
                : new BigDecimal("50.00");
        BigDecimal grandTotal = subtotal.add(tax).add(deliveryFee);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .estimatedTax(tax)
                .estimatedDeliveryFee(deliveryFee)
                .estimatedGrandTotal(grandTotal)
                .build();
    }

    default BigDecimal calculateItemTotal(CartItem cartItem) {
        if (cartItem == null || cartItem.getVariant() == null || cartItem.getVariant().getPrice() == null) {
            return BigDecimal.ZERO;
        }
        return cartItem.getVariant().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    default Boolean isItemAvailable(CartItem cartItem) {
        if (cartItem == null || cartItem.getVariant() == null) {
            return false;
        }
        return Boolean.TRUE.equals(cartItem.getVariant().getIsActive())
                && cartItem.getVariant().getStockQuantity() != null
                && cartItem.getVariant().getStockQuantity() >= cartItem.getQuantity();
    }
}