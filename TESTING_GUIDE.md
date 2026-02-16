# Testing Guide for Expense Manager Application

## Overview

This guide covers running tests, understanding coverage reports, and best practices for both backend (Java/Spring Boot) and frontend (React/TypeScript) components.

---

## Quick Test Commands

### Backend Tests
```bash
# Navigate to backend directory
cd backend

# Run all tests
mvn test

# Run tests with code coverage
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=ExpenseServiceTest

# Run tests in debug mode
mvn test -Ddebug
```

### Frontend Tests
```bash
# Navigate to frontend directory
cd frontend

# Run all tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --run --coverage

# Run specific test file
npm test -- --run LoginPage.test.tsx
```

---

## Test Coverage Summary

| Component | Coverage | Tests |
|-----------|----------|-------|
| **Backend** | 77% instructions, 80% lines | 67 tests |
| **Frontend** | 76% statements, 78% lines | 75 tests |
| **Total** | ~77% | 142 tests |

### Viewing Coverage Reports

- **Backend**: Open `backend/target/site/jacoco/index.html` in browser
- **Frontend**: Open `frontend/coverage/index.html` in browser

---

## Backend Testing (Java/JUnit 5 + Mockito)

### Project Structure
```
backend/src/test/java/com/example/expensemanager/
├── config/          # Configuration tests
├── controller/      # Controller tests  
├── model/           # Entity tests
├── repository/      # Repository tests
└── service/        # Service tests
```

### Running Backend Tests

```bash
# Run all tests
cd backend
mvn test

# Run with coverage report
mvn test jacoco:report

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run tests matching pattern
mvn test -Dtest="*ServiceTest"
```

### Backend Test Classes

| Test Class | Coverage Area |
|------------|---------------|
| `ExpenseServiceTest` | Expense business logic |
| `AuthServiceTest` | Authentication logic |
| `BudgetServiceTest` | Budget management |
| `CurrencyServiceTest` | Currency conversion |
| `ExpenseControllerTest` | Expense endpoints |
| `AuthControllerTest` | Auth endpoints |
| `BudgetTest` | Budget entity |
| `CategoryTest` | Category entity |
| `ExpenseTest` | Expense entity |
| `UserTest` | User entity |

---

## Frontend Testing (React/Vitest/React Testing Library)

### Project Structure
```
frontend/src/
├── contexts/           # Context tests
│   ├── AuthContext.test.tsx
│   └── CurrencyContext.test.tsx
├── pages/              # Page component tests
│   ├── DashboardPage.test.tsx
│   ├── ExpensesPage.test.tsx
│   ├── LoginPage.test.tsx
│   ├── RegisterPage.test.tsx
│   ├── ReportsPage.test.tsx
│   └── SettingsPage.test.tsx
├── services/           # API service tests
│   └── api.test.ts
└── test/              # Test setup
    └── setup.ts
```

### Running Frontend Tests

```bash
# Run all tests once
cd frontend
npm test -- --run

# Run with coverage
npm test -- --run --coverage

# Run in watch mode
npm test

# Run specific file
npm test -- --run DashboardPage.test.tsx
```

### Frontend Test Files

| Test File | Coverage Area |
|-----------|---------------|
| `api.test.ts` | All API functions (24 tests) |
| `AuthContext.test.tsx` | Authentication context (10 tests) |
| `CurrencyContext.test.tsx` | Currency context (6 tests) |
| `DashboardPage.test.tsx` | Dashboard page (9 tests) |
| `LoginPage.test.tsx` | Login page |
| `RegisterPage.test.tsx` | Registration page |
| `ReportsPage.test.tsx` | Reports page (6 tests) |
| `SettingsPage.test.tsx` | Settings page (11 tests) |

---

## Writing Tests

### Backend Service Test Example

```java
@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void createExpense_ShouldReturnSavedExpense() {
        // Arrange
        ExpenseRequest request = new ExpenseRequest();
        request.setAmount(new BigDecimal("50.00"));
        
        when(expenseRepository.save(any(Expense.class)))
            .thenReturn(testExpense);

        // Act
        Expense result = expenseService.createExpense(user, request);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("50.00"), result.getAmount());
    }
}
```

### Frontend Component Test Example

```typescript
describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'abc', email: 'test@test.com' });
    
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign in'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
```

---

## Test Best Practices

### Backend
1. **Use AAA Pattern**: Arrange, Act, Assert
2. **Mock External Dependencies**: Database, external APIs
3. **Test Edge Cases**: Null values, empty lists, exceptions
4. **Use Descriptive Names**: `shouldReturnExpense_WhenValidRequest`
5. **Test Authorization**: Ensure users can only access their own data

### Frontend
1. **Test User Interactions**: Clicks, form submissions
2. **Mock API Calls**: Use vi.fn() for mocking
3. **Test Error States**: Loading, errors, empty states
4. **Use waitFor**: For async operations
5. **Test Context Providers**: Wrap components properly

---

## Troubleshooting

### Backend Tests Fail
```bash
# Clean and rebuild
mvn clean test

# Check Java version (needs 17+)
java -version
```

### Frontend Tests Fail
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear vitest cache
rm -rf node_modules/.vitest
```

### Coverage Not Updating
```bash
# Backend
mvn clean test jacoco:report

# Frontend
rm -rf coverage
npm test -- --run --coverage
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run backend tests
        run: cd backend && mvn test

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run frontend tests
        run: cd frontend && npm test -- --run
```

---

## Coverage Goals

| Layer | Target |
|-------|--------|
| Service Layer | 80%+ |
| Controller Layer | 75%+ |
| Models | 70%+ |
| Frontend Components | 70%+ |
| API Service | 85%+ |

Current Status:
- ✅ Backend Service: 78%
- ✅ Backend Controller: 63%
- ✅ Backend Models: 98%
- ✅ Frontend: 76%

---

## Additional Resources

- [JUnit 5 Documentation](https://junit.org/junit5/)
- [Mockito Documentation](https://site.mockito.org/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
