package com.cakehub.service;

import com.cakehub.dto.cart.AddToCartRequest;
import com.cakehub.dto.cart.CartResponse;
import com.cakehub.dto.cart.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCartForUser(String email);

    CartResponse addToCart(String email, AddToCartRequest request);

    CartResponse updateCartItem(String email, Long cartItemId, UpdateCartItemRequest request);

    CartResponse removeCartItem(String email, Long cartItemId);

    void clearCart(String email);
}