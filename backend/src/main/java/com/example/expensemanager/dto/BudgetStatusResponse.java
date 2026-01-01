package com.example.expensemanager.dto;

import java.math.BigDecimal;

public class BudgetStatusResponse {

    private Long id;
    private Integer year;
    private Integer month;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private int percentUsed;

    public BudgetStatusResponse(Long id,
                                Integer year,
                                Integer month,
                                Long categoryId,
                                String categoryName,
                                BigDecimal limitAmount,
                                BigDecimal spent) {
        this.id = id;
        this.year = year;
        this.month = month;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.limitAmount = limitAmount;
        this.spent = spent;
        this.remaining = limitAmount.subtract(spent);
        if (limitAmount.signum() > 0) {
            this.percentUsed = spent.multiply(BigDecimal.valueOf(100))
                    .divide(limitAmount, 0, BigDecimal.ROUND_HALF_UP)
                    .intValue();
        } else {
            this.percentUsed = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public Integer getYear() {
        return year;
    }

    public Integer getMonth() {
        return month;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public BigDecimal getLimitAmount() {
        return limitAmount;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }

    public int getPercentUsed() {
        return percentUsed;
    }
}


