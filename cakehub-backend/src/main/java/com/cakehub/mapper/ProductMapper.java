package com.cakehub.mapper;

import com.cakehub.dto.catalog.ProductRequest;
import com.cakehub.dto.catalog.ProductResponse;
import com.cakehub.dto.catalog.ProductVariantRequest;
import com.cakehub.dto.catalog.ProductVariantResponse;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "variants", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categorySlug", source = "category.slug")
    @Mapping(target = "startingPrice", expression = "java(calculateStartingPrice(product.getVariants()))")
    ProductResponse toResponse(Product product);

    @Mapping(target = "isInStock", expression = "java(variant.getStockQuantity() != null && variant.getStockQuantity() > 0)")
    ProductVariantResponse toVariantResponse(ProductVariant variant);

    @Mapping(target = "product", ignore = true)
    ProductVariant toVariantEntity(ProductVariantRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "variants", ignore = true)
    void updateEntityFromRequest(ProductRequest request, @MappingTarget Product product);

    default BigDecimal calculateStartingPrice(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return variants.stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(ProductVariant::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO);
    }
}