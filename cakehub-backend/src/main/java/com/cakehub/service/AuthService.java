package com.cakehub.service;

import com.cakehub.dto.auth.AuthResponse;
import com.cakehub.dto.auth.LoginRequest;
import com.cakehub.dto.auth.RegisterRequest;

/**
 * Service contract for platform user registration, authentication, and token management.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);
}