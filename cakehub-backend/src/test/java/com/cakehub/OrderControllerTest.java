package com.cakehub;

import com.cakehub.dto.cart.AddToCartRequest;
import com.cakehub.dto.order.CheckoutRequest;
import com.cakehub.entity.Address;
import com.cakehub.entity.Category;
import com.cakehub.entity.OrderStatus;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.Role;
import com.cakehub.entity.User;
import com.cakehub.repository.AddressRepository;
import com.cakehub.repository.CartItemRepository;
import com.cakehub.repository.CartRepository;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.OrderItemRepository;
import com.cakehub.repository.OrderRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.repository.UserRepository;
import com.cakehub.service.CartService;
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
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

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

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartService cartService;

    private User customer;
    private Address address;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        productVariantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        addressRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .fullName("Alice Baker")
                .email("alice@cakehub.com")
                .passwordHash("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.ROLE_CUSTOMER)
                .isActive(true)
                .isEmailVerified(true)
                .build());

        address = addressRepository.save(Address.builder()
                .user(customer)
                .recipientName("Alice Baker")
                .recipientPhone("9876543210")
                .streetAddress("Flat 402, Sunshine Residency")
                .city("New Delhi")
                .state("Delhi")
                .postalCode("110001")
                .isDefault(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Cheesecakes")
                .slug("cheesecakes")
                .isActive(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .category(category)
                .name("New York Blueberry Cheesecake")
                .slug("ny-blueberry-cheesecake")
                .description("Baked Philadelphia cheesecake with blueberry compote")
                .basePrice(new BigDecimal("750.00"))
                .isEggless(true)
                .isFeatured(true)
                .isActive(true)
                .prepTimeHours(6)
                .build());

        variant = productVariantRepository.save(ProductVariant.builder()
                .product(product)
                .sku("NY-BLUE-1KG")
                .weightInKg(new BigDecimal("1.0"))
                .price(new BigDecimal("750.00"))
                .stockQuantity(10)
                .isActive(true)
                .build());
    }

    @Test
    @WithMockUser(username = "alice@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/orders/checkout - places order, decrements stock, and empties cart")
    void shouldCompleteCheckoutSuccessfully() throws Exception {
        cartService.addToCart("alice@cakehub.com", AddToCartRequest.builder()
                .variantId(variant.getId())
                .quantity(2)
                .messageOnCake("Happy Anniversary")
                .build());

        CheckoutRequest request = CheckoutRequest.builder()
                .deliveryAddressId(address.getId())
                .deliveryDate(LocalDate.now().plusDays(2))
                .deliveryTimeSlot("02:00 PM - 05:00 PM")
                .paymentMethod("CARD")
                .deliveryInstructions("Ring the bell twice")
                .build();

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderNumber").isString())
                .andExpect(jsonPath("$.data.orderStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].productNameSnapshot").value("New York Blueberry Cheesecake"))
                .andExpect(jsonPath("$.data.items[0].quantity").value(2));

        // Check variant stock decremented from 10 to 8
        ProductVariant updatedVariant = productVariantRepository.findById(variant.getId()).orElseThrow();
        assertThat(updatedVariant.getStockQuantity()).isEqualTo(8);

        // Check cart is emptied
        assertThat(cartItemRepository.findAll()).isEmpty();
    }

    @Test
    @WithMockUser(username = "alice@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("PATCH /api/v1/orders/{id}/cancel - cancels order and restores inventory")
    void shouldCancelOrderAndRestoreStock() throws Exception {
        cartService.addToCart("alice@cakehub.com", AddToCartRequest.builder()
                .variantId(variant.getId())
                .quantity(3)
                .build());

        CheckoutRequest checkout = CheckoutRequest.builder()
                .deliveryAddressId(address.getId())
                .deliveryDate(LocalDate.now().plusDays(1))
                .deliveryTimeSlot("10:00 AM - 01:00 PM")
                .paymentMethod("COD")
                .build();

        var orderResponse = cartService.getCartForUser("alice@cakehub.com");
        assertThat(orderResponse.getTotalItems()).isEqualTo(3);

        // Run checkout directly through controller
        String responseStr = mockMvc.perform(post("/api/v1/orders/checkout")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkout)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long orderId = objectMapper.readTree(responseStr).path("data").path("id").asLong();

        // Stock was 10, bought 3 -> 7
        assertThat(productVariantRepository.findById(variant.getId()).orElseThrow().getStockQuantity()).isEqualTo(7);

        // Cancel order
        mockMvc.perform(patch("/api/v1/orders/" + orderId + "/cancel")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderStatus").value("CANCELLED"));

        // Stock restored back to 10
        assertThat(productVariantRepository.findById(variant.getId()).orElseThrow().getStockQuantity()).isEqualTo(10);
    }
}