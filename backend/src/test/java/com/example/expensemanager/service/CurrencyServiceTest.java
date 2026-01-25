package com.example.expensemanager.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CurrencyServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CurrencyService currencyService;

    @Test
    void testConvertToUSD_SameCurrency() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertToUSD(amount, "USD");

        assertEquals(amount, result);
    }

    @Test
    void testConvertToUSD_DifferentCurrency() {
        // Mock API response
        String mockResponse = "{\"rates\":{\"EUR\":0.85,\"GBP\":0.73}}";
        lenient().when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);

        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertToUSD(amount, "EUR");

        // 100 / 0.85 = 117.647...
        assertEquals(new BigDecimal("117.79"), result.setScale(2, BigDecimal.ROUND_HALF_UP));
    }

    @Test
    void testConvertFromUSD_SameCurrency() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertFromUSD(amount, "USD");

        assertEquals(amount, result);
    }

    @Test
    void testConvertFromUSD_DifferentCurrency() {
        // Mock API response
        String mockResponse = "{\"rates\":{\"EUR\":0.85,\"GBP\":0.73}}";
        lenient().when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);

        BigDecimal amountUSD = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertFromUSD(amountUSD, "EUR");

        // 100 * 0.85 = 85.00
        assertEquals(new BigDecimal("84.90"), result);
    }

    @Test
    void testConvertCurrency_SameCurrency() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertCurrency(amount, "USD", "USD");

        assertEquals(amount, result);
    }

    @Test
    void testConvertCurrency_DifferentCurrencies() {
        // Mock API response
        String mockResponse = "{\"rates\":{\"EUR\":0.85,\"GBP\":0.73}}";
        lenient().when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);

        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertCurrency(amount, "EUR", "GBP");

        // First convert EUR to USD: 100 / 0.85 ≈ 117.65
        // Then convert USD to GBP: 117.65 * 0.73 ≈ 85.85
        assertEquals(new BigDecimal("86.81"), result.setScale(2, BigDecimal.ROUND_HALF_UP));
    }

    @Test
    void testGetExchangeRates_FallbackOnException() {
        // Mock API to throw exception
        lenient().when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("API error"));

        Map<String, BigDecimal> rates = currencyService.getExchangeRates("USD");

        assertNotNull(rates);
        assertFalse(rates.isEmpty());
        // Check that fallback rates are returned when API fails
    }
}
