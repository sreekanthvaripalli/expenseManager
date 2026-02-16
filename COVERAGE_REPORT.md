# Code Coverage Report - Expense Manager

## Last Run: February 16, 2026

---

## Backend Coverage (JaCoCo)

### Overall
- **Instructions**: 77%
- **Branches**: 51%
- **Lines**: 80%
- **Methods**: 88%
- **Classes**: 96%

### By Package
| Package | Instructions | Branches | Lines | Methods |
|---------|-------------|----------|-------|---------|
| Models | 98% | n/a | 100% | 100% |
| Config | 78% | 28% | 88% | 100% |
| Service | 78% | 58% | 80% | 88% |
| DTO | 86% | 50% | 86% | 85% |
| Controller | 63% | 50% | 76% | 75% |

### Test Summary
- **Total Tests**: 67
- **Test Classes**: 15
- **Source Files**: 28 classes

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
| **Backend** | **77%** (instructions), **80%** (lines) | 67 | ✅ Passing |
| **Frontend** | **76.04%** (statements), **78.1%** (lines) | 75 | ✅ Passing |
| **Combined** | **~77%** | **142** | - |

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
- Backend coverage is at 77% (below 85% target)
- Frontend coverage is at 76.04% (below 85% target)
- To reach 85% coverage, additional tests needed for:
  - Backend: BudgetController, CategoryController, more service edge cases
  - Frontend: SettingsPage (more interaction tests, form submissions, error handling)
