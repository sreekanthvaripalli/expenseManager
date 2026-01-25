package com.example.expensemanager.repository;

import com.example.expensemanager.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail_WhenUserExists() {
        // Create and persist a user
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setFullName("Test User");
        user.setBaseCurrency("USD");

        User savedUser = entityManager.persistAndFlush(user);

        // Test findByEmail
        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        assertTrue(foundUser.isPresent());
        assertEquals("test@example.com", foundUser.get().getEmail());
        assertEquals("Test User", foundUser.get().getFullName());
        assertEquals("USD", foundUser.get().getBaseCurrency());
    }

    @Test
    void testFindByEmail_WhenUserDoesNotExist() {
        // Test findByEmail with non-existent email
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        assertFalse(foundUser.isPresent());
    }

    @Test
    void testSaveAndFindById() {
        // Create and save a user
        User user = new User();
        user.setEmail("save@example.com");
        user.setPasswordHash("password");
        user.setFullName("Save User");

        User savedUser = userRepository.save(user);

        // Find by ID
        Optional<User> foundUser = userRepository.findById(savedUser.getId());

        assertTrue(foundUser.isPresent());
        assertEquals("save@example.com", foundUser.get().getEmail());
    }
}
