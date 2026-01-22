package com.example.expensemanager.service;

import com.example.expensemanager.controller.BusinessException;
import com.example.expensemanager.dto.BudgetRequest;
import com.example.expensemanager.dto.BudgetStatusResponse;
import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.BudgetRepository;
import com.example.expensemanager.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         ExpenseService expenseService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.expenseService = expenseService;
    }

    @Transactional
    public Budget createBudget(User user, BudgetRequest request) {
        // Check if user has base currency set, if not set it now
        String baseCurrency = user.getBaseCurrency();
        if (baseCurrency == null || baseCurrency.trim().isEmpty()) {
            // Set base currency from request or default to INR
            baseCurrency = request.getCurrency() != null && !request.getCurrency().trim().isEmpty()
                ? request.getCurrency()
                : "INR";
            user.setBaseCurrency(baseCurrency);
        }

        Budget b = new Budget();
        b.setUser(user);
        b.setYear(request.getYear());
        b.setMonth(request.getMonth());
        b.setLimitAmount(request.getLimitAmount());

        if (request.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            categoryOpt.ifPresent(b::setCategory);
        }

        return budgetRepository.save(b);
    }

    @Transactional
    public Budget updateBudget(User user, Long id, BudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setLimitAmount(request.getLimitAmount());

        if (request.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            categoryOpt.ifPresent(budget::setCategory);
        } else {
            budget.setCategory(null);
        }

        return budgetRepository.save(budget);
    }

    public List<BudgetStatusResponse> getBudgetsWithStatus(User user, int year, int month) {
        List<Budget> budgets = budgetRepository.findByUserAndYearAndMonth(user, year, month);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return budgets.stream()
                .map(budget -> {
                    Long categoryId = budget.getCategory() != null ? budget.getCategory().getId() : null;
                    String categoryName = budget.getCategory() != null ? budget.getCategory().getName() : "All expenses";

                    List<Expense> expenses = expenseService.getExpenses(
                            user,
                            categoryId,
                            start,
                            end
                    );

                    BigDecimal spent = expenses.stream()
                            .map(Expense::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new BudgetStatusResponse(
                            budget.getId(),
                            budget.getYear(),
                            budget.getMonth(),
                            categoryId,
                            categoryName,
                            budget.getLimitAmount(),
                            spent
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }
}
