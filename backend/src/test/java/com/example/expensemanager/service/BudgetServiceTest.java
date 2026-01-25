@Test
    void testUpdateBudget() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        Budget existingBudget = new Budget();
        existingBudget.setUser(user);

        BudgetRequest request = new BudgetRequest();
        request.setLimitAmount(new BigDecimal("600.00"));

        when(budgetRepository.findById(anyLong())).thenReturn(Optional.of(existingBudget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(existingBudget);

        // Act
        Budget result = budgetService.updateBudget(user, 1L, request);

        // Assert
        assertNotNull(result);
    }
