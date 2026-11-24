package com.cakehub.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cakehub.dto.response.ApiResponse;
import com.cakehub.entity.Coupon;
import com.cakehub.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getActiveCoupons() {
        List<Coupon> active = couponRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()) && !c.getValidUntil().isBefore(LocalDate.now()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(active, "Active coupons fetched"));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @RequestBody Map<String, Object> body
    ) {
        String code = String.valueOf(body.getOrDefault("code", "")).trim().toUpperCase();
        BigDecimal subtotal = new BigDecimal(String.valueOf(body.getOrDefault("subtotal", "0")));

        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive promo code."));

        if (coupon.getValidUntil().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("This promo code has expired.");
        }

        if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException(
                    "Minimum order amount of ₹" + coupon.getMinOrderAmount().toPlainString() + " required for " + coupon.getCode()
            );
        }

        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "code", coupon.getCode(),
                        "discountAmount", discount,
                        "message", "Promo code " + coupon.getCode() + " applied! You saved ₹" + discount.toPlainString()
                ),
                "Coupon validated"
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        if (coupon.getIsActive() == null) coupon.setIsActive(true);
        return ResponseEntity.ok(ApiResponse.success(couponRepository.save(coupon), "Coupon created"));
    }
}