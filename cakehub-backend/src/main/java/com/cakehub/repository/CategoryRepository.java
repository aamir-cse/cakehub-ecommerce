package com.cakehub.repository;

import com.cakehub.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Category persistence operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlugAndIsActiveTrue(String slug);

    Optional<Category> findBySlug(String slug);

    List<Category> findAllByIsActiveTrueOrderByNameAsc();

    boolean existsBySlug(String slug);
}