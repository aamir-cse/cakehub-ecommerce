package com.cakehub.repository;

import com.cakehub.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for active customer shopping carts.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.variant v LEFT JOIN FETCH v.product WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItemsAndProductDetails(@Param("userId") Long userId);
}