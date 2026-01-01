package com.example.expensemanager.dto;

import java.math.BigDecimal;
import java.util.Map;

public class ExpenseSummaryResponse {

    private BigDecimal total;
    private Map<String, BigDecimal> totalByCategory;

    public ExpenseSummaryResponse(BigDecimal total, Map<String, BigDecimal> totalByCategory) {
        this.total = total;
        this.totalByCategory = totalByCategory;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public Map<String, BigDecimal> getTotalByCategory() {
        return totalByCategory;
    }
}


