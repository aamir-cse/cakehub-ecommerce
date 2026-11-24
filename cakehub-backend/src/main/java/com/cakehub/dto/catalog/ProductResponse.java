package com.cakehub.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String name;
    private String slug;
    private String description;
    private String primaryImageUrl;
    private List<String> galleryImageUrls;
    private Boolean isEggless;
    private Boolean isCustomizable;
    private Boolean isFeatured;
    private Boolean isActive;
    private BigDecimal startingPrice;
    private List<ProductVariantResponse> variants;
    private Instant createdAt;
    private Instant updatedAt;
}