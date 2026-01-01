package com.example.expensemanager;

import com.example.expensemanager.model.User;
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
    CommandLineRunner seedDemoUser(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User u = new User();
                u.setEmail("demo@example.com");
                u.setFullName("Demo User");
                u.setPasswordHash("demo"); // demo only, no real auth yet
                userRepository.save(u);
            }
        };
    }
}


