# Expense Manager - Enterprise-Grade Secure Application

A comprehensive full-stack expense management application with enterprise-grade security, built with Spring Boot (Java) and React (TypeScript). Features secure expense tracking, budget management, categorization, and detailed financial reports with interactive charts.

## 🏗️ Architecture

- **Backend**: Spring Boot 3.3.0 with Java 17, Spring Security 6.3.0, Argon2 password hashing, JWT authentication, H2/PostgreSQL database
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, Recharts for data visualization
- **Security**: TLS 1.3 encryption, AES-GCM data encryption, rate limiting, security audit logging
- **Database**: H2 (development), PostgreSQL (production)

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

### Required Software
- **Java 17** or higher
  - Download from: https://adoptium.net/
  - Verify: `java -version`
- **Node.js 18+** and npm
  - Download from: https://nodejs.org/
  - Verify: `node --version` and `npm --version`
- **Maven 3.6+** (usually comes with Java IDEs)
  - Verify: `mvn --version`

### Optional (Recommended)
- **Git** for version control
- **Visual Studio Code** or IntelliJ IDEA for development
- **Postman** for API testing

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/sreekanthvaripalli/expenseManager.git
cd expenseManager
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Install Dependencies and Run
```bash
# Compile and run the Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### Alternative: Using IDE
- Open the `backend` folder in your IDE (IntelliJ IDEA recommended)
- Run the `ExpenseManagerApplication.java` main class

### 3. Frontend Setup

#### Open New Terminal and Navigate to Frontend
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Run Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration

The application uses sensible defaults, but you can customize via `application.yml`:

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:h2:mem:expensedb
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

# JWT Configuration
jwt:
  secret: your-secret-key-here (min 32 characters)
  expiration: 86400000  # 24 hours in milliseconds
```

### Environment Variables

You can override JWT settings using environment variables:
```bash
export JWT_SECRET=your-custom-secret-key-minimum-32-characters
export JWT_EXPIRATION=86400000
```

### Database

- **Development**: Uses H2 in-memory database (data resets on restart)
- **Production**: Configure PostgreSQL/MySQL in `application.yml`

To access H2 console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:expensedb`
- Username: `sa`
- Password: (leave empty)

## 📖 How to Use

### 1. User Registration

1. Open the application in your browser
2. Click "Don't have an account? Sign up" on the login page
3. Fill in your details:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Confirm Password
4. Click "Create account"
5. You'll be automatically logged in and redirected to the dashboard

### 2. User Login

1. On the login page, enter your registered email and password
2. Click "Sign in"
3. You'll be redirected to the main application

### 3. Dashboard Overview

The dashboard provides:
- **Total Spending**: Summary of all expenses
- **Category Breakdown**: Visual representation of spending by category
- **Budget Status**: Current budget utilization with color-coded progress bars
- **Monthly Trends**: Interactive charts showing spending patterns

### 4. Managing Expenses

#### Add New Expense
1. Navigate to the "Expenses" page
2. Click "Add Expense" (or the + button)
3. Fill in expense details:
   - Amount
   - Date
   - Category (choose from your categories)
   - Description (optional)
   - Recurring flag (optional)
4. Click "Add Expense"

#### Edit/Delete Expenses
1. On the Expenses page, find your expense in the table
2. Click "Edit" to modify expense details
3. Click "Delete" to remove the expense
4. Confirm deletion when prompted

#### Filter Expenses
- Use the date range picker to filter expenses by date
- Select a category to view expenses for that category only
- Filters apply to both the table and summary calculations

### 5. Managing Categories

#### Add New Category
1. Go to Settings → Categories section
2. Enter category name
3. Choose a color (hex code or color picker)
4. Click "Add Category"

#### Delete Categories
1. Find the category in the list
2. Click the "Delete" button (trash icon)
3. Confirm deletion

**Note**: Default categories are created automatically when you register. You can add custom categories or delete unused ones.

### 6. Budget Management

#### Set Monthly Budgets
1. Go to Settings → Budgets section
2. Select the month and year (use navigation arrows)
3. For each category, enter a budget limit
4. Click "Add Budget" or "Update Budget"

#### Monitor Budget Status
- **Dashboard**: See budget progress bars and status
- **Expenses Page**: Budget warnings appear when approaching limits
- **Settings**: Detailed budget management with edit/delete options

#### Budget Status Colors
- 🟢 **Green**: Under 80% of budget
- 🟡 **Orange**: 80-99% of budget
- 🔴 **Red**: Over 100% of budget

### 7. Reports and Analytics

#### Monthly Trends
- View interactive bar charts showing spending across months
- Hover over bars to see exact amounts
- Charts update automatically as you add expenses

#### Budget Performance
- Compare actual spending vs. budgeted amounts
- See budget utilization percentages
- Identify categories where you're over/under budget

### 8. Currency Support

The application supports multiple currencies:
- USD, EUR, GBP, JPY, CNY, INR, AUD, CAD, CHF, SEK, NZD, SGD

To change currency:
1. Go to Settings
2. Select your preferred currency from the dropdown
3. All amounts will be displayed in the selected currency

**Note**: Currency selection is stored locally in your browser.

## 🧪 Testing

### Backend Tests

#### Run All Tests
```bash
cd backend
mvn test
```

#### Run Tests with Coverage Report
```bash
cd backend
mvn test jacoco:report
```

#### View Coverage Report
Open `backend/target/site/jacoco/index.html` in your browser

#### Run Specific Test Class
```bash
cd backend
mvn test -Dtest=AuthServiceTest
```

#### Run Tests Excluding Integration Tests
```bash
cd backend
mvn test -DskipIntegrationTests=true
```

### Frontend Tests

#### Run All Tests
```bash
cd frontend
npm test
```

#### Run Tests in Watch Mode
```bash
cd frontend
npm test -- --watch
```

#### Run Tests with Coverage
```bash
cd frontend
npm test -- --run --coverage
```

#### View Coverage Report
Open `frontend/coverage/index.html` in your browser

#### Run Specific Test File
```bash
cd frontend
npm test -- --run LoginPage.test.tsx
```

### Test Coverage Summary

| Component | Coverage | Tests |
|-----------|----------|-------|
| **Backend** | 82% instructions, 80% lines | 98 tests |
| **Frontend** | 76% statements, 78% lines | 75 tests |
| **Total** | ~79% | 173 tests |

### Running Both Tests Together
```bash
# Terminal 1 - Backend
cd backend && mvn test

# Terminal 2 - Frontend
cd frontend && npm test -- --run --coverage
```

## 🔍 API Documentation

The backend provides a comprehensive REST API. Access the Swagger documentation at:
`http://localhost:8080/swagger-ui.html`

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Expenses
- `GET /api/expenses` - List expenses (with optional filters)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/summary` - Get expense summary
- `GET /api/expenses/summary/monthly` - Get monthly summaries

#### Categories
- `GET /api/categories` - List user categories
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category

#### Budgets
- `GET /api/budgets?year={year}&month={month}` - List budgets with status
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

## 🏭 Production Deployment

### Backend Production Setup
1. Change database configuration to PostgreSQL/MySQL
2. Set strong JWT secret key
3. Configure proper CORS origins
4. Enable HTTPS
5. Set up proper logging

### Frontend Production Build
```bash
cd frontend
npm run build
```

Deploy the `dist` folder to your web server.

### Docker Deployment (Optional)

#### Build Docker Image
```bash
docker build -t expensemanager backend/
```

#### Run with Docker Compose
```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- Ensure Java 17+ is installed and JAVA_HOME is set
- Check that port 8080 is not in use
- Verify Maven installation
- Run `mvn clean compile` to ensure dependencies are downloaded

#### Frontend Won't Start
- Ensure Node.js 18+ is installed
- Check that port 5173 is not in use
- Try deleting `node_modules` and running `npm install` again

#### Authentication Issues
- Clear browser localStorage
- Check that backend is running on port 8080
- Verify JWT token hasn't expired (24 hours)
- Check browser console for CORS errors

#### Database Issues
- For H2 console access, ensure `spring.h2.console.enabled=true`
- Check database URL in application.yml
- Data resets on restart (H2 in-memory)

#### Test Failures
- Backend: Run `mvn clean test` to refresh
- Frontend: Delete `node_modules` and reinstall
- Check Java version (needs 17+)
- Ensure ports 8080 and 5173 are free

### Getting Help
- Check the browser developer console for frontend errors
- Check backend logs in the terminal where you ran `mvn spring-boot:run`
- Verify all prerequisites are installed correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass:
   - Backend: `mvn test`
   - Frontend: `npm test -- --run`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 Project Structure

```
expenseManager/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/        # Java source code
│   │   │   │   └── com/example/expensemanager/
│   │   │   │       ├── config/      # Security & JWT config
│   │   │   │       ├── controller/  # REST controllers
│   │   │   │       ├── dto/         # Data transfer objects
│   │   │   │       ├── model/       # Entity models
│   │   │   │       ├── repository/  # Data repositories
│   │   │   │       └── service/     # Business logic
│   │   │   └── resources/
│   │   │       └── application.yml  # App configuration
│   │   └── test/            # Test files
│   └── pom.xml              # Maven dependencies
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React contexts (Auth, Currency)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── styles.css      # Global styles
│   ├── package.json        # NPM dependencies
│   └── vite.config.ts      # Vite configuration
│
├── screenshots/             # Application screenshots
├── README.md               # This file
└── COVERAGE_REPORT.md      # Test coverage report
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Spring Boot and React
- Charts powered by Recharts
- UI styling with Tailwind CSS
- Authentication with JWT and Spring Security
- Password hashing with Argon2
