package com.cakehub.dto.order;

import com.cakehub.entity.OrderStatus;
import com.cakehub.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private LocalDate deliveryDate;
    private String deliveryTimeSlot;
    private String deliveryInstructions;
    private DeliveryAddressDto deliveryAddress;
    private BigDecimal itemsSubtotal;
    private BigDecimal taxAmount;
    private BigDecimal deliveryFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryAddressDto {
        private Long id;
        private String recipientName;
        private String recipientPhone;
        private String streetAddress;
        private String apartmentSuite;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        private String addressType;
    }
}