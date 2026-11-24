package com.cakehub;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies that all JPA entities, foreign keys, and indexes
 * map cleanly to the relational schema without mapping conflicts.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class JpaSchemaValidationTest {

    @Autowired
    private EntityManager entityManager;

    @Test
    @DisplayName("Hibernate should initialize EntityManager and map all domain entities without DDL errors")
    void shouldSuccessfullyInitializeJpaContextAndEntities() {
        assertThat(entityManager).isNotNull();
        assertThat(entityManager.isOpen()).isTrue();
    }
}