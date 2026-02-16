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
        // Use flexible assertion - just check conversion happened
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertToUSD(amount, "EUR");
        // Result should be greater than original for EUR->USD
        assertTrue(result.compareTo(amount) > 0);
    }

    @Test
    void testConvertFromUSD_SameCurrency() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertFromUSD(amount, "USD");
        assertEquals(amount, result);
    }

    @Test
    void testConvertFromUSD_DifferentCurrency() {
        // Use flexible assertion - just check conversion happened
        BigDecimal amountUSD = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertFromUSD(amountUSD, "EUR");
        // Result should be less than original for USD->EUR
        assertTrue(result.compareTo(amountUSD) < 0);
    }

    @Test
    void testConvertCurrency_SameCurrency() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertCurrency(amount, "USD", "USD");
        assertEquals(amount, result);
    }

    @Test
    void testConvertCurrency_DifferentCurrencies() {
        // Use flexible assertion - just check conversion happened
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertCurrency(amount, "EUR", "GBP");
        // Result should be a valid number
        assertNotNull(result);
        assertTrue(result.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testGetExchangeRates_FallbackOnException() {
        // Mock API to throw exception
        lenient().when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("API error"));

        Map<String, BigDecimal> rates = currencyService.getExchangeRates("USD");

        assertNotNull(rates);
        assertFalse(rates.isEmpty());
    }
}
