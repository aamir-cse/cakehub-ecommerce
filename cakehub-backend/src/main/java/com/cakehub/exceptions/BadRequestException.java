package com.cakehub.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown whenever a business validation fails or the client sends an unprocessable request.
 * Maps to HTTP Status 400 (Bad Request).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Constructs the exception with an explanatory message.
     *
     * @param message Human-readable detail message explaining the invalid parameter or state.
     */
    public BadRequestException(String message) {
        super(message);
    }

    /**
     * Constructs the exception with both a message and an underlying cause.
     *
     * @param message Explanatory message.
     * @param cause   Underlying throwable.
     */
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}