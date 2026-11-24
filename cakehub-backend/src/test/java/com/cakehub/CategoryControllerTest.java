package com.cakehub;

import com.cakehub.dto.catalog.CategoryRequest;
import com.cakehub.entity.Category;
import com.cakehub.repository.CategoryRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/v1/categories - public users can list active categories")
    void shouldReturnActiveCategoriesPublicly() throws Exception {
        Category active = Category.builder()
                .name("Birthday Cakes")
                .slug("birthday-cakes")
                .description("Special cakes for birthday bashes")
                .isActive(true)
                .build();
        categoryRepository.save(active);

        Category inactive = Category.builder()
                .name("Winter Special 2024")
                .slug("winter-special-2024")
                .isActive(false)
                .build();
        categoryRepository.save(inactive);

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].slug").value("birthday-cakes"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/categories - admin can create a new category with generated slug")
    void shouldCreateCategoryWhenAdmin() throws Exception {
        CategoryRequest request = CategoryRequest.builder()
                .name("Red Velvet & Cheesecakes")
                .description("Creamy gourmet cakes")
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Red Velvet & Cheesecakes"))
                .andExpect(jsonPath("$.data.slug").value("red-velvet-and-cheesecakes"));

        assertThat(categoryRepository.existsBySlug("red-velvet-and-cheesecakes")).isTrue();
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("POST /api/v1/categories - customer role receives 403 Forbidden")
    void shouldRejectCategoryCreationForNonAdmin() throws Exception {
        CategoryRequest request = CategoryRequest.builder()
                .name("Hacker Category")
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}