package com.example.expensemanager.service;

import com.example.expensemanager.dto.ExpenseRequest;
import com.example.expensemanager.dto.ExpenseSummaryResponse;
import com.example.expensemanager.dto.MonthlySummaryItem;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.ExpenseRepository;
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

    public ExpenseService(ExpenseRepository expenseRepository, CategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Expense createExpense(User user, ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setAmount(request.getAmount());
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
}


