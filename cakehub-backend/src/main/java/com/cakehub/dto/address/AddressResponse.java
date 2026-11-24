package com.cakehub.dto.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private Long id;
    private String recipientName;
    private String recipientPhone;
    private String streetAddress;
    private String apartmentSuite;
    private String landmark;
    private String city;
    private String state;
    private String postalCode;
    private String addressType;
    private Boolean isDefault;
    private Instant createdAt;
}