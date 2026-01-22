package com.example.expensemanager.controller;

import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetStatusResponse;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import com.example.expensemanager.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    private final BudgetService budgetService;
    private final UserRepository userRepository;

    public BudgetController(BudgetService budgetService, UserRepository userRepository) {
        this.budgetService = budgetService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<BudgetStatusResponse> list(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return budgetService.getBudgetsWithStatus(getCurrentUser(), year, month);
    }

    @PostMapping
    public BudgetStatusResponse create(@Valid @RequestBody BudgetRequest request) {
        var user = getCurrentUser();
        var budget = budgetService.createBudget(user, request);
        return budgetService
                .getBudgetsWithStatus(user, budget.getYear(), budget.getMonth())
                .stream()
                .filter(b -> b.getId().equals(budget.getId()))
                .findFirst()
                .orElseThrow();
    }

    @PutMapping("/{id}")
    public BudgetStatusResponse update(@PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        var user = getCurrentUser();
        var budget = budgetService.updateBudget(user, id, request);
        return budgetService
                .getBudgetsWithStatus(user, budget.getYear(), budget.getMonth())
                .stream()
                .filter(b -> b.getId().equals(budget.getId()))
                .findFirst()
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        budgetService.deleteBudget(id);
    }
}
