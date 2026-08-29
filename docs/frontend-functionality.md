# ACME Employee Salary Management
## Frontend Functionality Document

**Document:** `frontend-functionality.md`  
**Version:** 1.0  
**Status:** Final

---

## 1. Purpose

This document defines the functional requirements and frontend behavior for the ACME Employee Salary Management application.

The frontend will be built using **React + TypeScript + Vite**.

The frontend is responsible for:
- Rendering UI components.
- Collecting user input.
- Calling backend APIs.
- Binding API responses to the UI.
- Managing UI state.
- Handling loading and error states.

**Business calculations and salary analytics calculations must be performed by the backend. The frontend must not perform business-level derivations.**

---

# 2. Application Screens

The application will contain the following primary screens:

1. Login
2. Employee Dashboard
3. Analytics

Create and Edit Employee will be handled using a common modal rather than separate screens.

---

# 3. Login Screen

### Requirements

- Display a simple login screen.
- Provide a `Login` button.
- When the user clicks `Login`, the user is authenticated and navigated to the Employee Dashboard.
- Authenticated application routes must be protected.
- Unauthenticated users must not be able to access protected screens directly.

### Navigation

```text
Login
  ↓
Employee Dashboard
```

---

# 4. Header

A common Header component must be displayed across authenticated screens.

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ ACME Logo       Dashboard | Analytics          👤 User Name │
└──────────────────────────────────────────────────────────────┘
```

### Requirements

#### Left Side

- Display ACME company branding/logo.
- Clicking the branding/logo:
  - Navigate to Employee Dashboard when the user is on another screen.
  - Do nothing when already on the Employee Dashboard.

#### Center

Display navigation tabs:

- Dashboard
- Analytics

The active tab must be visually identifiable.

#### Right Side

- Display profile icon.
- Display the logged-in user's name.

---

# 5. Employee Dashboard

The Employee Dashboard displays employee records in a paginated grid.

### Main Controls

```text
[ Search employees... ] [ 🔍 ] [ Filter ] [ Create ]

Employee Grid

Pagination
```

The dashboard must provide:

- Search
- Sort
- Filter
- Create Employee
- Edit Employee
- Deactivate Employee
- Pagination
- Rows-per-page selection

---

# 6. Employee Grid

### Grid Columns

The grid should display only the data required by the UI.

Recommended columns:

- Employee ID
- Name
- Department
- Job Title
- Country
- Date Joined
- Salary
- Currency
- Status
- Actions

Column headers are static and must remain visible while the grid data is loading.

---

# 7. Search

Search must be triggered only through an explicit user action.

### Rules

- Search must not trigger an API call when the input contains only empty spaces.
- Search must be triggered when the user presses `Enter`.
- Leading/trailing spaces should be trimmed before sending the request.
- Provide a clear icon when search text is present.
- Clicking the clear icon must:
  - Clear the input.
  - Reset the employee list to the appropriate unsearched state.
- Search should work using the backend employee search API.

### During API Request

While a search request is in progress:

- Search input/action must be disabled.
- Sort controls must be disabled.
- Filter controls must be disabled.
- Pagination must be disabled.
- Grid rows must display skeleton loaders.
- Static column headers must remain visible.

---

# 8. Sorting

Employee grid columns that support sorting must display sort icons.

### Requirements

- Clicking the sort icon must trigger sorting.
- The frontend sends the selected sort field and direction to the backend.
- Sorting must be performed by the backend.
- Supported values should be defined by the API contract.

Example:

```text
GET /api/employees?sortBy=name&sortOrder=asc
```

### During API Request

- Sort controls must be disabled.
- Search must be disabled.
- Filter must be disabled.
- Pagination must be disabled.
- Grid data must display skeleton loaders.
- Column headers remain visible.

### Backend/API Requirement

The employee API documentation and backend implementation must support:

- `sortBy`
- `sortOrder`

---

# 9. Employee Filters

A Filter icon must be displayed near the Search control.

Clicking the Filter icon opens a filter modal.

### Filter Options

The filter modal should support:

- Department
- Country
- Status
- Joining Date From
- Joining Date To

### Modal Actions

The modal must contain:

- Close icon
- Apply button
- Clear button

### Apply Button

- Disabled when no filter value has been selected.
- Enabled when at least one filter value has been selected.
- API call must happen only after clicking `Apply`.

### Filter State

Filter values selected inside the modal must be temporary until `Apply` is clicked.

Example:

```text
Open Filter Modal
      ↓
Select values
      ↓
Local temporary state
      ↓
Click Apply
      ↓
Apply filters to page state
      ↓
API request
```

If the user closes the modal without applying:

- Temporary changes must be discarded.
- Previously applied filters must remain unchanged.

### Date Validation

When filtering by joining date:

- `From Date` cannot be later than `To Date`.
- Invalid date ranges must not be submitted.
- Validation must be displayed to the user.

### After Applying Filters

- Applied filter values must remain visible/retained on the Employee Dashboard.
- The employee API must be called with the selected filters.
- Pagination should reset to the first page after a new filter is applied.

### Closing the Modal

The filter modal must close when:

- The close icon is clicked.
- The user clicks outside the modal.

### During API Request

- Filter controls must be disabled.
- Search must be disabled.
- Sort must be disabled.
- Pagination must be disabled.
- Grid rows must display skeleton loaders.

---

# 10. Create Employee

A `Create` button must be displayed after the Filter control.

Clicking `Create` opens the common Employee modal in Create mode.

### Fields

- Name
- Department
- Job Title
- Country
- Date Joined
- Salary

Currency is determined by the selected country and must not be entered manually.

### Buttons

Create mode:

```text
[ Cancel ] [ Create ]
```

### Requirements

- Validate fields before submitting.
- Use the defined frontend validation schema.
- The backend remains the final authority for validation.
- `employeeId` must not be supplied by the frontend.
- `currencyId` must not be supplied by the frontend.
- After successful creation:
  - Close the modal.
  - Refresh the employee grid.
  - Display the success message from the API.

---

# 11. Edit Employee

Clicking an employee row opens the same common Employee modal in Edit mode.

### Requirements

- Existing employee data must be pre-populated.
- All editable fields must be editable.
- Employee ID is displayed as non-editable information if required by the UI.
- Currency is determined automatically from the selected country.
- The frontend must not send `employeeId` as part of the request body.

### Buttons

Edit mode:

```text
[ Cancel ] [ Edit ]
```

### After Successful Update

- Close the modal.
- Refresh the employee grid.
- Display the success message from the API.

---

# 12. Deactivate Employee

The grid must provide an action for deactivating an employee.

### Flow

```text
Click Deactivate
      ↓
Confirmation Modal
      ↓
[ Cancel ] [ Yes ]
      ↓
API request only when Yes is clicked
```

### Requirements

- Clicking the action must not immediately call the API.
- A confirmation popup must be displayed.
- API request is made only after the user confirms.
- After successful deactivation:
  - Close the confirmation popup.
  - Refresh the employee grid.
  - Display the API success message.

The employee is soft-deactivated; the record remains available for historical analytics.

---

# 13. Pagination

Employee records must be paginated by the backend.

### Rows Per Page

The available options are:

```text
10
25
50
100
```

Default:

```text
10
```

### Pagination UI

Pagination should be displayed on the right side.

For example:

```text
1  2  3  ...  500
```

The current page must be visually identifiable.

### Pagination Visibility

If the total number of records is fewer than **5**, pagination controls and the rows-per-page selector should not be displayed.

### State Behavior

When any of the following changes:

- Search
- Filter
- Sort
- Rows per page

the page should reset to page `1` where appropriate.

### During API Request

Pagination controls must be disabled while an employee API request is in progress.

---

# 14. Analytics Screen

The Analytics screen displays organization-level salary analytics.

### Initial Load

When the Analytics screen is opened without filters, the frontend calls:

```text
GET /api/analytics
```

The backend returns:

- KPI summary
- Salary by country
- Salary by department
- Salary bands

The frontend only binds the returned data to the UI.

### KPI Cards

The screen should display:

- Total Payroll
- Average Salary
- Median Salary
- Employee Count

The reporting currency is supplied by the backend.

### Visualizations

The Analytics screen should visualize:

1. Salary by Country
2. Salary by Department
3. Salary Bands

The frontend must not calculate:

- Total payroll
- Average salary
- Median salary
- Percentages
- Currency conversions
- Salary band counts

These values must come from the backend API.

---

# 15. Analytics Filters

Analytics supports:

- Country
- Department
- Employee Status

When a filter is selected, the frontend calls the Analytics API with the selected filter.

Example:

```text
GET /api/analytics?countryId=1
```

Multiple filters may be supplied together.

Example:

```text
GET /api/analytics?countryId=1&departmentId=2&status=ACTIVE
```

### Filtered Analytics

The backend recalculates all analytics for the filtered employee set.

The frontend updates:

- KPI cards
- Salary by Country visualization
- Salary by Department visualization
- Salary Bands visualization

based on the API response.

---

# 16. Analytics Loading State

While the Analytics API request is running:

- KPI cards display skeleton loaders.
- Charts/visualizations display skeleton loaders.
- Analytics filter controls are disabled where appropriate.
- Previous analytics data should not be presented as if it represents the newly requested filter.

---

# 17. API Request State Management

The frontend must maintain a clear loading state for API requests.

For employee operations:

```text
Idle
 ↓
Request Started
 ↓
Loading
 ↓
Success / Error
```

During employee list requests, the following interactions must be disabled:

- Search
- Sort
- Filter
- Pagination

This prevents overlapping requests and inconsistent grid state.

---

# 18. Error Handling

The frontend must handle API errors using the standard API response structure:

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "data": null
}
```

### Requirements

- Display user-friendly error messages.
- Do not expose raw backend/server errors directly to users.
- Validation errors should be displayed near the relevant form field where possible.
- Network/server errors should display a suitable general error message.
- API errors must not break the entire application.

---

# 19. React Error Boundary

A global React Error Boundary must be implemented.

### Purpose

The Error Boundary protects the application from unexpected rendering/runtime errors in React components.

If a component crashes:

- Prevent the entire application from showing a broken/blank screen.
- Display a controlled fallback UI.
- Provide an option to retry or navigate back to a safe screen.

The Error Boundary is separate from normal API error handling.

```text
API Error
    ↓
API Error Handler

React Runtime Error
    ↓
Error Boundary
```

---

# 20. Protected Routes

Authenticated application screens must be protected.

Protected routes:

```text
/dashboard
/analytics
```

Unauthenticated users attempting to access these routes must be redirected to:

```text
/login
```

---

# 21. Form Validation

Frontend form validation must be implemented using **Zod**.

Validation should cover:

- Required fields
- String length
- Salary minimum value
- Valid date
- Joining date range
- Valid department selection
- Valid country selection

Frontend validation improves user experience, while backend validation remains mandatory.

---

# 22. Currency Behavior

Currency is determined by the employee's selected country.

For example:

```text
Country: India
      ↓
Currency: INR
```

The frontend must not allow the user to independently select or modify the currency.

The frontend should display the currency returned/provided by the backend.

For analytics involving multiple countries, the backend performs the required currency normalization and returns the reporting currency.

---

# 23. Reference Data

The frontend consumes reference data through:

```text
GET /api/departments
GET /api/countries
GET /api/currencies
```

Reference data is used for:

- Department dropdown
- Country dropdown
- Filter controls
- Currency display where required

Reference data must not be hardcoded into the UI.

---

# 24. Frontend State Principles

The frontend should maintain only UI/application state required for interaction.

Examples:

- Search input state
- Applied filters
- Temporary filter-modal state
- Current page
- Rows per page
- Sort field
- Sort direction
- Modal state
- Selected employee
- Loading state
- Error state

The frontend must not maintain duplicated business calculations.

---

# 25. Accessibility and UX

The UI should provide:

- Keyboard-accessible buttons and controls.
- Enter-key support for search.
- Clear visual indication for disabled controls.
- Appropriate labels for form fields.
- Accessible modal behavior.
- Confirmation before destructive actions.
- Loading indicators/skeletons during API requests.
- Clear success and error feedback.

---

# 26. Frontend Functional Flow

## Employee Dashboard

```text
Login
  ↓
Employee Dashboard
  ↓
Fetch Employees
  ↓
Display Grid
  │
  ├── Search
  │     ↓
  │   Enter
  │     ↓
  │   API
  │
  ├── Sort
  │     ↓
  │   API
  │
  ├── Filter
  │     ↓
  │   Apply
  │     ↓
  │   API
  │
  ├── Create
  │     ↓
  │   Employee Modal
  │     ↓
  │   Create API
  │
  ├── Edit
  │     ↓
  │   Employee Modal
  │     ↓
  │   Update API
  │
  ├── Deactivate
  │     ↓
  │   Confirmation
  │     ↓
  │   Deactivate API
  │
  └── Pagination
        ↓
       API
```

## Analytics

```text
Analytics Screen
      ↓
GET /api/analytics
      ↓
Backend Calculations
      ↓
Analytics Response
      ↓
┌──────────────┬───────────────────┐
│ KPI Cards    │ Visualizations    │
├──────────────┼───────────────────┤
│ Payroll      │ Salary by Country │
│ Average      │ Salary by Dept.   │
│ Median       │ Salary Bands      │
│ Employees    │                   │
└──────────────┴───────────────────┘
```

---

# 27. Important Frontend Principle

> **The frontend is responsible for presentation, user interaction, state management, API communication, validation, and data binding.**

> **The backend is responsible for business rules, database operations, salary calculations, analytics calculations, sorting, filtering, pagination, and currency conversion.**

This separation must be maintained throughout the implementation.
