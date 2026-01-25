package com.example.expensemanager.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CategoryTest {

    @Test
    void testDefaultConstructor() {
        Category category = new Category();
        assertNotNull(category);
    }

    @Test
    void testSettersAndGetters() {
        Category category = new Category();
        User user = new User();
        user.setEmail("test@example.com");

        // Test name
        category.setName("Food");
        assertEquals("Food", category.getName());

        // Test color
        category.setColor("#FF5733");
        assertEquals("#FF5733", category.getColor());

        // Test user
        category.setUser(user);
        assertEquals(user, category.getUser());
    }

    @Test
    void testAllFields() {
        Category category = new Category();
        User user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");

        category.setName("Transportation");
        category.setColor("#00FF00");
        category.setUser(user);

        assertEquals("Transportation", category.getName());
        assertEquals("#00FF00", category.getColor());
        assertEquals(user, category.getUser());
    }
}
