package com.cakehub.dto.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {

    @NotNull(message = "Product variant ID is required")
    private Long variantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 20, message = "Maximum allowed quantity per cake item is 20")
    private Integer quantity;

    @Size(max = 500, message = "Custom message on cake cannot exceed 500 characters")
    private String messageOnCake;

    @Size(max = 255, message = "Special instructions cannot exceed 255 characters")
    private String specialInstructions;
}