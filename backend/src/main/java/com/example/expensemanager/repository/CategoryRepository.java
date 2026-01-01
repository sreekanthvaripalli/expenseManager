package com.example.expensemanager.repository;

import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);
}


