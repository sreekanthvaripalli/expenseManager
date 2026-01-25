package com.example.expensemanager.service;

import com.example.expensemanager.config.JwtUtils;
import com.example.expensemanager.controller.BusinessException;
import com.example.expensemanager.dto.AuthRequest;
import com.example.expensemanager.dto.AuthResponse;
import com.example.expensemanager.dto.RegisterRequest;
import com.example.expensemanager.model.User;
import com.example.expensemanager.repository.CategoryRepository;
import com.example.expensemanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private AuthRequest authRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");

        authRequest = new AuthRequest();
        authRequest.setEmail("test@example.com");
        authRequest.setPassword("password123");

        user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("encodedPassword");
        user.setFullName("Test User");
        user.setBaseCurrency("USD");
    }

    @Test
    void testRegister_Success() {
        UserDetails userDetails = mock(UserDetails.class);
        lenient().when(userDetails.getUsername()).thenReturn("test@example.com");

        lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        lenient().when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        lenient().when(userRepository.save(any(User.class))).thenReturn(user);
        lenient().when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        lenient().when(jwtUtils.generateToken(any(UserDetails.class))).thenReturn("jwtToken");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
        assertNull(response.getBaseCurrency());

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(categoryRepository, times(12)).save(any()); // 12 default categories
        verify(jwtUtils).generateToken(userDetails);
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        UserDetails userDetails = mock(UserDetails.class);
        lenient().when(userDetails.getUsername()).thenReturn("test@example.com");

        Authentication authentication = mock(Authentication.class);
        lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        lenient().when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
        lenient().when(jwtUtils.generateToken(any(UserDetails.class))).thenReturn("jwtToken");

        // Act
        AuthResponse response = authService.login(authRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwtToken", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
        assertEquals("USD", response.getBaseCurrency());

        verify(userRepository).findByEmail("test@example.com");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateToken(userDetails);
    }

    @Test
    void testLogin_UserNotFound() {
        lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(authRequest);
        });

        assertEquals("USER_NOT_FOUND", exception.getErrorCode());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getHttpStatus());
        verify(userRepository).findByEmail("test@example.com");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void testLogin_InvalidPassword() {
        lenient().when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        lenient().when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Bad credentials"));

        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(authRequest);
        });

        assertEquals("INVALID_PASSWORD", exception.getErrorCode());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getHttpStatus());
        verify(userRepository).findByEmail("test@example.com");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void testUpdateBaseCurrency() {
        User user = new User();
        user.setEmail("test@example.com");

        // Act
        authService.updateBaseCurrency(user, "EUR");

        // Assert
        assertEquals("EUR", user.getBaseCurrency());
        verify(userRepository).save(user);
    }
}
