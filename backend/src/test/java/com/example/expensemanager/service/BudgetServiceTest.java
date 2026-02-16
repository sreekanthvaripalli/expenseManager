package com.example.expensemanager.service;

import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetStatusResponse;
import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.BudgetRepository;
import com.example.expensemanager.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseService expenseService;

    private BudgetService budgetService;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        budgetService = new BudgetService(budgetRepository, categoryRepository, expenseService);
        
        user = new User();
        user.setEmail("test@example.com");
        user.setBaseCurrency("USD");

        category = new Category();
        category.setName("Food");
        category.setUser(user);
    }

    private Budget createBudget(Long id, User user, Category category, int year, int month, BigDecimal amount) {
        Budget budget = new Budget();
        // Use reflection or directly set via fields if setter not available
        try {
            var idField = Budget.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(budget, id);
        } catch (Exception e) {
            // Ignore if can't set
        }
        budget.setUser(user);
        budget.setCategory(category);
        budget.setYear(year);
        budget.setMonth(month);
        budget.setLimitAmount(amount);
        return budget;
    }

    @Test
    void testCreateBudget_WithCategory() {
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("1000"));
        request.setCategoryId(1L);
        request.setCurrency("USD");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        
        Budget savedBudget = createBudget(1L, user, category, 2026, 1, new BigDecimal("1000"));
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        Budget result = budgetService.createBudget(user, request);

        assertNotNull(result);
        assertEquals(2026, result.getYear());
        assertEquals(1, result.getMonth());
        assertEquals(new BigDecimal("1000"), result.getLimitAmount());
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void testCreateBudget_WithoutCategory() {
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(2);
        request.setLimitAmount(new BigDecimal("500"));
        request.setCategoryId(null);

        Budget savedBudget = createBudget(1L, user, null, 2026, 2, new BigDecimal("500"));
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        Budget result = budgetService.createBudget(user, request);

        assertNotNull(result);
        assertEquals(2026, result.getYear());
        assertEquals(2, result.getMonth());
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void testCreateBudget_SetBaseCurrency() {
        user.setBaseCurrency(null);
        
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("1000"));
        request.setCurrency("EUR");

        Budget savedBudget = createBudget(1L, user, null, 2026, 1, new BigDecimal("1000"));
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        Budget result = budgetService.createBudget(user, request);

        assertNotNull(result);
        assertEquals("EUR", user.getBaseCurrency());
    }

    @Test
    void testUpdateBudget_Success() {
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 1L);
        } catch (Exception e) {
            // Ignore
        }
        
        Budget existingBudget = createBudget(1L, user, null, 2025, 12, new BigDecimal("500"));

        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("1000"));
        request.setCategoryId(1L);

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existingBudget));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        
        Budget updatedBudget = createBudget(1L, user, category, 2026, 1, new BigDecimal("1000"));
        when(budgetRepository.save(any(Budget.class))).thenReturn(updatedBudget);

        Budget result = budgetService.updateBudget(user, 1L, request);

        assertNotNull(result);
        assertEquals(2026, result.getYear());
        assertEquals(1, result.getMonth());
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void testUpdateBudget_NotFound() {
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("1000"));

        when(budgetRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            budgetService.updateBudget(user, 1L, request);
        });
    }

    @Test
    void testUpdateBudget_Unauthorized() {
        User otherUser = new User();
        
        Budget existingBudget = createBudget(1L, otherUser, null, 2025, 12, new BigDecimal("500"));

        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("1000"));

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(existingBudget));

        assertThrows(RuntimeException.class, () -> {
            budgetService.updateBudget(user, 1L, request);
        });
    }

    @Test
    void testGetBudgetsWithStatus() {
        Budget budget = createBudget(1L, user, category, 2026, 1, new BigDecimal("1000"));

        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("200"));

        when(budgetRepository.findByUserAndYearAndMonth(user, 2026, 1)).thenReturn(List.of(budget));
        when(expenseService.getExpenses(eq(user), any(), any(), any())).thenReturn(List.of(expense));

        List<BudgetStatusResponse> result = budgetService.getBudgetsWithStatus(user, 2026, 1);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetBudgetsWithStatus_NoExpenses() {
        Budget budget = createBudget(1L, user, category, 2026, 1, new BigDecimal("1000"));

        when(budgetRepository.findByUserAndYearAndMonth(user, 2026, 1)).thenReturn(List.of(budget));
        when(expenseService.getExpenses(eq(user), any(), any(), any())).thenReturn(List.of());

        List<BudgetStatusResponse> result = budgetService.getBudgetsWithStatus(user, 2026, 1);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testDeleteBudget() {
        budgetService.deleteBudget(1L);
        verify(budgetRepository).deleteById(1L);
    }
}
