package com.cakehub.repository;

import com.cakehub.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for ProductVariant inventory and pricing queries.
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdAndIsActiveTrueOrderByPriceAsc(Long productId);

    Optional<ProductVariant> findBySkuAndIsActiveTrue(String sku);

    Optional<ProductVariant> findBySku(String sku);

    boolean existsBySku(String sku);
}