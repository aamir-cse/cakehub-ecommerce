package com.cakehub.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an authenticated user attempts to access or mutate a resource
 * that belongs to another entity or user without adequate privileges.
 * Maps to HTTP Status 403 (Forbidden).
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedAccessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Constructs the exception with an explanatory security message.
     * Example: "You do not have permission to view or modify order: ORD-202611-0042"
     *
     * @param message Human-readable detail message explaining the permission boundary.
     */
    public UnauthorizedAccessException(String message) {
        super(message);
    }

    /**
     * Constructs the exception with both an explanatory message and an underlying cause.
     *
     * @param message Explanatory security message.
     * @param cause   Underlying throwable cause.
     */
    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}