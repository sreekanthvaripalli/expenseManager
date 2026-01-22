package com.example.expensemanager.repository;

import com.example.expensemanager.model.Budget;
import com.example.expensemanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserAndYearAndMonth(User user, int year, int month);

    long countByUser(User user);
}
