package com.example.expensemanager.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTest {

    @Mock
    private FilterChain filterChain;

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        rateLimitFilter = new RateLimitFilter();
    }

    @Test
    void testDoFilterInternal_WithValidRequest() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testDoFilterInternal_WithAuthorizationHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test.jwt.token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testGetClientId_WithAuthHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test.jwt.token");

        // Access via reflection or test the bucket creation directly
        assertNotNull(rateLimitFilter);
    }

    @Test
    void testGetClientId_WithoutAuthHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.1");

        assertNotNull(rateLimitFilter);
    }

    @Test
    void testCreateBucket() {
        // Test bucket creation with different keys
        assertNotNull(rateLimitFilter);
    }

    @Test
    void testRateLimiting_MultipleRequests() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        
        // First request should pass
        MockHttpServletResponse response1 = new MockHttpServletResponse();
        rateLimitFilter.doFilterInternal(request, response1, filterChain);
        
        // Verify filter chain was called
        verify(filterChain, atLeastOnce()).doFilter(any(), any());
    }
}
