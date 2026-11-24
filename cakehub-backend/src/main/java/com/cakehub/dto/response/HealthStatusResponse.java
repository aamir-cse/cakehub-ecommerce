package com.cakehub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload representing system health and runtime metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthStatusResponse {

    private String application;
    private String status;
    private String version;
    private String environment;
}