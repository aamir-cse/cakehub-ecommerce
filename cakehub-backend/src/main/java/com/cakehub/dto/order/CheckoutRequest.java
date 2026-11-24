package com.cakehub.dto.order;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

	private String couponCode;
	
    @NotNull(message = "Delivery address ID is required")
    private Long deliveryAddressId;

    @NotNull(message = "Delivery date is required")
    @FutureOrPresent(message = "Delivery date cannot be in the past")
    private LocalDate deliveryDate;

    @NotBlank(message = "Delivery time slot is required (e.g. 10:00 AM - 01:00 PM)")
    private String deliveryTimeSlot;

    @NotBlank(message = "Payment method is required (e.g. COD, UPI, CARD)")
    private String paymentMethod;

    @Size(max = 255, message = "Delivery instructions cannot exceed 255 characters")
    private String deliveryInstructions;
}