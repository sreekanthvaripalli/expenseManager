package com.example.expensemanager.controller;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseSummaryResponse;
import com.example.expensemanager.dto.MonthlySummaryItem;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import com.example.expensemanager.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserRepository userRepository;

    public ExpenseController(ExpenseService expenseService, UserRepository userRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
    }

    // For now, use the first user as a demo "current user"
    private User getCurrentUser() {
        return userRepository.findAll().stream().findFirst().orElseThrow();
    }

    @PostMapping
    public Expense create(@Valid @RequestBody ExpenseRequest request) {
        return expenseService.createExpense(getCurrentUser(), request);
    }

    @GetMapping
    public List<Expense> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
        return expenseService.getExpenses(getCurrentUser(), categoryId, start, end);
    }

    @GetMapping("/summary")
    public ExpenseSummaryResponse summary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
        return expenseService.summarize(getCurrentUser(), start, end);
    }

    @GetMapping("/summary/monthly")
    public List<MonthlySummaryItem> monthlySummary(@RequestParam int year) {
        return expenseService.monthlySummary(getCurrentUser(), year);
    }
}


