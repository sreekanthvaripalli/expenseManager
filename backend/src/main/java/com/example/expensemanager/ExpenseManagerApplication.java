package com.example.expensemanager;

import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ExpenseManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExpenseManagerApplication.class, args);
    }

    @Bean
    CommandLineRunner seedDemoData(UserRepository userRepository, CategoryRepository categoryRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User u = new User();
                u.setEmail("demo@example.com");
                u.setFullName("Demo User");
                u.setPasswordHash("demo");
                userRepository.save(u);

                createCategory(categoryRepository, u, "Food & Dining", "#ef4444");
                createCategory(categoryRepository, u, "Transportation", "#f59e0b");
                createCategory(categoryRepository, u, "Shopping", "#8b5cf6");
                createCategory(categoryRepository, u, "Entertainment", "#ec4899");
                createCategory(categoryRepository, u, "Bills & Utilities", "#0ea5e9");
                createCategory(categoryRepository, u, "Healthcare", "#10b981");
                createCategory(categoryRepository, u, "Education", "#6366f1");
                createCategory(categoryRepository, u, "Travel", "#14b8a6");
                createCategory(categoryRepository, u, "Groceries", "#84cc16");
                createCategory(categoryRepository, u, "Home & Garden", "#f97316");
                createCategory(categoryRepository, u, "Personal Care", "#a855f7");
                createCategory(categoryRepository, u, "Gifts & Donations", "#06b6d4");
            }
        };
    }

    private void createCategory(CategoryRepository categoryRepository, User user, String name, String color) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setColor(color);
        categoryRepository.save(category);
    }
}


