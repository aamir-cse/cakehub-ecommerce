package com.cakehub.dto.response;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API response envelope for all successful REST API operations.
 * Enforces a consistent contract across the entire application.
 *
 * @param <T> The payload type returned in the "data" field.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// Omits null fields from the final JSON output to keep payloads lean
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * Indicates whether the business operation succeeded.
     */
    private boolean success;

    /**
     * Human-readable message explaining the result to the client.
     */
    private String message;

    /**
     * Generic payload containing the actual domain data (DTO, List, Map, etc.).
     */
    private T data;

    /**
     * UTC timestamp recorded at the moment this response object was assembled.
     */
    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Static factory method for returning a successful response with custom data and message.
     *
     * @param data    The payload object.
     * @param message Descriptive success message.
     * @param <T>     Generic type of the data.
     * @return ApiResponse instance populated with success flags.
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Static factory method for returning a successful response with a default message.
     *
     * @param data The payload object.
     * @param <T>  Generic type of the data.
     * @return ApiResponse instance.
     */
    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    /**
     * Static factory method for quick failure notices when no payload data is returned.
     *
     * @param message Descriptive error/failure message.
     * @param <T>     Generic type placeholder.
     * @return ApiResponse instance with success set to false.
     */
    public static <T> ApiResponse<T> failure(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}