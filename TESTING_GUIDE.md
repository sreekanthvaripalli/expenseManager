# Unit Testing Guide for Expense Manager Application

## Overview
This document provides comprehensive unit test examples for both backend (Java/Spring Boot) and frontend (React/TypeScript) components.

---

## Backend Unit Tests (Java/JUnit 5 + Mockito)

### 1. Service Layer Tests

#### ExpenseServiceTest.java
```java
package com.example.expensemanager.service;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Category testCategory;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Food");
        testCategory.setUser(testUser);

        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setUser(testUser);
        testExpense.setCategory(testCategory);
        testExpense.setAmount(new BigDecimal("50.00"));
        testExpense.setDate(LocalDate.now());
        testExpense.setDescription("Lunch");
        testExpense.setRecurring(false);
    }

    @Test
    void createExpense_ShouldReturnSavedExpense() {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());
        request.setDescription("Lunch");
        request.setRecurring(false);
        request.setCategoryId(1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        // Act
        Expense result = expenseService.createExpense(testUser, request);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("50.00"), result.getAmount());
        assertEquals("Lunch", result.getDescription());
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void updateExpense_ShouldUpdateAndReturnExpense() {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("75.00"));
        request.setDate(LocalDate.now());
        request.setDescription("Dinner");
        request.setRecurring(true);
        request.setCategoryId(1L);

        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(Expense.class))).thenReturn(testExpense);

        // Act
        Expense result = expenseService.updateExpense(testUser, 1L, request);

        // Assert
        assertNotNull(result);
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void updateExpense_WithWrongUser_ShouldThrowException() {
        // Arrange
        User wrongUser = new User();
        wrongUser.setId(999L);

        ExpenseRequest request = new ExpenseRequest();
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            expenseService.updateExpense(wrongUser, 1L, request)
        );
    }

    @Test
    void deleteExpense_ShouldDeleteExpense() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        doNothing().when(expenseRepository).deleteById(1L);

        // Act
        expenseService.deleteExpense(testUser, 1L);

        // Assert
        verify(expenseRepository, times(1)).deleteById(1L);
    }
}
```

#### BudgetServiceTest.java
```java
package com.example.expensemanager.service;

import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.BudgetRepository;
import com.example.expensemanager.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseService expenseService;

    @InjectMocks
    private BudgetService budgetService;

    private User testUser;
    private Category testCategory;
    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Food");

        testBudget = new Budget();
        testBudget.setId(1L);
        testBudget.setUser(testUser);
        testBudget.setCategory(testCategory);
        testBudget.setYear(2026);
        testBudget.setMonth(1);
        testBudget.setLimitAmount(new BigDecimal("500.00"));
    }

    @Test
    void createBudget_ShouldReturnSavedBudget() {
        // Arrange
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("500.00"));
        request.setCategoryId(1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        // Act
        Budget result = budgetService.createBudget(testUser, request);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("500.00"), result.getLimitAmount());
        assertEquals(2026, result.getYear());
        assertEquals(1, result.getMonth());
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void updateBudget_ShouldUpdateAndReturnBudget() {
        // Arrange
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("600.00"));
        request.setCategoryId(1L);

        when(budgetRepository.findById(1L)).thenReturn(Optional.of(testBudget));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        // Act
        Budget result = budgetService.updateBudget(testUser, 1L, request);

        // Assert
        assertNotNull(result);
        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void updateBudget_WithUnauthorizedUser_ShouldThrowException() {
        // Arrange
        User wrongUser = new User();
        wrongUser.setId(999L);

        BudgetRequest request = new BudgetRequest();
        when(budgetRepository.findById(1L)).thenReturn(Optional.of(testBudget));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            budgetService.updateBudget(wrongUser, 1L, request)
        );
    }

    @Test
    void deleteBudget_ShouldDeleteBudget() {
        // Arrange
        doNothing().when(budgetRepository).deleteById(1L);

        // Act
        budgetService.deleteBudget(1L);

        // Assert
        verify(budgetRepository, times(1)).deleteById(1L);
    }
}
```

### 2. Controller Layer Tests

#### ExpenseControllerTest.java
```java
package com.example.expensemanager.controller;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import com.example.expensemanager.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExpenseController.class)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setAmount(new BigDecimal("50.00"));
        testExpense.setDate(LocalDate.now());
        testExpense.setDescription("Test expense");

        when(userRepository.findAll()).thenReturn(List.of(testUser));
    }

    @Test
    void createExpense_ShouldReturn200() throws Exception {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setDate(LocalDate.now());

        when(expenseService.createExpense(any(User.class), any(ExpenseRequest.class)))
            .thenReturn(testExpense);

        // Act & Assert
        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(50.00));
    }

    @Test
    void updateExpense_ShouldReturn200() throws Exception {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("75.00"));
        request.setDate(LocalDate.now());

        when(expenseService.updateExpense(any(User.class), eq(1L), any(ExpenseRequest.class)))
            .thenReturn(testExpense);

        // Act & Assert
        mockMvc.perform(put("/api/expenses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteExpense_ShouldReturn200() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isOk());
    }

    @Test
    void listExpenses_ShouldReturnExpenseList() throws Exception {
        // Arrange
        when(expenseService.getExpenses(any(), any(), any(), any()))
            .thenReturn(Arrays.asList(testExpense));

        // Act & Assert
        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }
}
```

#### BudgetControllerTest.java
```java
package com.example.expensemanager.controller;

import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetStatusResponse;
import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import com.example.expensemanager.service.BudgetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BudgetController.class)
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BudgetService budgetService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private Budget testBudget;
    private BudgetStatusResponse testResponse;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);

        testBudget = new Budget();
        testBudget.setId(1L);
        testBudget.setYear(2026);
        testBudget.setMonth(1);
        testBudget.setLimitAmount(new BigDecimal("500.00"));

        testResponse = new BudgetStatusResponse(
            1L, 2026, 1, null, "All expenses",
            new BigDecimal("500.00"), new BigDecimal("200.00")
        );

        when(userRepository.findAll()).thenReturn(List.of(testUser));
    }

    @Test
    void createBudget_ShouldReturn200() throws Exception {
        // Arrange
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("500.00"));

        when(budgetService.createBudget(any(User.class), any(BudgetRequest.class)))
            .thenReturn(testBudget);
        when(budgetService.getBudgetsWithStatus(any(), eq(2026), eq(1)))
            .thenReturn(Arrays.asList(testResponse));

        // Act & Assert
        mockMvc.perform(post("/api/budgets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void updateBudget_ShouldReturn200() throws Exception {
        // Arrange
        BudgetRequest request = new BudgetRequest();
        request.setYear(2026);
        request.setMonth(1);
        request.setLimitAmount(new BigDecimal("600.00"));

        when(budgetService.updateBudget(any(User.class), eq(1L), any(BudgetRequest.class)))
            .thenReturn(testBudget);
        when(budgetService.getBudgetsWithStatus(any(), eq(2026), eq(1)))
            .thenReturn(Arrays.asList(testResponse));

        // Act & Assert
        mockMvc.perform(put("/api/budgets/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteBudget_ShouldReturn200() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/budgets/1"))
                .andExpect(status().isOk());
    }

    @Test
    void listBudgets_ShouldReturnBudgetList() throws Exception {
        // Arrange
        when(budgetService.getBudgetsWithStatus(any(), eq(2026), eq(1)))
            .thenReturn(Arrays.asList(testResponse));

        // Act & Assert
        mockMvc.perform(get("/api/budgets?year=2026&month=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }
}
```

### 3. Model/Entity Tests

#### BudgetTest.java
```java
package com.example.expensemanager.model;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class BudgetTest {

    @Test
    void budgetEntity_ShouldSetAndGetProperties() {
        // Arrange
        Budget budget = new Budget();
        User user = new User();
        user.setId(1L);
        Category category = new Category();
        category.setId(1L);

        // Act
        budget.setId(1L);
        budget.setUser(user);
        budget.setCategory(category);
        budget.setYear(2026);
        budget.setMonth(1);
        budget.setLimitAmount(new BigDecimal("500.00"));

        // Assert
        assertEquals(1L, budget.getId());
        assertEquals(user, budget.getUser());
        assertEquals(category, budget.getCategory());
        assertEquals(2026, budget.getYear());
        assertEquals(1, budget.getMonth());
        assertEquals(new BigDecimal("500.00"), budget.getLimitAmount());
    }
}
```

---

## Frontend Unit Tests (React/TypeScript + Jest + React Testing Library)

### Setup
Add to `package.json`:
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

### 1. API Service Tests

#### api.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  createExpense, 
  updateExpense, 
  deleteExpense,
  createBudget,
  updateBudget,
  deleteBudget 
} from './api';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Expense API', () => {
    it('should create expense', async () => {
      const mockExpense = { id: 1, amount: 50, date: '2026-01-01' };
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockExpense })
      } as any);

      const result = await createExpense({
        amount: 50,
        date: '2026-01-01',
        categoryId: 1
      });

      expect(result).toEqual(mockExpense);
    });

    it('should update expense', async () => {
      const mockExpense = { id: 1, amount: 75, date: '2026-01-01' };
      mockedAxios.create.mockReturnValue({
        put: vi.fn().mockResolvedValue({ data: mockExpense })
      } as any);

      const result = await updateExpense(1, {
        amount: 75,
        date: '2026-01-01'
      });

      expect(result).toEqual(mockExpense);
    });

    it('should delete expense', async () => {
      mockedAxios.create.mockReturnValue({
        delete: vi.fn().mockResolvedValue({})
      } as any);

      await expect(deleteExpense(1)).resolves.toBeUndefined();
    });
  });

  describe('Budget API', () => {
    it('should create budget', async () => {
      const mockBudget = { 
        id: 1, 
        year: 2026, 
        month: 1, 
        limitAmount: 500 
      };
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockBudget })
      } as any);

      const result = await createBudget({
        year: 2026,
        month: 1,
        limitAmount: 500
      });

      expect(result).toEqual(mockBudget);
    });

    it('should update budget', async () => {
      const mockBudget = { 
        id: 1, 
        year: 2026, 
        month: 1, 
        limitAmount: 600 
      };
      mockedAxios.create.mockReturnValue({
        put: vi.fn().mockResolvedValue({ data: mockBudget })
      } as any);

      const result = await updateBudget(1, {
        year: 2026,
        month: 1,
        limitAmount: 600
      });

      expect(result).toEqual(mockBudget);
    });
  });
});
```

### 2. Component Tests

#### ExpensesPage.test.tsx
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpensesPage from './ExpensesPage';
import * as api from '../services/api';

vi.mock('../services/api');
vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    formatAmount: (amount: number) => `$${amount}`,
    currency: { code: 'USD', symbol: '$' }
  })
}));

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.mocked(api.getExpenses).mockResolvedValue([]);
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getBudgets).mockResolvedValue([]);
  });

  it('should render expense form', () => {
    render(<ExpensesPage />);
    expect(screen.getByText(/add expense/i)).toBeInTheDocument();
  });

  it('should create expense when form submitted', async () => {
    const mockExpense = {
      id: 1,
      amount: 50,
      date: '2026-01-01',
      description: 'Test',
      recurring: false
    };
    
    vi.mocked(api.createExpense).mockResolvedValue(mockExpense);

    render(<ExpensesPage />);

    const amountInput = screen.getByLabelText(/amount/i);
    const dateInput = screen.getByLabelText(/date/i);
    const saveButton = screen.getByText(/save/i);

    await userEvent.type(amountInput, '50');
    await userEvent.type(dateInput, '2026-01-01');
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(api.createExpense).toHaveBeenCalled();
    });
  });

  it('should switch to edit mode when edit clicked', async () => {
    const mockExpense = {
      id: 1,
      amount: 50,
      date: '2026-01-01',
      description: 'Test',
      recurring: false,
      category: { id: 1, name: 'Food' }
    };

    vi.mocked(api.getExpenses).mockResolvedValue([mockExpense]);

    render(<ExpensesPage />);

    await waitFor(() => {
      const editButton = screen.getByText(/edit/i);
      fireEvent.click(editButton);
    });

    expect(screen.getByText(/edit expense/i)).toBeInTheDocument();
    expect(screen.getByText(/update/i)).toBeInTheDocument();
  });
});
```

#### SettingsPage.test.tsx
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './SettingsPage';
import * as api from '../services/api';

vi.mock('../services/api');
vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    formatAmount: (amount: number) => `$${amount}`,
    currency: { code: 'USD', symbol: '$' },
    setCurrency: vi.fn()
  }),
  CURRENCIES: [{ code: 'USD', symbol: '$', name: 'US Dollar' }]
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(api.getCategories).mockResolvedValue([]);
    vi.mocked(api.getBudgets).mockResolvedValue([]);
  });

  it('should render settings sections', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/currency/i)).toBeInTheDocument();
    expect(screen.getByText(/categories/i)).toBeInTheDocument();
    expect(screen.getByText(/budgets/i)).toBeInTheDocument();
  });

  it('should create budget when form submitted', async () => {
    const mockBudget = {
      id: 1,
      year: 2026,
      month: 1,
      limitAmount: 500,
      categoryName: 'Food',
      spent: 0,
      remaining: 500,
      percentUsed: 0
    };

    vi.mocked(api.createBudget).mockResolvedValue(mockBudget);

    render(<SettingsPage />);

    const amountInput = screen.getByLabelText(/monthly limit/i);
    const addButton = screen.getByText(/add budget/i);

    await userEvent.type(amountInput, '500');
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(api.createBudget).toHaveBeenCalledWith({
        year: expect.any(Number),
        month: expect.any(Number),
        limitAmount: 500,
        categoryId: undefined
      });
    });
  });

  it('should switch to edit mode for budget', async () => {
    const mockBudget = {
      id: 1,
      year: 2026,
      month: 1,
      categoryId: 1,
      categoryName: 'Food',
      limitAmount: 500,
      spent: 200,
      remaining: 300,
      percentUsed: 40
    };

    vi.mocked(api.getBudgets).mockResolvedValue([mockBudget]);

    render(<SettingsPage />);

    await waitFor(() => {
      const editButton = screen.getByText(/edit/i);
      fireEvent.click(editButton);
    });

    expect(screen.getByText(/update budget/i)).toBeInTheDocument();
  });
});
```

---

## Running Tests

### Backend
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ExpenseServiceTest

# Run with coverage
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Frontend
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# View coverage report
open coverage/index.html
```

---

## Test Coverage Goals

- **Service Layer**: 80%+ coverage
- **Controller Layer**: 75%+ coverage
- **Models**: 70%+ coverage
- **Frontend Components**: 70%+ coverage
- **API Service**: 85%+ coverage

---

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Test Independence**: Each test should be independent
3. **Mock External Dependencies**: Use mocks for databases, APIs
4. **Test Edge Cases**: Null values, empty lists, errors
5. **Descriptive Names**: Use clear, descriptive test names
6. **One Assertion Per Test**: Focus on single behavior
7. **Setup/Teardown**: Use @BeforeEach/@AfterEach properly
8. **Avoid Logic in Tests**: Keep tests simple and straightforward
