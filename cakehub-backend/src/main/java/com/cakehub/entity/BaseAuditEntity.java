package com.cakehub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.Instant;

/**
 * Abstract mapped superclass providing automated UTC timestamp auditing.
 * Inherited by all persistent database entities across the CakeHub domain.
 */
@Getter
@Setter
@MappedSuperclass
// Hooks into Spring Data JPA lifecycle callbacks to assign timestamps automatically
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseAuditEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Immutable UTC creation timestamp assigned on initial entity persistence.
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * Mutable UTC timestamp updated on every entity modification or update transaction.
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}