package com.example.expensemanager.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDate;

class ExpenseTest {

    @Test
    void testDefaultConstructor() {
        Expense expense = new Expense();
        assertNotNull(expense);
    }

    @Test
    void testSettersAndGetters() {
        Expense expense = new Expense();
        User user = new User();
        user.setEmail("test@example.com");
        Category category = new Category();
        category.setName("Food");

        // Test user
        expense.setUser(user);
        assertEquals(user, expense.getUser());

        // Test category
        expense.setCategory(category);
        assertEquals(category, expense.getCategory());

        // Test amount
        BigDecimal amount = new BigDecimal("50.00");
        expense.setAmount(amount);
        assertEquals(amount, expense.getAmount());

        // Test date
        LocalDate date = LocalDate.of(2023, 10, 15);
        expense.setDate(date);
        assertEquals(date, expense.getDate());

        // Test description
        expense.setDescription("Lunch at restaurant");
        assertEquals("Lunch at restaurant", expense.getDescription());

        // Test recurring
        expense.setRecurring(true);
        assertTrue(expense.isRecurring());

        // Test originalCurrency
        expense.setOriginalCurrency("EUR");
        assertEquals("EUR", expense.getOriginalCurrency());

        // Test originalAmount
        BigDecimal originalAmount = new BigDecimal("45.00");
        expense.setOriginalAmount(originalAmount);
        assertEquals(originalAmount, expense.getOriginalAmount());
    }

    @Test
    void testAllFields() {
        Expense expense = new Expense();
        User user = new User();
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        Category category = new Category();
        category.setName("Transportation");
        category.setColor("#FF0000");

        expense.setUser(user);
        expense.setCategory(category);
        expense.setAmount(new BigDecimal("25.50"));
        expense.setDate(LocalDate.of(2023, 11, 20));
        expense.setDescription("Bus fare");
        expense.setRecurring(false);
        expense.setOriginalCurrency("USD");
        expense.setOriginalAmount(new BigDecimal("25.50"));

        assertEquals(user, expense.getUser());
        assertEquals(category, expense.getCategory());
        assertEquals(new BigDecimal("25.50"), expense.getAmount());
        assertEquals(LocalDate.of(2023, 11, 20), expense.getDate());
        assertEquals("Bus fare", expense.getDescription());
        assertFalse(expense.isRecurring());
        assertEquals("USD", expense.getOriginalCurrency());
        assertEquals(new BigDecimal("25.50"), expense.getOriginalAmount());
    }
}
