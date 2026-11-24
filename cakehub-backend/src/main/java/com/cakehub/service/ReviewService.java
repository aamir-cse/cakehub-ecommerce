package com.cakehub.service;

import com.cakehub.dto.review.ProductRatingSummaryResponse;
import com.cakehub.dto.review.ReviewRequest;
import com.cakehub.dto.review.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse submitOrUpdateReview(String email, ReviewRequest request);

    Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable);

    ProductRatingSummaryResponse getProductRatingSummary(Long productId);

    void deleteReview(String email, Long reviewId, boolean isAdmin);
}