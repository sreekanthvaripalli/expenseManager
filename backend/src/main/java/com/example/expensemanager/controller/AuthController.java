package com.example.expensemanager.controller;

import com.example.expensemanager.dto.AuthRequest;
import com.example.expensemanager.dto.AuthResponse;
import com.example.expensemanager.dto.RegisterRequest;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import com.example.expensemanager.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ipAddress = getClientIpAddress(httpRequest);
        AuthResponse response = authService.register(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        String ipAddress = getClientIpAddress(httpRequest);
        AuthResponse response = authService.login(request, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/base-currency")
    public ResponseEntity<Void> updateBaseCurrency(@RequestBody Map<String, String> request) {
        String baseCurrency = request.get("baseCurrency");
        if (baseCurrency == null || baseCurrency.trim().isEmpty()) {
            throw new BusinessException("INVALID_CURRENCY", "Base currency cannot be empty", HttpStatus.BAD_REQUEST);
        }
        authService.updateBaseCurrency(getCurrentUser(), baseCurrency);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
