package com.cakehub.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {

    private Long id;
    private String sku;
    private BigDecimal weightInKg;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isInStock;
    private Boolean isActive;
}