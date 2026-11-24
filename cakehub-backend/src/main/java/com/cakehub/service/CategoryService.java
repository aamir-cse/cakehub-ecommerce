package com.cakehub.service;

import com.cakehub.dto.catalog.CategoryRequest;
import com.cakehub.dto.catalog.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    CategoryResponse getCategoryBySlug(String slug);

    List<CategoryResponse> getAllActiveCategories();

    List<CategoryResponse> getAllCategoriesForAdmin();

    void toggleCategoryStatus(Long id, boolean active);

    void deleteCategory(Long id);
}