package com.cakehub;

import com.cakehub.dto.catalog.ProductRequest;
import com.cakehub.dto.catalog.ProductVariantRequest;
import com.cakehub.entity.Category;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        productVariantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        testCategory = categoryRepository.save(
                Category.builder()
                        .name("Signature Truffle")
                        .slug("signature-truffle")
                        .description("Rich Belgian chocolate truffle cakes")
                        .isActive(true)
                        .build()
        );
    }

    @Test
    @DisplayName("GET /api/v1/products - unauthenticated user can list products")
    void shouldReturnProductsPublicly() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(username = "admin@cakehub.com", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/products - admin can create product with multiple variants")
    void shouldCreateProductWithVariantsWhenAdmin() throws Exception {
        ProductVariantRequest halfKg = ProductVariantRequest.builder()
                .sku("DUTCH-TRF-500G")
                .weightInKg(new BigDecimal("0.5"))
                .price(new BigDecimal("499.00"))
                .stockQuantity(25)
                .isActive(true)
                .build();

        ProductVariantRequest oneKg = ProductVariantRequest.builder()
                .sku("DUTCH-TRF-1000G")
                .weightInKg(new BigDecimal("1.0"))
                .price(new BigDecimal("899.00"))
                .stockQuantity(15)
                .isActive(true)
                .build();

        ProductRequest request = ProductRequest.builder()
                .categoryId(testCategory.getId())
                .name("Dark Dutch Truffle Cake")
                .description("Intense 70% dark chocolate ganache layered cake")
                .basePrice(new BigDecimal("499.00"))
                .isEggless(true)
                .isCustomizable(true)
                .isFeatured(true)
                .isActive(true)
                .variants(List.of(halfKg, oneKg))
                .build();

        mockMvc.perform(post("/api/v1/products")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.name").value("Dark Dutch Truffle Cake"))
        .andExpect(jsonPath("$.data.slug").value("dark-dutch-truffle-cake"))
        .andExpect(jsonPath("$.data.startingPrice").value(499.0))
        .andExpect(jsonPath("$.data.variants.length()").value(2));

        assertThat(productRepository.existsBySlug("dark-dutch-truffle-cake")).isTrue();
        assertThat(productVariantRepository.existsBySku("DUTCH-TRF-500G")).isTrue();
    }

    @Test
    @WithMockUser(username = "customer@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/products - customer cannot create product (403 Forbidden)")
    void shouldRejectProductCreationForNonAdmin() throws Exception {
        ProductVariantRequest variant = ProductVariantRequest.builder()
                .sku("UNAUTH-SKU-1")
                .weightInKg(new BigDecimal("0.5"))
                .price(new BigDecimal("299.00"))
                .stockQuantity(10)
                .isActive(true)
                .build();

        ProductRequest request = ProductRequest.builder()
                .categoryId(testCategory.getId())
                .name("Unauthorized Cake")
                .description("Should not be allowed")
                .basePrice(new BigDecimal("299.00"))
                .variants(List.of(variant))
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}