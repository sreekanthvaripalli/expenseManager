# Expense Manager API - Penetration Testing Guide

## Overview

This penetration testing suite provides comprehensive security testing coverage for the Expense Manager API. The suite is designed to identify vulnerabilities across multiple security domains including authentication, authorization, input validation, business logic, and more.

## Quick Start

1. **Import the Collection**: Import `penetration-testing-suite.postman_collection.json` into Postman
2. **Configure Environment Variables**: Set up the following variables in your Postman environment:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:8080`)
   - `validToken`: A valid JWT token for testing authenticated endpoints
   - `invalidToken`: An invalid JWT token for testing authentication bypass
   - `expiredToken`: An expired JWT token for testing token validation
   - `malformedToken`: A malformed JWT token for testing token parsing
   - `categoryId`, `expenseId`, `budgetId`: Valid IDs for testing specific resources

3. **Run Tests**: Execute the test suites in the following recommended order:
   - Authentication & Authorization Tests
   - Input Validation Tests (Expense, Budget, Category Management)
   - Business Logic Tests
   - Rate Limiting & DoS Tests
   - Header Manipulation Tests
   - Error Handling Tests

## Test Categories

### 1. Authentication & Authorization Tests

**Purpose**: Test authentication mechanisms, token validation, and authorization controls.

**Key Tests**:
- **Registration Security**: SQL injection, XSS, NoSQL injection, input validation
- **Login Security**: Authentication bypass attempts, timing attacks, brute force
- **Token Validation**: Expired tokens, malformed tokens, missing tokens
- **Authorization**: Access control for protected endpoints

**Security Focus**:
- SQL Injection prevention
- Cross-Site Scripting (XSS) protection
- NoSQL injection prevention
- Input validation and sanitization
- Authentication bypass prevention
- Token-based authentication security

### 2. Expense Management Tests

**Purpose**: Test all expense-related endpoints for security vulnerabilities.

**Key Tests**:
- **Create Expense**: Input validation, authentication bypass, injection attacks
- **List Expenses**: SQL injection in query parameters, authorization bypass
- **Update Expense**: Authentication bypass, injection attacks, data integrity
- **Delete Expense**: Authorization bypass, resource access control

**Security Focus**:
- Input validation for monetary amounts
- Date format validation and injection prevention
- Category ID validation and injection prevention
- Authorization checks for expense ownership
- XSS prevention in description fields

### 3. Budget Management Tests

**Purpose**: Test budget creation, modification, and deletion endpoints.

**Key Tests**:
- **Budget Creation**: Input validation, injection attacks, business logic flaws
- **Budget Updates**: Authorization bypass, injection attacks
- **Budget Deletion**: Authorization checks, resource access control

**Security Focus**:
- Financial data validation
- Budget limit validation
- Currency code validation
- Authorization for budget management
- Business logic validation for budget constraints

### 4. Category Management Tests

**Purpose**: Test category creation, listing, and deletion functionality.

**Key Tests**:
- **Category Creation**: Input validation, injection attacks, XSS prevention
- **Category Listing**: Authentication bypass, data exposure
- **Category Deletion**: Authorization checks, data integrity

**Security Focus**:
- Category name validation
- Color code validation
- XSS prevention in category names
- Authorization for category management

### 5. Business Logic Tests

**Purpose**: Test application-specific business rules and logic.

**Key Tests**:
- **Budget Constraints**: Creating expenses that exceed budget limits
- **Recurring Expenses**: Business logic for recurring transactions
- **Currency Handling**: Multi-currency support and validation
- **Date Range Validation**: Invalid date ranges and edge cases

**Security Focus**:
- Business rule enforcement
- Financial constraint validation
- Currency conversion security
- Date validation and manipulation prevention

### 6. Rate Limiting & DoS Tests

**Purpose**: Test application resilience against denial-of-service attacks.

**Key Tests**:
- **Rapid Requests**: Multiple rapid registration/login attempts
- **Large Payloads**: Large request bodies to test memory limits
- **Concurrent Requests**: Multiple simultaneous requests
- **Nested JSON**: Deeply nested JSON structures

**Security Focus**:
- Rate limiting implementation
- Resource exhaustion prevention
- Memory usage limits
- Request size limits

### 7. Header Manipulation Tests

**Purpose**: Test security implications of HTTP header manipulation.

**Key Tests**:
- **Content-Type Manipulation**: Invalid content types
- **Authorization Header**: Multiple authorization headers, different schemes
- **X-Forwarded-For**: IP address spoofing attempts

**Security Focus**:
- Header validation
- IP address validation
- Authorization header parsing
- Content-Type validation

### 8. Error Handling Tests

**Purpose**: Test error handling for information disclosure and system stability.

**Key Tests**:
- **Non-existent Endpoints**: 404 error handling
- **Wrong HTTP Methods**: Method not allowed responses
- **Malformed Requests**: Invalid JSON, empty bodies
- **System Errors**: Internal server error handling

**Security Focus**:
- Information disclosure prevention
- Error message sanitization
- System stability under error conditions
- Debug information exposure prevention

## Security Vulnerabilities Tested

### Injection Attacks
- **SQL Injection**: Testing for SQL injection in all user inputs
- **NoSQL Injection**: Testing for NoSQL injection in MongoDB-style queries
- **XSS (Cross-Site Scripting)**: Testing for reflected and stored XSS
- **Command Injection**: Testing for OS command injection (if applicable)

### Authentication & Authorization
- **Authentication Bypass**: Testing for ways to bypass authentication
- **Authorization Bypass**: Testing for privilege escalation
- **Session Management**: Testing session security and token validation
- **Brute Force Protection**: Testing for rate limiting on authentication

### Input Validation
- **Boundary Testing**: Testing with very large/small values
- **Type Validation**: Testing with wrong data types
- **Format Validation**: Testing with invalid formats (dates, currencies)
- **Length Validation**: Testing with very long inputs

### Business Logic
- **Financial Constraints**: Testing budget and expense limits
- **Data Integrity**: Testing for data consistency and validation
- **Workflow Bypass**: Testing for ways to bypass business processes

### Information Disclosure
- **Error Messages**: Testing for sensitive information in error responses
- **Debug Information**: Testing for debug information exposure
- **Enumeration**: Testing for user/account enumeration

## Expected Results

### Secure Implementation Indicators
- All authentication bypass attempts should return 401 Unauthorized
- All authorization bypass attempts should return 403 Forbidden
- All injection attempts should be properly sanitized or rejected
- All input validation failures should return 400 Bad Request
- Error messages should not disclose sensitive information
- Rate limiting should be enforced on authentication endpoints
- Business logic should prevent invalid financial operations

### Vulnerability Indicators
- Successful authentication with invalid/expired tokens
- Access to other users' data without proper authorization
- SQL injection successful (database errors or unexpected data)
- XSS successful (scripts executed in response)
- Information disclosure in error messages
- No rate limiting on authentication endpoints
- Business logic bypasses (creating invalid financial states)

## Running the Tests

### Individual Test Execution
1. Open Postman and import the collection
2. Select a specific test from the collection
3. Configure any required environment variables
4. Click "Send" to execute the test
5. Review the response for expected security behavior

### Bulk Test Execution
1. Use Postman's Collection Runner
2. Select the penetration testing collection
3. Configure environment variables
4. Set iteration count and delay between requests
5. Run the collection and review results

### Automated Testing
The collection can be integrated into CI/CD pipelines using Newman (Postman's command-line collection runner):

```bash
newman run penetration-testing-suite.postman_collection.json \
  -e your-environment.json \
  --reporters cli,html \
  --reporter-html-export penetration-test-results.html
```

## Security Recommendations

Based on the test results, consider implementing the following security measures:

### Authentication & Authorization
- Implement strong password policies
- Add rate limiting to authentication endpoints
- Use secure JWT token generation and validation
- Implement proper session management
- Add multi-factor authentication for sensitive operations

### Input Validation
- Implement comprehensive input validation on all endpoints
- Use parameterized queries to prevent SQL injection
- Sanitize all user inputs to prevent XSS
- Validate data types and ranges
- Implement size limits for request bodies

### Business Logic
- Implement proper authorization checks for all operations
- Validate business rules on the server side
- Prevent financial data manipulation
- Implement audit logging for sensitive operations
- Add transaction integrity checks

### Error Handling
- Implement generic error messages
- Log detailed errors server-side only
- Prevent information disclosure in responses
- Implement proper exception handling
- Monitor for unusual error patterns

## Test Maintenance

This penetration testing suite should be updated when:
- New endpoints are added to the API
- Business logic changes are implemented
- New security vulnerabilities are discovered
- API version changes occur
- New authentication mechanisms are implemented

Regular security testing should be performed:
- After major code changes
- Before production deployments
- As part of regular security assessments
- When new vulnerabilities are reported in dependencies

## Legal and Ethical Considerations

⚠️ **Important**: This penetration testing suite is intended for:
- Testing your own applications
- Testing applications you have explicit permission to test
- Educational purposes and security awareness

🚫 **Do not use** this suite to:
- Test systems without explicit permission
- Perform attacks on production systems without authorization
- Test systems where you are not the owner or do not have explicit testing rights

Always ensure you have proper authorization before conducting security testing on any system.