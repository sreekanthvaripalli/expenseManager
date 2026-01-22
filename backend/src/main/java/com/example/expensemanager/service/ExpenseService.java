package com.example.expensemanager.service;

import com.example.expensemanager.controller.BusinessException;
import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseSummaryResponse;
import com.example.expensemanager.dto.MonthlySummaryItem;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.BudgetRepository;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.ExpenseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final CurrencyService currencyService;

    public ExpenseService(ExpenseRepository expenseRepository, CategoryRepository categoryRepository, BudgetRepository budgetRepository, CurrencyService currencyService) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.currencyService = currencyService;
    }

    @Transactional
    public Expense createExpense(User user, ExpenseRequest request) {
        // Check if user has any budgets set first
        long budgetCount = budgetRepository.countByUser(user);
        if (budgetCount == 0) {
            throw new BusinessException(
                "BUDGET_REQUIRED",
                "Please set up a budget first before adding expenses.",
                HttpStatus.BAD_REQUEST
            );
        }

        // Check if user has base currency set
        String baseCurrency = user.getBaseCurrency();
        if (baseCurrency == null || baseCurrency.trim().isEmpty()) {
            throw new BusinessException(
                "BASE_CURRENCY_REQUIRED",
                "Please select your base currency in settings before adding expenses.",
                HttpStatus.BAD_REQUEST
            );
        }

        Expense expense = new Expense();
        expense.setUser(user);

        // Store original currency and amount for display purposes
        expense.setOriginalCurrency(request.getCurrency());
        expense.setOriginalAmount(request.getAmount());

        // Convert to user's base currency and store as the base currency amount
        BigDecimal baseAmount = currencyService.convertCurrency(request.getAmount(), request.getCurrency(), baseCurrency);
        expense.setAmount(baseAmount);

        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setRecurring(request.isRecurring());

        if (request.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            categoryOpt.ifPresent(expense::setCategory);
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getExpenses(User user, Long categoryId, LocalDate startDate, LocalDate endDate) {
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId).orElse(null);
        }
        return expenseRepository.findFiltered(user, category, startDate, endDate);
    }

    public ExpenseSummaryResponse summarize(User user, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = getExpenses(user, null, startDate, endDate);

        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory().getName() : "Uncategorized",
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return new ExpenseSummaryResponse(total, byCategory);
    }

    public List<MonthlySummaryItem> monthlySummary(User user, int year) {
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        List<Expense> expenses = getExpenses(user, null, start, end);

        Map<YearMonth, BigDecimal> byMonth = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()),
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return byMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new MonthlySummaryItem(e.getKey().toString(), e.getValue()))
                .toList();
    }

    @Transactional
    public Expense updateExpense(User user, Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Store original currency and amount for display purposes
        expense.setOriginalCurrency(request.getCurrency());
        expense.setOriginalAmount(request.getAmount());

        // Convert to user's base currency and update the base currency amount
        String baseCurrency = user.getBaseCurrency();
        BigDecimal baseAmount = currencyService.convertCurrency(request.getAmount(), request.getCurrency(), baseCurrency);
        expense.setAmount(baseAmount);

        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setRecurring(request.isRecurring());

        if (request.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            categoryOpt.ifPresent(expense::setCategory);
        } else {
            expense.setCategory(null);
        }

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(User user, Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        expenseRepository.deleteById(id);
    }
}
