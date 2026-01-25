package com.example.expensemanager.repository;

import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ExpenseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Test
    void testFindFiltered_AllParameters() {
        // Create user and category
        User user = createAndPersistUser("test@example.com");
        Category category = createAndPersistCategory("Food", user);

        // Create expenses
        Expense expense1 = createExpense(user, category, LocalDate.of(2023, 10, 15), new BigDecimal("50.00"));
        Expense expense2 = createExpense(user, category, LocalDate.of(2023, 10, 20), new BigDecimal("30.00"));
        Expense expense3 = createExpense(user, null, LocalDate.of(2023, 10, 25), new BigDecimal("20.00")); // Different category

        entityManager.persistAndFlush(expense1);
        entityManager.persistAndFlush(expense2);
        entityManager.persistAndFlush(expense3);

        // Test findFiltered with all parameters
        List<Expense> expenses = expenseRepository.findFiltered(
                user, category, LocalDate.of(2023, 10, 10), LocalDate.of(2023, 10, 25)
        );

        assertEquals(2, expenses.size());
        assertTrue(expenses.contains(expense1));
        assertTrue(expenses.contains(expense2));
        assertFalse(expenses.contains(expense3));
    }

    @Test
    void testFindFiltered_NoCategoryFilter() {
        // Create user and categories
        User user = createAndPersistUser("test@example.com");
        Category category1 = createAndPersistCategory("Food", user);
        Category category2 = createAndPersistCategory("Transport", user);

        // Create expenses
        Expense expense1 = createExpense(user, category1, LocalDate.of(2023, 10, 15), new BigDecimal("50.00"));
        Expense expense2 = createExpense(user, category2, LocalDate.of(2023, 10, 20), new BigDecimal("30.00"));

        entityManager.persistAndFlush(expense1);
        entityManager.persistAndFlush(expense2);

        // Test findFiltered with null category
        List<Expense> expenses = expenseRepository.findFiltered(
                user, null, LocalDate.of(2023, 10, 10), LocalDate.of(2023, 10, 25)
        );

        assertEquals(2, expenses.size());
        assertTrue(expenses.contains(expense1));
        assertTrue(expenses.contains(expense2));
    }

    @Test
    void testFindFiltered_NoDateFilters() {
        // Create user and category
        User user = createAndPersistUser("test@example.com");
        Category category = createAndPersistCategory("Food", user);

        // Create expenses
        Expense expense1 = createExpense(user, category, LocalDate.of(2023, 10, 15), new BigDecimal("50.00"));
        Expense expense2 = createExpense(user, category, LocalDate.of(2023, 11, 15), new BigDecimal("30.00"));

        entityManager.persistAndFlush(expense1);
        entityManager.persistAndFlush(expense2);

        // Test findFiltered with null dates
        List<Expense> expenses = expenseRepository.findFiltered(user, category, null, null);

        assertEquals(2, expenses.size());
        assertTrue(expenses.contains(expense1));
        assertTrue(expenses.contains(expense2));
    }

    @Test
    void testFindFiltered_DateRange() {
        // Create user and category
        User user = createAndPersistUser("test@example.com");
        Category category = createAndPersistCategory("Food", user);

        // Create expenses
        Expense expense1 = createExpense(user, category, LocalDate.of(2023, 10, 10), new BigDecimal("50.00")); // Before range
        Expense expense2 = createExpense(user, category, LocalDate.of(2023, 10, 15), new BigDecimal("30.00")); // In range
        Expense expense3 = createExpense(user, category, LocalDate.of(2023, 10, 25), new BigDecimal("20.00")); // In range
        Expense expense4 = createExpense(user, category, LocalDate.of(2023, 11, 1), new BigDecimal("15.00"));  // After range

        entityManager.persistAndFlush(expense1);
        entityManager.persistAndFlush(expense2);
        entityManager.persistAndFlush(expense3);
        entityManager.persistAndFlush(expense4);

        // Test findFiltered with date range
        List<Expense> expenses = expenseRepository.findFiltered(
                user, category, LocalDate.of(2023, 10, 12), LocalDate.of(2023, 10, 30)
        );

        assertEquals(2, expenses.size());
        assertTrue(expenses.contains(expense2));
        assertTrue(expenses.contains(expense3));
        assertFalse(expenses.contains(expense1));
        assertFalse(expenses.contains(expense4));
    }

    @Test
    void testFindFiltered_DifferentUsers() {
        // Create two users
        User user1 = createAndPersistUser("user1@example.com");
        User user2 = createAndPersistUser("user2@example.com");
        Category category1 = createAndPersistCategory("Food", user1);
        Category category2 = createAndPersistCategory("Food", user2);

        // Create expenses for both users
        Expense expense1 = createExpense(user1, category1, LocalDate.of(2023, 10, 15), new BigDecimal("50.00"));
        Expense expense2 = createExpense(user2, category2, LocalDate.of(2023, 10, 15), new BigDecimal("30.00"));

        entityManager.persistAndFlush(expense1);
        entityManager.persistAndFlush(expense2);

        // Test findFiltered for user1
        List<Expense> expensesUser1 = expenseRepository.findFiltered(user1, null, null, null);
        assertEquals(1, expensesUser1.size());
        assertEquals(expense1, expensesUser1.get(0));

        // Test findFiltered for user2
        List<Expense> expensesUser2 = expenseRepository.findFiltered(user2, null, null, null);
        assertEquals(1, expensesUser2.size());
        assertEquals(expense2, expensesUser2.get(0));
    }

    private User createAndPersistUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("password");
        user.setFullName("Test User");
        return entityManager.persistAndFlush(user);
    }

    private Category createAndPersistCategory(String name, User user) {
        Category category = new Category();
        category.setName(name);
        category.setColor("#FF5733");
        category.setUser(user);
        return entityManager.persistAndFlush(category);
    }

    private Expense createExpense(User user, Category category, LocalDate date, BigDecimal amount) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setAmount(amount);
        expense.setDate(date);
        expense.setDescription("Test expense");
        expense.setOriginalCurrency("USD");
        expense.setOriginalAmount(amount);
        return expense;
    }
}
