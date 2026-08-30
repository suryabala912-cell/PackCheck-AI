package com.sih.packcheck.controller;

import com.sih.packcheck.dto.LoginRequest;
import com.sih.packcheck.dto.LoginResponse;
import com.sih.packcheck.dto.UserResponseDto;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.UserRepository;
import com.sih.packcheck.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "UNAUTHORIZED");
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Optional<User> userOptional = userRepository.findByEmail(normalizedEmail);

        if (userOptional.isEmpty()) {
            logger.warn("Login failed: User with email '{}' not found", normalizedEmail);
            return buildUnauthorizedResponse();
        }

        User user = userOptional.get();

        if (!user.isActive()) {
            logger.warn("Login failed: Account for user '{}' is inactive", normalizedEmail);
            return buildUnauthorizedResponse();
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            logger.warn("Login failed: Password mismatch for user '{}'", normalizedEmail);
            return buildUnauthorizedResponse();
        }

        String token = jwtService.generateToken(user);
        long expiresIn = jwtService.getExpirationInSeconds();
        UserResponseDto userDto = new UserResponseDto(user);

        LoginResponse response = new LoginResponse(token, "Bearer", expiresIn, userDto);
        logger.info("User '{}' ({}) successfully logged in.", user.getEmail(), user.getRole());

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, String>> buildUnauthorizedResponse() {
        Map<String, String> error = new HashMap<>();
        error.put("status", "UNAUTHORIZED");
        error.put("message", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
