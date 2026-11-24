package com.cakehub.service.impl;

import com.cakehub.dto.review.ProductRatingSummaryResponse;
import com.cakehub.dto.review.ReviewRequest;
import com.cakehub.dto.review.ReviewResponse;
import com.cakehub.entity.Product;
import com.cakehub.entity.Review;
import com.cakehub.entity.User;
import com.cakehub.mapper.ReviewMapper;
import com.cakehub.repository.OrderRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ReviewRepository;
import com.cakehub.repository.UserRepository;
import com.cakehub.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse submitOrUpdateReview(String email, ReviewRequest request) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + request.getProductId()));

        boolean isVerifiedPurchase = orderRepository.existsDeliveredOrderForProduct(user.getId(), product.getId());

        Review review = reviewRepository.findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> Review.builder()
                        .user(user)
                        .product(product)
                        .build());

        review.setRating(request.getRating());
        review.setTitle(request.getTitle() != null ? request.getTitle().trim() : null);
        review.setComment(request.getComment() != null ? request.getComment().trim() : null);
        review.setIsVerifiedPurchase(isVerifiedPurchase);
        review.setIsActive(true);

        Review saved = reviewRepository.save(review);
        log.info("Review saved for product ID {} by user {} (Verified: {})", product.getId(), email, isVerifiedPurchase);
        return reviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findAllByProductIdAndIsActiveTrue(productId, pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductRatingSummaryResponse getProductRatingSummary(Long productId) {
        Double rawAvg = reviewRepository.getAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductIdAndIsActiveTrue(productId);
        BigDecimal roundedAvg = BigDecimal.valueOf(rawAvg != null ? rawAvg : 0.0)
                .setScale(1, RoundingMode.HALF_UP);

        return ProductRatingSummaryResponse.builder()
                .productId(productId)
                .averageRating(roundedAvg)
                .totalReviews(count)
                .build();
    }

    @Override
    @Transactional
    public void deleteReview(String email, Long reviewId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + reviewId));

        if (!isAdmin && !review.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("You are not authorized to delete this review");
        }

        review.setIsActive(false);
        reviewRepository.save(review);
        log.info("Soft-deleted review ID {} by {}", reviewId, email);
    }
}