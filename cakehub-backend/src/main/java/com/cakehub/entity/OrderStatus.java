package com.cakehub.entity;

/**
 * Lifecycle states of a cake order from placement to delivery.
 */
public enum OrderStatus {
    PENDING_PAYMENT,
    CONFIRMED,
    BAKING_IN_PROGRESS,
    DECORATING,
    READY_FOR_PICKUP,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}