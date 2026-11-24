package com.cakehub.repository;

import com.cakehub.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findAllByUserId(Long userId, Pageable pageable);

    @Query("""
            SELECT COUNT(o) > 0 FROM Order o
            JOIN o.items oi
            WHERE o.user.id = :userId
              AND oi.variant.product.id = :productId
              AND o.orderStatus = com.cakehub.entity.OrderStatus.DELIVERED
            """)
    boolean existsDeliveredOrderForProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}