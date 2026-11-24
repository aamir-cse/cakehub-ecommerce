package com.cakehub.controller;

import com.cakehub.dto.response.ApiResponse;
import com.cakehub.dto.response.HealthStatusResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health check controller to verify backend operational readiness.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<HealthStatusResponse>> checkHealth() {
        HealthStatusResponse healthData = HealthStatusResponse.builder()
                .application("CakeHub Backend Service")
                .status("UP")
                .version("1.0.0-SNAPSHOT")
                .environment("development")
                .build();

        ApiResponse<HealthStatusResponse> response = ApiResponse.success(
                healthData,
                "CakeHub backend services are healthy and operational"
        );

        return ResponseEntity.ok(response);
    }
}