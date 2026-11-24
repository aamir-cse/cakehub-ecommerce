package com.cakehub.service;

import com.cakehub.dto.catalog.ProductRequest;
import com.cakehub.dto.catalog.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySlug(String slug);
    
    Page<ProductResponse> getFilteredProducts(Long categoryId, String search, Boolean eggless, Pageable pageable);

    Page<ProductResponse> getAllActiveProducts(Pageable pageable);

    Page<ProductResponse> getProductsByCategorySlug(String categorySlug, Pageable pageable);

    List<ProductResponse> getFeaturedProducts();

    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);

    void toggleProductStatus(Long id, boolean active);

    void deleteProduct(Long id);
}