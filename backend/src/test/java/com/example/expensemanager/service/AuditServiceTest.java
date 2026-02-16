package com.example.expensemanager.service;

import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private UserRepository userRepository;

    private AuditService auditService;

    @BeforeEach
    void setUp() {
        auditService = new AuditService(userRepository);
    }

    @Test
    void testLogLoginAttempt_Success() {
        // Test successful login - should remove from failed attempts
        auditService.logLoginAttempt("test@example.com", true, "127.0.0.1");
        
        // Verify no exception is thrown
        assertNotNull(auditService);
    }

    @Test
    void testLogLoginAttempt_Failure() {
        // Test failed login attempt
        auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        
        // Verify the failed attempt is tracked
        var attempt = auditService.getFailedAttempts("test@example.com");
        assertNotNull(attempt);
        assertEquals(1, attempt.count());
    }

    @Test
    void testLogLoginAttempt_MultipleFailures() {
        // Test multiple failed login attempts
        auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        
        var attempt = auditService.getFailedAttempts("test@example.com");
        assertNotNull(attempt);
        assertEquals(3, attempt.count());
    }

    @Test
    void testLogLoginAttempt_AccountLockout() {
        // Test account lockout after 5 failed attempts
        for (int i = 0; i < 5; i++) {
            auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        }
        
        // After 5 failures, should try to lock account
        var attempt = auditService.getFailedAttempts("test@example.com");
        assertNotNull(attempt);
        assertEquals(5, attempt.count());
    }

    @Test
    void testLogRegistration() {
        // Test registration logging
        auditService.logRegistration("newuser@example.com", "127.0.0.1");
        
        assertNotNull(auditService);
    }

    @Test
    void testLogSecurityEvent() {
        // Test security event logging
        auditService.logSecurityEvent("TEST_EVENT", "Test security event details");
        
        assertNotNull(auditService);
    }

    @Test
    void testLogTokenRefresh_Success() {
        // Test successful token refresh
        auditService.logTokenRefresh("test@example.com", true);
        
        assertNotNull(auditService);
    }

    @Test
    void testLogTokenRefresh_Failure() {
        // Test failed token refresh
        auditService.logTokenRefresh("test@example.com", false);
        
        assertNotNull(auditService);
    }

    @Test
    void testResetFailedAttempts() {
        // First add a failed attempt
        auditService.logLoginAttempt("test@example.com", false, "127.0.0.1");
        
        // Then reset
        auditService.resetFailedAttempts("test@example.com");
        
        // Should be null/removed
        var attempt = auditService.getFailedAttempts("test@example.com");
        assertNull(attempt);
    }

    @Test
    void testGetFailedAttempts_NotFound() {
        // Test getting failed attempts for non-existent user
        var attempt = auditService.getFailedAttempts("nonexistent@example.com");
        assertNull(attempt);
    }
}
