package com.cakehub.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cakehub.dto.address.AddressRequest;
import com.cakehub.dto.address.AddressResponse;
import com.cakehub.entity.Address;
import com.cakehub.entity.User;
import com.cakehub.mapper.AddressMapper;
import com.cakehub.repository.AddressRepository;
import com.cakehub.repository.UserRepository;
import com.cakehub.service.AddressService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final AddressMapper addressMapper;

    @Override
    @Transactional
    public AddressResponse addAddress(String email, AddressRequest request) {
        User user = getActiveUser(email);
        List<Address> existingAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());

        Address address = addressMapper.toEntity(request);
        address.setUser(user);

        // If this is the user's first address or explicitly marked default, clear previous defaults
        if (existingAddresses.isEmpty() || Boolean.TRUE.equals(request.getIsDefault())) {
            clearExistingDefault(user.getId());
            address.setIsDefault(true);
        }

        Address saved = addressRepository.save(address);
        log.info("Added new address ID {} for user {}", saved.getId(), email);
        return addressMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(String email) {
        User user = getActiveUser(email);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = getActiveUser(email);
        Address address = getOwnedAddress(user.getId(), addressId);

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            clearExistingDefault(user.getId());
        }

        addressMapper.updateEntityFromRequest(request, address);
        Address updated = addressRepository.save(address);
        log.info("Updated address ID {} for user {}", addressId, email);
        return addressMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(String email, Long addressId) {
        User user = getActiveUser(email);
        Address address = getOwnedAddress(user.getId(), addressId);

        clearExistingDefault(user.getId());
        address.setIsDefault(true);
        Address updated = addressRepository.save(address);
        log.info("Set address ID {} as default for user {}", addressId, email);
        return addressMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getActiveUser(email);
        Address address = getOwnedAddress(user.getId(), addressId);
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());

        addressRepository.delete(address);
        log.info("Deleted address ID {} for user {}", addressId, email);

        // Promote most recent remaining address to default if the deleted one was default
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                Address nextDefault = remaining.get(0);
                nextDefault.setIsDefault(true);
                addressRepository.save(nextDefault);
            }
        }
    }

    private void clearExistingDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existing -> {
            existing.setIsDefault(false);
            addressRepository.save(existing);
        });
    }

    private User getActiveUser(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found or inactive: " + email));
    }

    private Address getOwnedAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found with ID: " + addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Address does not belong to the authenticated user");
        }
        return address;
    }
}