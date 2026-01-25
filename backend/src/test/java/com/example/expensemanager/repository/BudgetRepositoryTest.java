package com.example.expensemanager.repository;

import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class BudgetRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BudgetRepository budgetRepository;

    @Test
    void testFindByUserAndYearAndMonth_WithCategoryBudgets() {
        // Create user and categories
        User user = createAndPersistUser("test@example.com");
        Category category1 = createAndPersistCategory("Food", user);
        Category category2 = createAndPersistCategory("Transport", user);

        // Create budgets for October 2023
        Budget budget1 = createBudget(user, category1, 2023, 10, new BigDecimal("500.00"));
        Budget budget2 = createBudget(user, category2, 2023, 10, new BigDecimal("300.00"));
        Budget budget3 = createBudget(user, null, 2023, 10, new BigDecimal("1000.00")); // Overall budget

        // Create budget for different month
        Budget budget4 = createBudget(user, category1, 2023, 11, new BigDecimal("600.00"));

        entityManager.persistAndFlush(budget1);
        entityManager.persistAndFlush(budget2);
        entityManager.persistAndFlush(budget3);
        entityManager.persistAndFlush(budget4);

        // Test findByUserAndYearAndMonth for October 2023
        List<Budget> budgets = budgetRepository.findByUserAndYearAndMonth(user, 2023, 10);

        assertEquals(3, budgets.size());
        assertTrue(budgets.contains(budget1));
        assertTrue(budgets.contains(budget2));
        assertTrue(budgets.contains(budget3));
        assertFalse(budgets.contains(budget4));
    }

    @Test
    void testFindByUserAndYearAndMonth_NoBudgets() {
        // Create user
        User user = createAndPersistUser("test@example.com");

        // Test findByUserAndYearAndMonth with no budgets
        List<Budget> budgets = budgetRepository.findByUserAndYearAndMonth(user, 2023, 10);

        assertTrue(budgets.isEmpty());
    }

    @Test
    void testFindByUserAndYearAndMonth_DifferentUsers() {
        // Create two users
        User user1 = createAndPersistUser("user1@example.com");
        User user2 = createAndPersistUser("user2@example.com");
        Category category1 = createAndPersistCategory("Food", user1);
        Category category2 = createAndPersistCategory("Food", user2);

        // Create budgets for both users
        Budget budget1 = createBudget(user1, category1, 2023, 10, new BigDecimal("500.00"));
        Budget budget2 = createBudget(user2, category2, 2023, 10, new BigDecimal("400.00"));

        entityManager.persistAndFlush(budget1);
        entityManager.persistAndFlush(budget2);

        // Test findByUserAndYearAndMonth for user1
        List<Budget> budgetsUser1 = budgetRepository.findByUserAndYearAndMonth(user1, 2023, 10);
        assertEquals(1, budgetsUser1.size());
        assertEquals(budget1, budgetsUser1.get(0));

        // Test findByUserAndYearAndMonth for user2
        List<Budget> budgetsUser2 = budgetRepository.findByUserAndYearAndMonth(user2, 2023, 10);
        assertEquals(1, budgetsUser2.size());
        assertEquals(budget2, budgetsUser2.get(0));
    }

    @Test
    void testCountByUser_WithBudgets() {
        // Create user
        User user = createAndPersistUser("test@example.com");
        Category category = createAndPersistCategory("Food", user);

        // Create multiple budgets
        Budget budget1 = createBudget(user, category, 2023, 10, new BigDecimal("500.00"));
        Budget budget2 = createBudget(user, null, 2023, 11, new BigDecimal("1000.00"));
        Budget budget3 = createBudget(user, category, 2024, 1, new BigDecimal("600.00"));

        entityManager.persistAndFlush(budget1);
        entityManager.persistAndFlush(budget2);
        entityManager.persistAndFlush(budget3);

        // Test countByUser
        long count = budgetRepository.countByUser(user);
        assertEquals(3, count);
    }

    @Test
    void testCountByUser_NoBudgets() {
        // Create user with no budgets
        User user = createAndPersistUser("test@example.com");

        // Test countByUser
        long count = budgetRepository.countByUser(user);
        assertEquals(0, count);
    }

    @Test
    void testCountByUser_DifferentUsers() {
        // Create two users
        User user1 = createAndPersistUser("user1@example.com");
        User user2 = createAndPersistUser("user2@example.com");
        Category category1 = createAndPersistCategory("Food", user1);
        Category category2 = createAndPersistCategory("Food", user2);

        // Create budgets for user1
        Budget budget1 = createBudget(user1, category1, 2023, 10, new BigDecimal("500.00"));
        Budget budget2 = createBudget(user1, null, 2023, 11, new BigDecimal("1000.00"));
        entityManager.persistAndFlush(budget1);
        entityManager.persistAndFlush(budget2);

        // Create budget for user2
        Budget budget3 = createBudget(user2, category2, 2023, 10, new BigDecimal("400.00"));
        entityManager.persistAndFlush(budget3);

        // Test countByUser for user1
        long countUser1 = budgetRepository.countByUser(user1);
        assertEquals(2, countUser1);

        // Test countByUser for user2
        long countUser2 = budgetRepository.countByUser(user2);
        assertEquals(1, countUser2);
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

    private Budget createBudget(User user, Category category, int year, int month, BigDecimal limitAmount) {
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setYear(year);
        budget.setMonth(month);
        budget.setLimitAmount(limitAmount);
        return budget;
    }
}
