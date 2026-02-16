# Code Coverage Report - Expense Manager

## Last Run: February 16, 2026 (11:51 PM)

---

## Backend Coverage (JaCoCo)

### Overall
- **Instructions**: 82%
- **Branches**: 57%
- **Lines**: 80%
- **Methods**: 92%
- **Classes**: 100%

### By Package
| Package | Instructions | Branches | Lines | Methods |
|---------|-------------|----------|-------|---------|
| Models | 100% | n/a | 100% | 100% |
| Config | 84% | 40% | 62% | 100% |
| Service | 85% | 67% | 88% | 100% |
| DTO | 86% | 50% | 87% | 67% |
| Controller | 63% | 43% | 76% | 57% |

### Test Summary
- **Total Tests**: 98
- **Test Classes**: 18
- **Source Files**: 31 classes

### Notes
- Coverage improved from 78% to 82% after adding more tests
- Added tests for BudgetService, AuditService, RateLimitFilter, GlobalExceptionHandler
- Models package at 100% coverage
- Service package at 85% coverage
- DTO package improved to 86% coverage
- Controller package improved to 63% coverage (+19% from adding GlobalExceptionHandler tests)
- Test count: 98 tests

---

## Frontend Coverage (Vitest/V8)

### Overall
- **Statements**: 76.04%
- **Branches**: 56.7%
- **Functions**: 68.88%
- **Lines**: 78.1%

### By File
| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| pages/LoginPage.tsx | 91.3% | 61.11% | 80% | 91.3% |
| pages/RegisterPage.tsx | 96.55% | 80% | 100% | 96.55% |
| pages/DashboardPage.tsx | 100% | 100% | 100% | 100% |
| pages/SettingsPage.tsx | 43.8% | 29.48% | 35.13% | 46.31% |
| pages/ReportsPage.tsx | 93.75% | 95.45% | 80% | 93.75% |
| contexts/CurrencyContext.tsx | 90.9% | 62.5% | 87.5% | 95% |
| contexts/AuthContext.tsx | 100% | 87.5% | 100% | 100% |
| services/api.ts | 88.23% | 0% | 94.11% | 88.23% |

### Test Summary
- **Total Tests**: 75
- **Test Files**: 8

---

## Combined Summary

| Component | Coverage | Tests | Status |
|-----------|----------|-------|--------|
| **Backend** | **82%** (instructions), **80%** (lines) | 98 | ✅ Passing |
| **Frontend** | **76.04%** (statements), **78.1%** (lines) | 75 | ✅ Passing |
| **Combined** | **~79%** | **173** | - |

---

## How to Run Tests

### Backend
```bash
cd backend
mvn clean test jacoco:report
# View report at: target/site/jacoco/index.html
```

### Frontend
```bash
cd frontend
npm test -- --run --coverage
# View report at: coverage/index.html
```

---

## Notes
- Backend coverage improved from 78% to 82% after adding more tests
- Added 31 new tests for BudgetService, AuditService, RateLimitFilter, GlobalExceptionHandler
- Models package at 100% coverage
- Service package at 85% coverage
- DTO package improved to 86% coverage
- Controller package improved to 63% coverage
- Frontend coverage remains at 76.04%
- Backend is now very close to the 85% target (only 3% away)
- To reach 85% target, more tests needed for remaining controller endpoints
