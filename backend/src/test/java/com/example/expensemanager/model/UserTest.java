package com.example.expensemanager.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testDefaultConstructor() {
        User user = new User();
        assertNotNull(user);
    }

    @Test
    void testSettersAndGetters() {
        User user = new User();

        // Test email
        user.setEmail("test@example.com");
        assertEquals("test@example.com", user.getEmail());

        // Test passwordHash
        user.setPasswordHash("hashedPassword");
        assertEquals("hashedPassword", user.getPasswordHash());

        // Test fullName
        user.setFullName("John Doe");
        assertEquals("John Doe", user.getFullName());

        // Test baseCurrency
        user.setBaseCurrency("USD");
        assertEquals("USD", user.getBaseCurrency());
    }

    @Test
    void testAllFields() {
        User user = new User();

        user.setEmail("user@test.com");
        user.setPasswordHash("password123");
        user.setFullName("Jane Smith");
        user.setBaseCurrency("EUR");

        assertEquals("user@test.com", user.getEmail());
        assertEquals("password123", user.getPasswordHash());
        assertEquals("Jane Smith", user.getFullName());
        assertEquals("EUR", user.getBaseCurrency());
    }
}
