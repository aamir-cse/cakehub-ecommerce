package com.cakehub.service;

import com.cakehub.dto.address.AddressRequest;
import com.cakehub.dto.address.AddressResponse;

import java.util.List;

public interface AddressService {

    AddressResponse addAddress(String email, AddressRequest request);

    List<AddressResponse> getUserAddresses(String email);

    AddressResponse updateAddress(String email, Long addressId, AddressRequest request);

    AddressResponse setDefaultAddress(String email, Long addressId);

    void deleteAddress(String email, Long addressId);
}