package com.cakehub.exceptions;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Standardized API error response payload following RFC 7807 concepts.
 * Returned by GlobalExceptionHandler whenever an exception escapes a controller.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Excludes fields that are null (e.g., validationErrors will be omitted if it's not a form error)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Always false for error payloads.
     */
    @Builder.Default
    private boolean success = false;

    /**
     * HTTP status code (e.g., 400, 404, 409, 500).
     */
    private int status;

    /**
     * Machine-readable error code used by client-side applications for branching logic.
     * Example: "RESOURCE_NOT_FOUND", "INSUFFICIENT_STOCK", "VALIDATION_FAILED".
     */
    private String errorCode;

    /**
     * Human-friendly message detailing the nature of the error.
     */
    private String message;

    /**
     * The requested URI path that triggered the exception.
     */
    private String path;

    /**
     * Key-value mapping of field-specific validation failures.
     * Typically populated during @Valid bean validation failures.
     */
    private Map<String, String> validationErrors;

    /**
     * UTC timestamp at the exact moment the error payload was synthesized.
     */
    @Builder.Default
    private Instant timestamp = Instant.now();
}