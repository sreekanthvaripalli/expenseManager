package com.example.expensemanager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@EnableCaching
public class CurrencyService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // ExchangeRate-API free tier endpoint
    private static final String EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/";

    public CurrencyService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Cacheable(value = "exchangeRates", key = "#baseCurrency")
    public Map<String, BigDecimal> getExchangeRates(String baseCurrency) {
        try {
            String url = EXCHANGE_RATE_API_URL + baseCurrency.toUpperCase();
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode rates = root.path("rates");

            Map<String, BigDecimal> exchangeRates = new HashMap<>();
            rates.fields().forEachRemaining(entry -> {
                exchangeRates.put(entry.getKey(), BigDecimal.valueOf(entry.getValue().asDouble()));
            });

            return exchangeRates;
        } catch (Exception e) {
            // Fallback: return direct conversion (1:1) if API fails
            Map<String, BigDecimal> fallbackRates = new HashMap<>();
            fallbackRates.put("USD", BigDecimal.ONE);
            fallbackRates.put("EUR", BigDecimal.ONE);
            fallbackRates.put("GBP", BigDecimal.ONE);
            fallbackRates.put("JPY", BigDecimal.ONE);
            fallbackRates.put("CNY", BigDecimal.ONE);
            fallbackRates.put("INR", BigDecimal.ONE);
            fallbackRates.put("AUD", BigDecimal.ONE);
            fallbackRates.put("CAD", BigDecimal.ONE);
            fallbackRates.put("CHF", BigDecimal.ONE);
            fallbackRates.put("SEK", BigDecimal.ONE);
            fallbackRates.put("NZD", BigDecimal.ONE);
            fallbackRates.put("SGD", BigDecimal.ONE);
            return fallbackRates;
        }
    }

    public BigDecimal convertToUSD(BigDecimal amount, String fromCurrency) {
        if ("USD".equalsIgnoreCase(fromCurrency)) {
            return amount;
        }

        Map<String, BigDecimal> rates = getExchangeRates("USD");
        BigDecimal rate = rates.get(fromCurrency.toUpperCase());

        if (rate != null) {
            return amount.divide(rate, 6, RoundingMode.HALF_UP);
        }

        // Fallback: return original amount if conversion fails
        return amount;
    }

    public BigDecimal convertFromUSD(BigDecimal amountUSD, String toCurrency) {
        if ("USD".equalsIgnoreCase(toCurrency)) {
            return amountUSD;
        }

        Map<String, BigDecimal> rates = getExchangeRates("USD");
        BigDecimal rate = rates.get(toCurrency.toUpperCase());

        if (rate != null) {
            return amountUSD.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        }

        // Fallback: return USD amount if conversion fails
        return amountUSD;
    }

    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return amount;
        }

        // Convert to USD first, then to target currency
        BigDecimal amountUSD = convertToUSD(amount, fromCurrency);
        return convertFromUSD(amountUSD, toCurrency);
    }
}
