package com.example.expensemanager.repository;

import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.Expense;
import com.example.expensemanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("select e from Expense e " +
            "where e.user = :user " +
            "and (:category is null or e.category = :category) " +
            "and (:startDate is null or e.date >= :startDate) " +
            "and (:endDate is null or e.date <= :endDate)")
    List<Expense> findFiltered(
            @Param("user") User user,
            @Param("category") Category category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}


