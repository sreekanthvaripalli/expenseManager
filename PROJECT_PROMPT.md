# Comprehensive Expense Manager Application - Creation Prompt

## Project Overview
Create a full-stack expense management application that allows users to track expenses, manage budgets, categorize spending, and view detailed reports with visual charts. The application should provide an intuitive interface for personal finance management.

---

## Technical Stack

### Backend
- **Framework**: Java Spring Boot 3.3.0
- **Java Version**: 17
- **Database**: H2 (in-memory for demo/development)
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Server Port**: 8080

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: CSS (custom styles with Tailwind-like utilities)
- **Dev Server Port**: 5173

---

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL
);
```

### 2. Categories Table
```sql
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. Expenses Table
```sql
CREATE TABLE expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  category_id BIGINT,
  amount DECIMAL(19,2) NOT NULL,
  expense_date DATE NOT NULL,
  description VARCHAR(255),
  recurring BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 4. Budgets Table
```sql
CREATE TABLE budgets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  category_id BIGINT,
  budget_year INT NOT NULL,
  budget_month INT NOT NULL,
  limit_amount DECIMAL(19,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**Note**: Use `budget_year`, `budget_month`, `expense_date`, and `full_name` as column names to avoid SQL reserved keyword conflicts in H2.

---

## Backend Implementation

### Entity Models (JPA)

#### User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false, name = "full_name")
    private String fullName;
    
    // Getters and setters
}
```

#### Category.java
```java
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column
    private String color;
    
    @ManyToOne(optional = false)
    private User user;
    
    // Getters and setters
}
```

#### Expense.java
```java
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    private User user;
    
    @ManyToOne
    private Category category;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column(nullable = false, name = "expense_date")
    private LocalDate date;
    
    @Column
    private String description;
    
    @Column
    private boolean recurring;
    
    // Getters and setters
}
```

#### Budget.java
```java
@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    private User user;
    
    @ManyToOne
    private Category category; // null = overall budget
    
    @Column(nullable = false, name = "budget_year")
    private int year;
    
    @Column(nullable = false, name = "budget_month")
    private int month; // 1-12
    
    @Column(nullable = false)
    private BigDecimal limitAmount;
    
    // Getters and setters
}
```

### DTOs (Data Transfer Objects)

Create DTOs for:
- **ExpenseRequest**: amount, date, description, recurring, categoryId
- **ExpenseSummaryResponse**: total, totalByCategory (Map<String, BigDecimal>)
- **MonthlySummaryItem**: month (String), total (BigDecimal)
- **CategoryRequest**: name, color
- **BudgetRequest**: year, month, limitAmount, categoryId
- **BudgetStatusResponse**: id, year, month, categoryId, categoryName, limitAmount, spent, remaining (calculated), percentUsed (calculated)

### Repositories (Spring Data JPA)

Create repositories extending `JpaRepository`:
- **UserRepository**
- **CategoryRepository**: findByUser(User user)
- **ExpenseRepository**: Custom query method for filtering by user, category, date range
- **BudgetRepository**: findByUserAndYearAndMonth(User user, int year, int month)

### Services

#### ExpenseService
- createExpense(User user, ExpenseRequest request)
- updateExpense(User user, Long id, ExpenseRequest request)
- deleteExpense(User user, Long id)
- getExpenses(User user, Long categoryId, LocalDate startDate, LocalDate endDate)
- summarize(User user, LocalDate startDate, LocalDate endDate)
- monthlySummary(User user, int year)

#### BudgetService
- createBudget(User user, BudgetRequest request)
- updateBudget(User user, Long id, BudgetRequest request)
- getBudgetsWithStatus(User user, int year, int month) - calculates spent amounts
- deleteBudget(Long id)

### REST Controllers

#### ExpenseController (@RequestMapping("/api/expenses"))
- POST / - Create expense
- PUT /{id} - Update expense
- DELETE /{id} - Delete expense
- GET / - List expenses (with filters: categoryId, startDate, endDate)
- GET /summary - Get expense summary
- GET /summary/monthly?year={year} - Get monthly summary

#### CategoryController (@RequestMapping("/api/categories"))
- GET / - List categories
- POST / - Create category
- DELETE /{id} - Delete category

#### BudgetController (@RequestMapping("/api/budgets"))
- GET /?year={year}&month={month} - List budgets with status
- POST / - Create budget
- PUT /{id} - Update budget
- DELETE /{id} - Delete budget

### Configuration

#### application.yml
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:expensedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driverClassName: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
  h2:
    console:
      enabled: true

server:
  port: 8080

springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs
```

#### CORS Configuration
Enable CORS for all controllers with `@CrossOrigin(origins = "http://localhost:5173")`

#### Demo Data Seed
Create a CommandLineRunner to seed a demo user and default categories on startup:
```java
@Bean
CommandLineRunner seedDemoData(UserRepository userRepository, CategoryRepository categoryRepository) {
    return args -> {
        if (userRepository.count() == 0) {
            User u = new User();
            u.setEmail("demo@example.com");
            u.setFullName("Demo User");
            u.setPasswordHash("demo");
            userRepository.save(u);

            // Create default categories
            createCategory(categoryRepository, u, "Food & Dining", "#ef4444");
            createCategory(categoryRepository, u, "Transportation", "#f59e0b");
            createCategory(categoryRepository, u, "Shopping", "#8b5cf6");
            createCategory(categoryRepository, u, "Entertainment", "#ec4899");
            createCategory(categoryRepository, u, "Bills & Utilities", "#0ea5e9");
            createCategory(categoryRepository, u, "Healthcare", "#10b981");
            createCategory(categoryRepository, u, "Education", "#6366f1");
            createCategory(categoryRepository, u, "Travel", "#14b8a6");
            createCategory(categoryRepository, u, "Groceries", "#84cc16");
            createCategory(categoryRepository, u, "Home & Garden", "#f97316");
            createCategory(categoryRepository, u, "Personal Care", "#a855f7");
            createCategory(categoryRepository, u, "Gifts & Donations", "#06b6d4");
        }
    };
}

private void createCategory(CategoryRepository categoryRepository, User user, String name, String color) {
    Category category = new Category();
    category.setUser(user);
    category.setName(name);
    category.setColor(color);
    categoryRepository.save(category);
}
```

**Default Categories** (12 categories with distinct colors):
1. **Food & Dining** - #ef4444 (Red)
2. **Transportation** - #f59e0b (Orange)
3. **Shopping** - #8b5cf6 (Purple)
4. **Entertainment** - #ec4899 (Pink)
5. **Bills & Utilities** - #0ea5e9 (Blue)
6. **Healthcare** - #10b981 (Green)
7. **Education** - #6366f1 (Indigo)
8. **Travel** - #14b8a6 (Teal)
9. **Groceries** - #84cc16 (Lime)
10. **Home & Garden** - #f97316 (Deep Orange)
11. **Personal Care** - #a855f7 (Violet)
12. **Gifts & Donations** - #06b6d4 (Cyan)

---

## Frontend Implementation

### Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── contexts/
│   │   └── CurrencyContext.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

### Currency Context
Create a React Context for currency management supporting 12 currencies (USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, CHF, SEK, NZD, SGD). Store selection in localStorage and provide formatAmount function.

### API Service (api.ts)
Create axios client with baseURL "http://localhost:8080/api" and functions for:
- Expenses: getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary, getMonthlySummary
- Categories: getCategories, createCategory, deleteCategory
- Budgets: getBudgets, createBudget, updateBudget, deleteBudget

### Pages

#### 1. DashboardPage
**Features**:
- Total spent summary card
- Spending by category card
- Current month budget overview with visual progress bars
- Color-coded budget status (green < 80%, orange 80-99%, red ≥ 100%)
- Highlighted cards for exceeded budgets

**Components**:
- Summary cards showing total expenses
- Category breakdown list
- Budget cards with:
  - Category name
  - Spent / Limit amounts
  - Progress bar
  - Percentage used
  - Remaining or overage amount

#### 2. ExpensesPage
**Features**:
- Add/Edit expense form with fields: amount, date, category, description, recurring
- Budget warning banner (alerts for exceeded or near-limit budgets)
- Filter section (date range, category)
- Current month budget summary
- Expense list table with Edit and Delete actions
- Form switches between "Add" and "Edit" modes
- Cancel button when editing
- Auto-scroll to form when editing

**Components**:
- Dynamic form header based on editing state
- Warning alerts at top
- Filters with apply button
- Budget summary cards
- Data table with action buttons

#### 3. ReportsPage
**Features**:
- Total expenses summary
- Category breakdown
- Monthly trend bar chart for current year (using Recharts)
- Budget performance section showing:
  - Budget vs Actual comparison
  - 3-column grid (Budget, Spent, Remaining/Over)
  - Progress bars
  - "On Track" / "Over Budget" status badges

**Components**:
- Summary cards
- Recharts BarChart component
- Budget performance cards with detailed metrics

#### 4. SettingsPage
**Features**:
- Currency selector (dropdown with 12 currencies)
- Category management:
  - Add category with name and color picker
  - List categories with color indicators
  - Delete categories
- Budget management:
  - Month navigation (Previous/Next buttons)
  - Add budget form (category, monthly limit)
  - Visual budget cards with:
    - Spent vs Limit breakdown
    - Progress bars
    - Percentage and remaining amount
    - Delete button
  - Empty state message when no budgets exist

**Components**:
- Currency select dropdown
- Category form with color input
- Budget navigation with month/year display
- Budget cards with detailed metrics

### Routing (App.tsx)
Use React Router with:
- Sidebar navigation
- Routes: /, /expenses, /reports, /settings
- Active link highlighting

### Styling
Create CSS with:
- Cards with shadows and rounded corners
- Form grids for responsive layouts
- Tables with alternating row colors
- Primary and secondary button styles
- Color scheme: 
  - Primary: #0ea5e9 (blue)
  - Success: #10b981 (green)
  - Warning: #f59e0b (orange)
  - Error: #ef4444 (red)
  - Backgrounds: #f8fafc, #fef2f2 (error), #fffbeb (warning)

---

## Key Features Implementation Details

### Budget Functionality
1. **Backend**: 
   - BudgetService calculates spent amount by querying expenses for the budget period
   - Returns BudgetStatusResponse with calculated fields (remaining, percentUsed)
   - PUT endpoint allows budget updates for adjusting limits when needed
   
2. **Frontend**:
   - Fetch budgets for current month on Dashboard, Expenses, and Reports pages
   - Visual progress bars showing budget utilization
   - Color-coded warnings (green/orange/red)
   - Month navigation in Settings
   - Edit/Update functionality to adjust budgets for overflow management
   - Cancel button to exit edit mode

### Expense Edit/Update
1. **Backend**:
   - PUT /api/expenses/{id} endpoint
   - ExpenseService.updateExpense with user authorization check
   
2. **Frontend**:
   - Edit button populates form with expense data
   - Form title changes to "Edit expense"
   - Submit button changes to "Update"
   - Cancel button appears to exit edit mode
   - Auto-scroll to form when editing

### Expense Delete
1. **Backend**:
   - DELETE /api/expenses/{id} endpoint
   - User authorization check before deletion
   
2. **Frontend**:
   - Delete button in expense table
   - Confirmation dialog before deletion
   - Refresh list and budgets after deletion

### Category-based Filtering
- Expenses can be filtered by category
- Filter applies to both table view and summaries
- Date range filtering also supported

### Currency Support
- 12 currencies supported
- Currency stored in localStorage
- formatAmount function handles locale-specific formatting
- Currency symbol shown in budget forms

### Charts and Visualizations
- Monthly trend chart using Recharts library
- Bar chart showing spending across 12 months
- Responsive container for proper sizing
- Custom tooltip with currency formatting

---

## Application Flow

### Initial Setup
1. Start backend Spring Boot application
2. H2 creates database schema automatically (ddl-auto: create-drop)
3. Demo user and 12 default categories are seeded automatically
4. Start frontend Vite dev server
5. Frontend connects to backend at localhost:8080

### User Workflow
1. **Dashboard**: View overall spending and budget status
2. **Expenses**: Add/edit/delete expenses with category assignment
3. **Reports**: Analyze spending patterns with charts
4. **Settings**: 
   - Select preferred currency
   - Create/manage categories
   - Set monthly budgets by category

### Data Relationships
- User → has many → Categories, Expenses, Budgets
- Category → has many → Expenses, Budgets (optional)
- Budget → tracks spending for → Category (or all expenses if null)

---

## Development Instructions

### Backend Setup
1. Create Maven project with Spring Initializr
2. Dependencies: Spring Web, Spring Data JPA, H2 Database, Validation, SpringDoc OpenAPI
3. Create entity models with proper JPA annotations
4. Create repositories extending JpaRepository
5. Implement service layer with business logic
6. Create REST controllers with proper endpoints
7. Configure application.yml
8. Add CommandLineRunner to seed demo user and 12 default categories
9. Enable CORS for frontend origin

### Frontend Setup
1. Create Vite React TypeScript project
2. Install dependencies: react-router-dom, axios, recharts
3. Create folder structure (pages, services, contexts)
4. Implement CurrencyContext with localStorage
5. Create API service with axios client
6. Build page components with proper state management
7. Add routing with React Router
8. Style with CSS

### Testing
1. Test all CRUD operations for expenses
2. Verify budget calculations are accurate
3. Test edit and delete functionality
4. Verify budget warnings appear correctly
5. Test category filtering
6. Verify currency formatting works
7. Test month navigation in budgets
8. Verify charts render properly

---

## Important Considerations

### Reserved Keywords
Avoid SQL reserved keywords in H2:
- Use `budget_year` instead of `year`
- Use `budget_month` instead of `month`
- Use `expense_date` instead of `date`
- Use `full_name` instead of `fullname`

### Hibernate Configuration
Use `ddl-auto: create-drop` for development with H2 in-memory database. This ensures schema is recreated on each restart.

### Security Note
This is a demo application with simplified authentication (no real auth implemented). For production:
- Implement Spring Security
- Add JWT or session-based authentication
- Hash passwords with BCrypt
- Add proper user authorization checks

### Performance
For production:
- Switch from H2 to PostgreSQL/MySQL
- Add database indexes on foreign keys and date columns
- Implement pagination for expense lists
- Add caching for frequently accessed data

---

## Testing

### Backend Testing (JUnit 5 + Mockito)

#### Required Dependencies (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

#### Test Structure
```
src/test/java/com/example/expensemanager/
├── service/
│   ├── ExpenseServiceTest.java
│   └── BudgetServiceTest.java
├── controller/
│   ├── ExpenseControllerTest.java
│   ├── CategoryControllerTest.java
│   └── BudgetControllerTest.java
└── model/
    ├── ExpenseTest.java
    └── BudgetTest.java
```

#### Key Test Areas
1. **Service Layer Tests**:
   - Test create, update, delete operations
   - Test business logic calculations (budget percentages, summaries)
   - Test unauthorized access scenarios
   - Mock repositories and dependencies

2. **Controller Layer Tests** (@WebMvcTest):
   - Test HTTP endpoints (GET, POST, PUT, DELETE)
   - Test request/response JSON serialization
   - Test validation errors
   - Mock service layer

3. **Model Tests**:
   - Test entity getters/setters
   - Test JPA relationships
   - Test validation constraints

#### Running Tests
```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report

# Run specific test
mvn test -Dtest=ExpenseServiceTest
```

### Frontend Testing (Vitest + React Testing Library)

#### Required Dependencies (package.json)
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

#### Test Structure
```
src/
├── pages/
│   ├── __tests__/
│   │   ├── DashboardPage.test.tsx
│   │   ├── ExpensesPage.test.tsx
│   │   ├── ReportsPage.test.tsx
│   │   └── SettingsPage.test.tsx
├── services/
│   └── __tests__/
│       └── api.test.ts
└── contexts/
    └── __tests__/
        └── CurrencyContext.test.tsx
```

#### Key Test Areas
1. **Component Tests**:
   - Test rendering and UI elements
   - Test user interactions (clicks, form submissions)
   - Test state changes
   - Mock API calls

2. **API Service Tests**:
   - Test all API functions
   - Mock axios requests
   - Test error handling

3. **Context Tests**:
   - Test currency formatting
   - Test localStorage integration

#### Running Tests
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Test Coverage Goals
- Service Layer: 80%+
- Controller Layer: 75%+
- Frontend Components: 70%+
- API Service: 85%+

### Best Practices
1. Use AAA pattern (Arrange, Act, Assert)
2. Mock external dependencies
3. Test edge cases and error scenarios
4. Keep tests independent and isolated
5. Use descriptive test names
6. One assertion per test when possible

For comprehensive testing examples, see `TESTING_GUIDE.md`.

---

## Expected Outcome

A fully functional expense management application where users can:
1. ✅ Track expenses with categories, descriptions, and dates
2. ✅ Edit and delete existing expenses
3. ✅ Set monthly budgets per category or overall
4. ✅ Edit and update budgets to manage overflows
5. ✅ View real-time budget status with visual indicators
6. ✅ See spending summaries and category breakdowns
7. ✅ Analyze monthly trends with interactive charts
7. ✅ Manage categories with custom colors
8. ✅ Switch between 12 different currencies
9. ✅ Navigate through different months for budget management
10. ✅ Receive warnings when approaching or exceeding budgets

The application should have a clean, modern UI with responsive design and intuitive navigation.
