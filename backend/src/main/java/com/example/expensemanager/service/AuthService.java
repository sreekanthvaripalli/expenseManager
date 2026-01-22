package com.example.expensemanager.service;

import com.example.expensemanager.config.JwtUtils;
import com.example.expensemanager.controller.BusinessException;
import com.example.expensemanager.dto.AuthRequest;
import com.example.expensemanager.dto.AuthResponse;
import com.example.expensemanager.dto.RegisterRequest;
import com.example.expensemanager.model.Category;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthService(AuthenticationManager authenticationManager,
                      UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtils jwtUtils,
                      UserDetailsServiceImpl userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        userRepository.save(user);

        // Create default categories for new user
        createDefaultCategories(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getBaseCurrency());
    }

    private void createDefaultCategories(User user) {
        createCategory(user, "Food & Dining", "#ef4444");
        createCategory(user, "Transportation", "#f59e0b");
        createCategory(user, "Shopping", "#8b5cf6");
        createCategory(user, "Entertainment", "#ec4899");
        createCategory(user, "Bills & Utilities", "#0ea5e9");
        createCategory(user, "Healthcare", "#10b981");
        createCategory(user, "Education", "#6366f1");
        createCategory(user, "Travel", "#14b8a6");
        createCategory(user, "Groceries", "#84cc16");
        createCategory(user, "Home & Garden", "#f97316");
        createCategory(user, "Personal Care", "#a855f7");
        createCategory(user, "Gifts & Donations", "#06b6d4");
    }

    private void createCategory(User user, String name, String color) {
        Category category = new Category();
        category.setUser(user);
        category.setName(name);
        category.setColor(color);
        categoryRepository.save(category);
    }

    public AuthResponse login(AuthRequest request) {
        // First check if user exists
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            throw new BusinessException(
                "USER_NOT_FOUND",
                "No account found with this email address. Would you like to register instead?",
                HttpStatus.UNAUTHORIZED
            );
        }

        // User exists, now try to authenticate
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getBaseCurrency());
        } catch (Exception e) {
            // Password is incorrect
            throw new BusinessException(
                "INVALID_PASSWORD",
                "Incorrect password. Please check your password and try again.",
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    public void updateBaseCurrency(User user, String baseCurrency) {
        user.setBaseCurrency(baseCurrency);
        userRepository.save(user);
    }
}
