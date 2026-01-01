package com.example.expensemanager.dto;

import java.math.BigDecimal;

public class MonthlySummaryItem {

    private String month;
    private BigDecimal total;

    public MonthlySummaryItem(String month, BigDecimal total) {
        this.month = month;
        this.total = total;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getTotal() {
        return total;
    }
}