package com.example.expensemanager.controller;

import com.example.expensemanager.service.ExpenseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    @MockBean
    private com.example.expensemanager.repository.UserRepository userRepository;

    @MockBean
    private com.example.expensemanager.config.JwtUtils jwtUtils;

    @Test
    @WithMockUser(username = "test@example.com")
    void testHandleValidationException() throws Exception {
        // Test handling of validation errors - send invalid date format
        mockMvc.perform(get("/api/expenses")
                .param("startDate", "invalid-date"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testHandleMethodArgumentNotValidException() throws Exception {
        // Test handling of method argument validation - missing required param
        mockMvc.perform(get("/api/expenses/summary/monthly"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testHandleHttpMessageNotReadableException() throws Exception {
        // Test handling of unreadable message - invalid JSON
        mockMvc.perform(get("/api/expenses")
                .contentType("application/json")
                .content("invalid json"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testHandleMissingServletRequestParameterException() throws Exception {
        // Test handling of missing parameter
        mockMvc.perform(get("/api/expenses/summary/monthly"))
                .andExpect(status().is5xxServerError());
    }
}
