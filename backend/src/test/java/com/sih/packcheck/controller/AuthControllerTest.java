package com.sih.packcheck.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.packcheck.dto.LoginRequest;
import com.sih.packcheck.entity.User;
import com.sih.packcheck.repository.UserRepository;
import com.sih.packcheck.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();

        // Create test officer user
        User officer = new User(
                "Officer Test",
                "officer@packcheck.ai",
                passwordEncoder.encode("PackCheck@123"),
                User.Role.ENFORCEMENT_OFFICER,
                "Zone-A"
        );
        userRepository.save(officer);
    }

    @Test
    public void testLoginSuccessWithValidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("officer@packcheck.ai", "PackCheck@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.token_type", is("Bearer")))
                .andExpect(jsonPath("$.expires_in", greaterThan(0)))
                .andExpect(jsonPath("$.user.email", is("officer@packcheck.ai")))
                .andExpect(jsonPath("$.user.role", is("ENFORCEMENT_OFFICER")))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.user.password_hash").doesNotExist());
    }

    @Test
    public void testLoginFailsWithInvalidPassword() throws Exception {
        LoginRequest request = new LoginRequest("officer@packcheck.ai", "WrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is("UNAUTHORIZED")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    public void testLoginFailsWithUnknownEmail() throws Exception {
        LoginRequest request = new LoginRequest("nonexistent@packcheck.ai", "PackCheck@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is("UNAUTHORIZED")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }
}
