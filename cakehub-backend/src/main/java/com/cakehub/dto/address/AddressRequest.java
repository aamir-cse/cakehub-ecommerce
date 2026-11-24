package com.cakehub.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Recipient name is required")
    @Size(max = 120, message = "Recipient name cannot exceed 120 characters")
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Recipient phone must be a valid 10-digit number")
    private String recipientPhone;

    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address cannot exceed 255 characters")
    private String streetAddress;

    @Size(max = 100, message = "Apartment/suite cannot exceed 100 characters")
    private String apartmentSuite;

    @Size(max = 150, message = "Landmark cannot exceed 150 characters")
    private String landmark;

    @NotBlank(message = "City is required")
    @Size(max = 80, message = "City cannot exceed 80 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 80, message = "State cannot exceed 80 characters")
    private String state;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Postal code must be a valid 6-digit PIN code")
    private String postalCode;

    @Size(max = 40, message = "Address type cannot exceed 40 characters")
    private String addressType; // e.g., HOME, WORK, OTHER

    @Builder.Default
    private Boolean isDefault = false;
}