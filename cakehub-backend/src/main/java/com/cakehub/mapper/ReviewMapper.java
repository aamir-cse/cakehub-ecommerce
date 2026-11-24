package com.cakehub.mapper;

import com.cakehub.dto.review.ReviewResponse;
import com.cakehub.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "customerName", source = "user.fullName")
    ReviewResponse toResponse(Review review);
}