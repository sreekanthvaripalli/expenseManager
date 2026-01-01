package com.example.expensemanager.controller;

import com.example.expensemanager.dto.CategoryRequest;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryController(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        return userRepository.findAll().stream().findFirst().orElseThrow();
    }

    @GetMapping
    public List<Category> list() {
        return categoryRepository.findByUser(getCurrentUser());
    }

    @PostMapping
    public Category create(@Valid @RequestBody CategoryRequest request) {
        Category c = new Category();
        c.setName(request.getName());
        c.setColor(request.getColor());
        c.setUser(getCurrentUser());
        return categoryRepository.save(c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
    }
}