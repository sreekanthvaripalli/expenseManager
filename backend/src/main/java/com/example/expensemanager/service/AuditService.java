package com.example.expensemanager.service;

import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    
    private final UserRepository userRepository;
    
    // In-memory store for failed login attempts (in production, use a database or Redis)
    private final Map<String, FailedLoginAttempt> failedAttempts = new ConcurrentHashMap<>();

    public AuditService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Async
    public void logLoginAttempt(String email, boolean success, String ipAddress) {
        if (success) {
            failedAttempts.remove(email);
            logger.info("AUDIT: Successful login for user: {} from IP: {}", email, ipAddress);
        } else {
            FailedLoginAttempt attempt = failedAttempts.compute(email, (k, v) -> {
                if (v == null) {
                    return new FailedLoginAttempt(1, LocalDateTime.now());
                }
                return new FailedLoginAttempt(v.count + 1, LocalDateTime.now());
            });
            
            logger.warn("AUDIT: Failed login attempt ({}) for user: {} from IP: {}", 
                    attempt.count, email, ipAddress);
            
            // Lock account after 5 failed attempts
            if (attempt.count >= 5) {
                lockAccount(email);
            }
        }
    }

    @Async
    public void logRegistration(String email, String ipAddress) {
        logger.info("AUDIT: New user registration: {} from IP: {}", email, ipAddress);
    }

    @Async
    public void logSecurityEvent(String eventType, String details) {
        logger.info("AUDIT: {} - {}", eventType, details);
    }

    @Async
    public void logTokenRefresh(String email, boolean success) {
        if (success) {
            logger.info("AUDIT: Token refreshed for user: {}", email);
        } else {
            logger.warn("AUDIT: Token refresh failed for user: {}", email);
        }
    }

    private void lockAccount(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            logger.warn("AUDIT: Account locked for user: {} due to multiple failed login attempts", email);
            // In a real application, you would set a locked flag on the user
        });
    }

    public FailedLoginAttempt getFailedAttempts(String email) {
        return failedAttempts.get(email);
    }

    public void resetFailedAttempts(String email) {
        failedAttempts.remove(email);
    }

    public record FailedLoginAttempt(int count, LocalDateTime lastAttempt) {}
}
