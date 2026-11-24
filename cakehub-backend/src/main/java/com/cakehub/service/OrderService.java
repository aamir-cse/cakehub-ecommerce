package com.cakehub.service;

import com.cakehub.dto.order.CheckoutRequest;
import com.cakehub.dto.order.OrderResponse;
import com.cakehub.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    OrderResponse checkout(String email, CheckoutRequest request);

    OrderResponse getOrderByOrderNumber(String email, String orderNumber);

    Page<OrderResponse> getCustomerOrders(String email, Pageable pageable);

    Page<OrderResponse> getAllOrdersForStaff(Pageable pageable);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus);

    OrderResponse cancelOrder(String email, Long orderId);
}