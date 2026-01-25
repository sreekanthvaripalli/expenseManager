package com.example.expensemanager.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;

class BudgetTest {

    @Test
    void testDefaultConstructor() {
        Budget budget = new Budget();
        assertNotNull(budget);
    }

    @Test
    void testSettersAndGetters() {
        Budget budget = new Budget();
        User user = new User();
        user.setEmail("test@example.com");
        Category category = new Category();
        category.setName("Food");

        // Test user
        budget.setUser(user);
        assertEquals(user, budget.getUser());

        // Test category
        budget.setCategory(category);
        assertEquals(category, budget.getCategory());

        // Test year
        budget.setYear(2023);
        assertEquals(2023, budget.getYear());

        // Test month
        budget.setMonth(10);
        assertEquals(10, budget.getMonth());

        // Test limitAmount
        BigDecimal limit = new BigDecimal("500.00");
        budget.setLimitAmount(limit);
        assertEquals(limit, budget.getLimitAmount());
    }

    @Test
    void testAllFields() {
        Budget budget = new Budget();
        User user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        Category category = new Category();
        category.setName("Entertainment");
        category.setColor("#FFFF00");

        budget.setUser(user);
        budget.setCategory(category);
        budget.setYear(2024);
        budget.setMonth(5);
        budget.setLimitAmount(new BigDecimal("300.00"));

        assertEquals(user, budget.getUser());
        assertEquals(category, budget.getCategory());
        assertEquals(2024, budget.getYear());
        assertEquals(5, budget.getMonth());
        assertEquals(new BigDecimal("300.00"), budget.getLimitAmount());
    }

    @Test
    void testNullCategory() {
        Budget budget = new Budget();
        User user = new User();
        user.setEmail("user@example.com");

        budget.setUser(user);
        budget.setCategory(null); // Overall budget
        budget.setYear(2024);
        budget.setMonth(1);
        budget.setLimitAmount(new BigDecimal("1000.00"));

        assertEquals(user, budget.getUser());
        assertNull(budget.getCategory());
        assertEquals(2024, budget.getYear());
        assertEquals(1, budget.getMonth());
        assertEquals(new BigDecimal("1000.00"), budget.getLimitAmount());
    }
}
