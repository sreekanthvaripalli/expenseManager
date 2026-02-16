package com.example.expensemanager.service;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseSummaryResponse;
import com.example.expensemanager.dto.MonthlySummaryItem;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.BudgetRepository;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CurrencyService currencyService;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setBaseCurrency("USD");

        testCategory = new Category();
        testCategory.setName("Food");
    }

    private void setUserId(User user, Long id) {
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (Exception e) {
            // Ignore
        }
    }

    @Test
    void testCreateExpense() {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setDescription("Lunch");
        request.setCategoryId(1L);
        request.setCurrency("USD"); // Same as base currency to avoid conversion

        Expense savedExpense = new Expense();
        savedExpense.setUser(testUser);
        savedExpense.setCategory(testCategory);
        savedExpense.setAmount(new BigDecimal("50.00"));
        savedExpense.setDate(request.getDate());
        savedExpense.setDescription(request.getDescription());

        when(categoryRepository.findById(anyLong())).thenReturn(Optional.of(testCategory));
        when(budgetRepository.countByUser(any(User.class))).thenReturn(1L);
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        // Act
        Expense result = expenseService.createExpense(testUser, request);

        // Assert
        assertNotNull(result);
    }

    @Test
    void testGetExpenses() {
        // Arrange
        Expense expense = new Expense();
        expense.setAmount(new BigDecimal("100.00"));

        when(categoryRepository.findById(anyLong())).thenReturn(Optional.of(testCategory));
        when(expenseRepository.findFiltered(eq(testUser), eq(testCategory), isNull(), isNull()))
                .thenReturn(Arrays.asList(expense));

        // Act
        List<Expense> expenses = expenseService.getExpenses(testUser, 1L, null, null);

        // Assert
        assertEquals(1, expenses.size());
    }

    @Test
    void testSummarize() {
        // Arrange - mock the repository methods using correct method name
        when(expenseRepository.findFiltered(any(User.class), any(), any(), any()))
                .thenReturn(Arrays.asList());
        
        // Act
        ExpenseSummaryResponse response = expenseService.summarize(testUser, null, null);
        
        // Assert
        assertNotNull(response);
    }

    @Test
    void testMonthlySummary() {
        // Arrange - using findFiltered for year-based queries
        when(expenseRepository.findFiltered(any(User.class), any(), any(), any()))
                .thenReturn(Arrays.asList());
        
        // Act
        List<MonthlySummaryItem> summary = expenseService.monthlySummary(testUser, 2023);
        
        // Assert
        assertNotNull(summary);
    }

    @Test
    void testUpdateExpense() {
        // Arrange - set up user with ID
        setUserId(testUser, 1L);
        
        Expense existingExpense = new Expense();
        existingExpense.setUser(testUser);

        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("75.00"));
        request.setDescription("Updated lunch");

        when(expenseRepository.findById(anyLong())).thenReturn(Optional.of(existingExpense));
        when(expenseRepository.save(any(Expense.class))).thenReturn(existingExpense);

        // Act
        Expense result = expenseService.updateExpense(testUser, 1L, request);

        // Assert
        assertNotNull(result);
    }

    @Test
    void testDeleteExpense() {
        // The service checks if expense exists and belongs to user, throws if not found
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            expenseService.deleteExpense(testUser, 1L));
        assertEquals("Expense not found", exception.getMessage());
    }
}
