package com.cakehub.service.impl;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cakehub.dto.catalog.ProductRequest;
import com.cakehub.dto.catalog.ProductResponse;
import com.cakehub.dto.catalog.ProductVariantRequest;
import com.cakehub.entity.Category;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import com.cakehub.mapper.ProductMapper;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.service.ProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getFilteredProducts(Long categoryId, String search, Boolean eggless, Pageable pageable) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return productRepository.findFilteredProducts(categoryId, cleanSearch, eggless, pageable)
                .map(productMapper::toResponse);
    }
    
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

        String slug = generateUniqueSlug(toSlug(request.getName()));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        product.setSlug(slug);

        List<ProductVariant> variants = new ArrayList<>();
        for (ProductVariantRequest varReq : request.getVariants()) {
            if (productVariantRepository.existsBySku(varReq.getSku())) {
                throw new IllegalArgumentException("Variant SKU already exists: " + varReq.getSku());
            }
            ProductVariant variant = productMapper.toVariantEntity(varReq);
            variant.setProduct(product);
            variants.add(variant);
        }
        product.setVariants(variants);

        Product saved = productRepository.save(product);
        log.info("Created product '{}' with {} variants (ID: {})", saved.getName(), variants.size(), saved.getId());
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));
        product.setCategory(category);

        if (!product.getName().equalsIgnoreCase(request.getName().trim())) {
            product.setSlug(generateUniqueSlug(toSlug(request.getName())));
        }

        productMapper.updateEntityFromRequest(request, product);

        // Synchronize variants
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            product.getVariants().clear();
            for (ProductVariantRequest varReq : request.getVariants()) {
                ProductVariant variant = productMapper.toVariantEntity(varReq);
                variant.setProduct(product);
                product.getVariants().add(variant);
            }
        }

        Product updated = productRepository.save(product);
        log.info("Updated product ID: {}", updated.getId());
        return productMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithCategory(slug)
                .orElseThrow(() -> new IllegalArgumentException("Product not found for slug: " + slug));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllActiveProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategorySlug(String categorySlug, Pageable pageable) {
        return productRepository.findByCategorySlugAndIsActiveTrue(categorySlug, pageable)
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchByKeyword(keyword, pageable)
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional
    public void toggleProductStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        product.setIsActive(active);
        productRepository.save(product);
        log.info("Toggled product ID: {} active status to: {}", id, active);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
        productRepository.delete(product);
        log.info("Deleted product ID: {}", id);
    }

    private String generateUniqueSlug(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        return slug;
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String text = input.trim().toLowerCase(Locale.ENGLISH);
        text = text.replace("&", " and ");
        String nowhitespace = WHITESPACE.matcher(text).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }
}