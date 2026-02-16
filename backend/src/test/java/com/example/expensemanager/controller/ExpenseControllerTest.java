package com.example.expensemanager.controller;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseSummaryResponse;
import com.example.expensemanager.dto.MonthlySummaryItem;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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

    @MockBean
    private com.example.expensemanager.config.JwtUtils jwtUtils;

    private User testUser;
    private Expense testExpense;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setBaseCurrency("USD");

        testExpense = new Expense();
        testExpense.setUser(testUser);
        testExpense.setAmount(new BigDecimal("100.00"));
        testExpense.setDescription("Test expense");
        testExpense.setDate(LocalDate.now());

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
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
    @WithMockUser(username = "test@example.com")
    void testCreateExpense() throws Exception {
        setUserId(testUser, 1L);
        
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setDescription("Lunch");
        request.setDate(LocalDate.now());
        request.setCategoryId(1L);
        request.setCurrency("USD");

        when(expenseService.createExpense(any(User.class), any(ExpenseRequest.class)))
                .thenReturn(testExpense);

        mockMvc.perform(post("/api/expenses")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Test expense"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testListExpenses() throws Exception {
        when(expenseService.getExpenses(any(User.class), isNull(), isNull(), isNull()))
                .thenReturn(Arrays.asList(testExpense));

        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Test expense"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testListExpensesWithCategory() throws Exception {
        when(expenseService.getExpenses(any(User.class), eq(1L), isNull(), isNull()))
                .thenReturn(Arrays.asList(testExpense));

        mockMvc.perform(get("/api/expenses")
                .param("categoryId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Test expense"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testListExpensesWithDateRange() throws Exception {
        when(expenseService.getExpenses(any(User.class), isNull(), any(), any()))
                .thenReturn(Arrays.asList(testExpense));

        mockMvc.perform(get("/api/expenses")
                .param("startDate", "2024-01-01")
                .param("endDate", "2024-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Test expense"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGetSummary() throws Exception {
        Map<String, BigDecimal> categoryTotals = new HashMap<>();
        categoryTotals.put("Food", new BigDecimal("300.00"));
        categoryTotals.put("Transport", new BigDecimal("200.00"));
        ExpenseSummaryResponse summary = new ExpenseSummaryResponse(new BigDecimal("500.00"), categoryTotals);

        when(expenseService.summarize(any(User.class), isNull(), isNull()))
                .thenReturn(summary);

        mockMvc.perform(get("/api/expenses/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(500.00));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGetMonthlySummary() throws Exception {
        MonthlySummaryItem item = new MonthlySummaryItem("January", new BigDecimal("300.00"));

        when(expenseService.monthlySummary(any(User.class), eq(2024)))
                .thenReturn(Arrays.asList(item));

        mockMvc.perform(get("/api/expenses/summary/monthly")
                .param("year", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].month").value("January"))
                .andExpect(jsonPath("$[0].total").value(300.00));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testUpdateExpense() throws Exception {
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("150.00"));
        request.setDescription("Updated lunch");
        request.setDate(LocalDate.now());
        request.setCategoryId(1L);
        request.setCurrency("USD");

        when(expenseService.updateExpense(any(User.class), eq(1L), any(ExpenseRequest.class)))
                .thenReturn(testExpense);

        mockMvc.perform(put("/api/expenses/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Test expense"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testDeleteExpense() throws Exception {
        doNothing().when(expenseService).deleteExpense(any(User.class), eq(1L));

        mockMvc.perform(delete("/api/expenses/1")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(expenseService).deleteExpense(any(User.class), eq(1L));
    }
}
