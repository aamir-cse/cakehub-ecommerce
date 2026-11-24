package com.cakehub.configuration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import jakarta.persistence.EntityManagerFactory;

/**
 * Activates Spring Data JPA auditing across the application.
 * Configured to activate only when an EntityManagerFactory is present.
 */
@Configuration
@EnableJpaAuditing
@ConditionalOnBean(EntityManagerFactory.class)
public class AuditingConfig {
}