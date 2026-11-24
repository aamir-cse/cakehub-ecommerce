package com.cakehub.entity;

/**
 * Status tracking for financial transactions associated with orders.
 */
public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED
}