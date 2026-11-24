package com.cakehub;

import com.cakehub.dto.address.AddressRequest;
import com.cakehub.dto.review.ReviewRequest;
import com.cakehub.dto.user.UpdateProfileRequest;
import com.cakehub.entity.Address;
import com.cakehub.entity.Category;
import com.cakehub.entity.Order;
import com.cakehub.entity.OrderItem;
import com.cakehub.entity.OrderStatus;
import com.cakehub.entity.PaymentStatus;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.Role;
import com.cakehub.entity.User;
import com.cakehub.repository.AddressRepository;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.OrderItemRepository;
import com.cakehub.repository.OrderRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.ProductVariantRepository;
import com.cakehub.repository.ReviewRepository;
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
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReviewAndAddressControllerTest {

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
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private User customer;
    private Product product;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        productVariantRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        addressRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .fullName("Rohan Sharma")
                .email("rohan@cakehub.com")
                .passwordHash("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.ROLE_CUSTOMER)
                .isActive(true)
                .isEmailVerified(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Red Velvet Specials")
                .slug("red-velvet-specials")
                .isActive(true)
                .build());

        product = productRepository.save(Product.builder()
                .category(category)
                .name("Classic Red Velvet Cream Cheese")
                .slug("classic-red-velvet-cream-cheese")
                .description("Velvety cocoa sponge with tangy cream cheese frosting")
                .basePrice(new BigDecimal("550.00"))
                .isEggless(true)
                .isFeatured(true)
                .isActive(true)
                .prepTimeHours(4)
                .build());

        variant = productVariantRepository.save(ProductVariant.builder()
                .product(product)
                .sku("RV-500G")
                .weightInKg(new BigDecimal("0.5"))
                .price(new BigDecimal("550.00"))
                .stockQuantity(20)
                .isActive(true)
                .build());
    }

    @Test
    @WithMockUser(username = "rohan@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/addresses - first address automatically becomes default")
    void shouldAddAddressAndAutoSetDefault() throws Exception {
        AddressRequest request = AddressRequest.builder()
                .recipientName("Rohan Sharma")
                .recipientPhone("9811223344")
                .streetAddress("B-42, Sector 15")
                .city("Noida")
                .state("Uttar Pradesh")
                .postalCode("201301")
                .addressType("HOME")
                .isDefault(false)
                .build();

        mockMvc.perform(post("/api/v1/addresses")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isDefault").value(true))
                .andExpect(jsonPath("$.data.postalCode").value("201301"));
    }

    @Test
    @WithMockUser(username = "rohan@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/v1/reviews - marks review as verified purchase when delivered order exists")
    void shouldSubmitVerifiedPurchaseReviewAndComputeSummary() throws Exception {
        Address addr = addressRepository.save(Address.builder()
                .user(customer)
                .recipientName("Rohan Sharma")
                .recipientPhone("9811223344")
                .streetAddress("B-42, Sector 15")
                .city("Noida")
                .state("Uttar Pradesh")
                .postalCode("201301")
                .isDefault(true)
                .build());

        Order deliveredOrder = orderRepository.save(Order.builder()
                .user(customer)
                .deliveryAddress(addr)
                .orderNumber("CK-TEST-DELIVERED-01")
                .orderStatus(OrderStatus.DELIVERED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentMethod("UPI")
                .deliveryDate(LocalDate.now().minusDays(1))
                .deliveryTimeSlot("10:00 AM - 01:00 PM")
                .itemsSubtotal(new BigDecimal("550.00"))
                .taxAmount(new BigDecimal("27.50"))
                .deliveryFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(new BigDecimal("577.50"))
                .build());

        OrderItem item = orderItemRepository.save(OrderItem.builder()
                .order(deliveredOrder)
                .variant(variant)
                .productNameSnapshot(product.getName())
                .variantSkuSnapshot(variant.getSku())
                .weightInKgSnapshot(variant.getWeightInKg())
                .unitPrice(variant.getPrice())
                .quantity(1)
                .totalPrice(variant.getPrice())
                .build());

        deliveredOrder.getItems().add(item);
        orderRepository.saveAndFlush(deliveredOrder);
        
        ReviewRequest reviewReq = ReviewRequest.builder()
                .productId(product.getId())
                .rating(5)
                .title("Super moist and fresh!")
                .comment("Best red velvet cake we have ordered.")
                .build();

        mockMvc.perform(post("/api/v1/reviews")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.rating").value(5))
                .andExpect(jsonPath("$.data.isVerifiedPurchase").value(true));

        // Verify public rating summary endpoint
        mockMvc.perform(get("/api/v1/reviews/product/" + product.getId() + "/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating").value(5.0))
                .andExpect(jsonPath("$.data.totalReviews").value(1));
    }

    @Test
    @WithMockUser(username = "rohan@cakehub.com", roles = {"CUSTOMER"})
    @DisplayName("PUT /api/v1/users/me - updates customer profile name and phone")
    void shouldUpdateCustomerProfile() throws Exception {
        UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                .fullName("Rohan K. Sharma")
                .phoneNumber("9988776655")
                .build();

        mockMvc.perform(put("/api/v1/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Rohan K. Sharma"))
                .andExpect(jsonPath("$.data.phoneNumber").value("9988776655"));

        User updated = userRepository.findById(customer.getId()).orElseThrow();
        assertThat(updated.getFullName()).isEqualTo("Rohan K. Sharma");
    }
}