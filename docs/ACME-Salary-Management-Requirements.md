# ACME Employee Salary Management — Requirements

## 1. Description

ACME currently manages salary information for 10,000 employees across multiple countries using Excel spreadsheets. The proposed system is a web-based internal application for HR Managers to manage employee records and current base salaries. It will also provide structured salary insights to help HR understand how the organization pays its employees.

## 2. Goal & User

### Goal

Provide the HR Manager with a centralized and reliable system to manage employee salary information and understand organizational salary patterns through structured dashboards, metrics, and interactive filters.

### Primary User

**HR Manager**

The application assumes the user is already authenticated as an HR Manager.

## 3. Functional Requirements

### Employee Management

The HR Manager should be able to:

- View employees with pagination.
- Search and filter employees.
- Create employees.
- Update employee details.
- View employee details and current salary.
- Deactivate employees without permanently deleting their records.

Employee attributes include:

- Employee ID
- Name
- Department
- Job Title
- Country/Location
- Date Joined
- Status (Active/Inactive)

### Salary Management

The HR Manager should be able to:

- View an employee's current base salary.
- Update the current base salary.
- Store salary in the employee's native/local currency.

### Salary Insights

The system should provide structured dashboards containing:

- Total payroll spend.
- Average and median pay by department and country.
- Salary bands.
- Salary distribution by department and country.
- Interactive filters for exploring salary information.

For cross-country reporting, local salaries should be normalized to a common reporting currency such as USD using seeded exchange rates.

### Data Seeding

The system should provide a seed mechanism containing 10,000 representative employee records with salary, currency, and exchange-rate data.

## 4. Non-Functional Requirements

- **Performance:** The application should efficiently support at least 10,000 employees. Search, filtering, sorting, and pagination should be handled efficiently through backend/database operations.
- **Maintainability:** Code should be modular, readable, and maintainable with clear separation of responsibilities.
- **Testability:** Core business behavior should be covered by fast, deterministic, easy-to-understand automated tests following a test-first/TDD-oriented approach.
- **Reliability:** Salary calculations, currency normalization, and analytics should produce consistent and deterministic results.
- **CI/CD:** Automated CI checks should validate tests, type checking, linting, and builds.
- **Deployment:** The application should be fully functional and deployed for remote evaluation.

## 5. Business Rules & Key Decisions

- Only **base salary** is required for the MVP.
- Salary revision history and effective-dated audit trails are not required.
- Salaries are stored in the employee's native currency.
- Cross-country salary aggregations use a common reporting currency with seeded exchange rates.
- Live exchange-rate integration is not required.
- Employee records are **soft-deactivated** rather than permanently deleted so organizational analytics remain accurate.
- Salary insights are provided through structured dashboards, KPIs, visualizations, and interactive filters.

## 6. Out of Scope

The following are intentionally excluded from the MVP:

- Authentication / SSO
- Employee self-service
- Payroll processing
- Tax calculations
- Bonuses, equity, and allowances
- Full salary revision history
- Live exchange-rate integration
- Natural-language salary queries
- AI chatbot functionality

These features are excluded to keep the MVP focused on employee salary management and organizational salary insights while avoiding unnecessary complexity.

## 7. Success Criteria

The MVP is successful when the HR Manager can:

- Manage employee records and current base salaries.
- Create, update, search, filter, and deactivate employees.
- View organizational salary insights through dashboards.
- Analyze payroll and salary distribution by country, department, and salary band.
- Work with a dataset of 10,000 employees across multiple currencies.
- View cross-country salary information normalized to a common reporting currency.
- Use a tested, deployed, and fully functional application.

## 8. Technology Stack

- **Frontend:** React.js + TypeScript
- **Backend:** Node.js + TypeScript + Express.js
- **Database:** PostgreSQL
- **API:** REST
- **Testing:** Vitest
- **CI/CD:** GitHub Actions
- **Version Control:** Git + GitHub
- **Deployment:** Vercel (Frontend) + Render (Backend)
- **AI-assisted Development:** Kiro