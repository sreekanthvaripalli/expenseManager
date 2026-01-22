package com.example.expensemanager.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String fullName;
    private String baseCurrency;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String fullName, String baseCurrency) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.baseCurrency = baseCurrency;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }
}
