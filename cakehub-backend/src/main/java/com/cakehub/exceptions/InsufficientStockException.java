package com.cakehub.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown whenever an operation requests more inventory than currently available.
 * Maps to HTTP Status 409 (Conflict).
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InsufficientStockException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Constructs the exception with a message detailing the stock shortage.
     * Example: "Insufficient stock for variant 'Chocolate Truffle 1kg'. Requested: 4, Available: 1"
     *
     * @param message Explanatory stock error message.
     */
    public InsufficientStockException(String message) {
        super(message);
    }

    /**
     * Constructs the exception with both a message and an underlying cause.
     *
     * @param message Explanatory stock error message.
     * @param cause   Underlying throwable cause.
     */
    public InsufficientStockException(String message, Throwable cause) {
        super(message, cause);
    }
}