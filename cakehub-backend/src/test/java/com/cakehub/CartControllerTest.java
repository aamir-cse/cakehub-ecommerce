package com.cakehub;

import com.cakehub.dto.cart.AddToCartRequest;
import com.cakehub.dto.cart.UpdateCartItemRequest;
import com.cakehub.entity.Category;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.Role;
import com.cakehub.entity.User;
import com.cakehub.repository.CartItemRepository;
import com.cakehub.repository.CartRepository;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.repository.UserRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    private User customer;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productVariantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .fullName("John Doe")
                .email("customer@cakehub.com")
                .passwordHash("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.ROLE_CUSTOMER)
                .isActive(true)
                .isEmailVerified(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Buttercream Cakes")
                .slug("buttercream-cakes")
                .isActive(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .category(category)
                .name("Vanilla Bean Celebration")
                .slug("vanilla-bean-celebration")
                .description("Classic Madagascar vanilla cake")
                .basePrice(new BigDecimal("450.00"))
                .isEggless(true)
                .isFeatured(false)
                .isActive(true)
                .prepTimeHours(4)
                .build());

        variant = productVariantRepository.save(ProductVariant.builder()
                .product(product)
                .sku("VAN-1KG")
                .weightInKg(new BigDecimal("1.0"))
                .price(new BigDecimal("600.00"))
                .stockQuantity(10)
                .isActive(true)
                .build());
    }

    @Test
    @DisplayName("GET /api/v1/cart - unauthenticated access is denied")
    void shouldDenyUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "customer@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/cart/items - adds item with custom message & calculates free delivery")
    void shouldAddItemToCartWithCalculations() throws Exception {
        AddToCartRequest request = AddToCartRequest.builder()
                .variantId(variant.getId())
                .quantity(1)
                .messageOnCake("Happy 25th Birthday!")
                .specialInstructions("Less sweet cream please")
                .build();

        // 1 item of 600.00 -> subtotal 600.00 -> 5% tax = 30.00 -> delivery = 0.00 (free >= 500) -> total = 630.00
        mockMvc.perform(post("/api/v1/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalItems").value(1))
                .andExpect(jsonPath("$.data.subtotal").value(600.0))
                .andExpect(jsonPath("$.data.estimatedTax").value(30.0))
                .andExpect(jsonPath("$.data.estimatedDeliveryFee").value(0.0))
                .andExpect(jsonPath("$.data.estimatedGrandTotal").value(630.0))
                .andExpect(jsonPath("$.data.items[0].messageOnCake").value("Happy 25th Birthday!"));

        assertThat(cartItemRepository.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "customer@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("PUT & DELETE /api/v1/cart/items/{id} - updates quantity and clears cart")
    void shouldUpdateQuantityAndClearCart() throws Exception {
        AddToCartRequest addRequest = AddToCartRequest.builder()
                .variantId(variant.getId())
                .quantity(1)
                .build();

        mockMvc.perform(post("/api/v1/cart/items")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isCreated());

        Long itemId = cartItemRepository.findAll().get(0).getId();

        UpdateCartItemRequest updateRequest = UpdateCartItemRequest.builder()
                .quantity(3)
                .messageOnCake("Congrats!")
                .build();

        mockMvc.perform(put("/api/v1/cart/items/" + itemId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalItems").value(3))
                .andExpect(jsonPath("$.data.subtotal").value(1800.0));

        mockMvc.perform(delete("/api/v1/cart")
                        .with(csrf()))
                .andExpect(status().isOk());

        assertThat(cartItemRepository.findAll()).isEmpty();
    }
}