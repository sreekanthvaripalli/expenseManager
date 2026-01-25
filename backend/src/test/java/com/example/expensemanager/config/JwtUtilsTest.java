package com.example.expensemanager.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Set the secret using reflection
        ReflectionTestUtils.setField(jwtUtils, "secret", "expenseManagerSecretKeyThatIsAtLeast32CharactersLong");
        ReflectionTestUtils.setField(jwtUtils, "expiration", 86400000L);
        userDetails = User.withUsername("test@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    void testGenerateToken() {
        String token = jwtUtils.generateToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        String token = jwtUtils.generateToken(userDetails);
        String extractedUsername = jwtUtils.extractUsername(token);
        assertEquals("test@example.com", extractedUsername);
    }

    @Test
    void testValidateToken_ValidToken() {
        String token = jwtUtils.generateToken(userDetails);
        Boolean isValid = jwtUtils.validateToken(token, userDetails);
        assertTrue(isValid);
    }

    @Test
    void testValidateToken_InvalidUsername() {
        String token = jwtUtils.generateToken(userDetails);
        UserDetails differentUser = User.withUsername("other@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .build();
        Boolean isValid = jwtUtils.validateToken(token, differentUser);
        assertFalse(isValid);
    }

    @Test
    void testIsTokenExpired_NotExpired() {
        String token = jwtUtils.generateToken(userDetails);
        assertFalse(jwtUtils.isTokenExpired(token));
    }
}
