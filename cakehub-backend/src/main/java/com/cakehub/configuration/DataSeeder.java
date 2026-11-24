package com.cakehub.configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cakehub.entity.Category;
import com.cakehub.entity.Coupon;
import com.cakehub.entity.Product;
import com.cakehub.entity.ProductVariant;
import com.cakehub.entity.Role;
import com.cakehub.entity.User;
import com.cakehub.repository.CategoryRepository;
import com.cakehub.repository.CouponRepository;
import com.cakehub.repository.ProductRepository;
import com.cakehub.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedCatalog();
        seedCoupons();
    }

    private void seedUsers() {
        createUserIfMissing("CakeHub Admin", "admin@cakehub.com", "Admin@123", "9999999999", Role.ROLE_ADMIN);
        createUserIfMissing("Head Pastry Chef", "baker@cakehub.com", "Baker@123", "8888888888", Role.ROLE_BAKER);
        createUserIfMissing("Demo Customer", "customer@cakehub.com", "Customer@123", "7777777777", Role.ROLE_CUSTOMER);
    }

    private void createUserIfMissing(String fullName, String email, String rawPassword, String phone, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .phoneNumber(phone)
                    .role(role)
                    .isActive(true)
                    .isEmailVerified(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded demo user: {}", email);
        }
    }

    private void seedCatalog() {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category chocolate = categoryRepository.save(Category.builder()
                .name("Chocolate & Truffle")
                .slug("chocolate-and-truffle")
                .description("Decadent dark, milk, and Belgian chocolate creations")
                .isActive(true)
                .build());

        Category fruit = categoryRepository.save(Category.builder()
                .name("Fresh Fruit & Cream")
                .slug("fresh-fruit-and-cream")
                .description("Light vanilla sponges layered with seasonal fruits and whipped cream")
                .isActive(true)
                .build());

        Category cheesecake = categoryRepository.save(Category.builder()
                .name("Artisanal Cheesecakes")
                .slug("artisanal-cheesecakes")
                .description("Creamy baked and cold-set New York style cheesecakes")
                .isActive(true)
                .build());

        Product dutchTruffle = Product.builder()
                .category(chocolate)
                .name("Belgian Dark Dutch Truffle")
                .slug("belgian-dark-dutch-truffle")
                .description("Rich 70% dark chocolate sponge layered with silky chocolate ganache.")
                .basePrice(new BigDecimal("549.00"))
                .isEggless(true)
                .isFeatured(true)
                .isActive(true)
                .prepTimeHours(4)
                .build();

        ProductVariant truffle500 = ProductVariant.builder()
                .product(dutchTruffle)
                .sku("CHC-TRF-500")
                .weightInKg(new BigDecimal("0.5"))
                .price(new BigDecimal("549.00"))
                .stockQuantity(30)
                .isActive(true)
                .build();

        ProductVariant truffle1000 = ProductVariant.builder()
                .product(dutchTruffle)
                .sku("CHC-TRF-1000")
                .weightInKg(new BigDecimal("1.0"))
                .price(new BigDecimal("999.00"))
                .stockQuantity(20)
                .isActive(true)
                .build();

        dutchTruffle.setVariants(List.of(truffle500, truffle1000));

        Product strawberryGateau = Product.builder()
                .category(fruit)
                .name("Fresh Strawberry Vanilla Gateau")
                .slug("fresh-strawberry-vanilla-gateau")
                .description("Madagascar vanilla sponge topped with glazed strawberries and mascarpone cream.")
                .basePrice(new BigDecimal("499.00"))
                .isEggless(true)
                .isFeatured(true)
                .isActive(true)
                .prepTimeHours(3)
                .build();

        ProductVariant berry500 = ProductVariant.builder()
                .product(strawberryGateau)
                .sku("FRT-STR-500")
                .weightInKg(new BigDecimal("0.5"))
                .price(new BigDecimal("499.00"))
                .stockQuantity(25)
                .isActive(true)
                .build();

        strawberryGateau.setVariants(List.of(berry500));

        Product biscoffCheese = Product.builder()
                .category(cheesecake)
                .name("Lotus Biscoff Baked Cheesecake")
                .slug("lotus-biscoff-baked-cheesecake")
                .description("Caramelized biscuit crust with velvety cream cheese and melted Biscoff spread.")
                .basePrice(new BigDecimal("799.00"))
                .isEggless(true)
                .isFeatured(true)
                .isActive(true)
                .prepTimeHours(6)
                .build();

        ProductVariant biscoff750 = ProductVariant.builder()
                .product(biscoffCheese)
                .sku("CHS-BIS-750")
                .weightInKg(new BigDecimal("0.75"))
                .price(new BigDecimal("799.00"))
                .stockQuantity(15)
                .isActive(true)
                .build();

        biscoffCheese.setVariants(List.of(biscoff750));

        productRepository.saveAll(List.of(dutchTruffle, strawberryGateau, biscoffCheese));
        log.info("Seeded initial CakeHub categories and products");
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) {
            return;
        }

        couponRepository.saveAll(List.of(
                Coupon.builder()
                        .code("FIRST100")
                        .discountType("FLAT")
                        .discountValue(new BigDecimal("100.00"))
                        .minOrderAmount(new BigDecimal("499.00"))
                        .validUntil(LocalDate.now().plusYears(1))
                        .isActive(true)
                        .build(),
                Coupon.builder()
                        .code("CAKE20")
                        .discountType("PERCENT")
                        .discountValue(new BigDecimal("20.00"))
                        .minOrderAmount(new BigDecimal("699.00"))
                        .maxDiscountAmount(new BigDecimal("250.00"))
                        .validUntil(LocalDate.now().plusYears(1))
                        .isActive(true)
                        .build()
        ));
        log.info("Seeded default promo coupons: FIRST100, CAKE20");
    }
}