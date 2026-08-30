# 💼 ACME Employee Salary Management System

A production-ready, full-stack enterprise HR application built with **React**, **Vite**, **TypeScript**, **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. Designed to handle 10,000+ employee records with server-side pagination, multi-attribute filtering, native currency storage, and real-time organizational salary insights.

---

## 🌟 Key Features

### 👥 1. Employee Directory & HR Operations
- **Server-Side Pagination**: Efficient 1-indexed pagination optimized for 10,000+ seeded employee records.
- **Search & Filtering**: Real-time search by Employee Name or ID (`EMP-XXXXX`) combined with Department, Country, Status, and Date Joined range filters.
- **Employee Lifecycle (CRUD)**: Create new employee profiles with auto-linked native currency validation, inline profile updates, and status management.
- **Soft Deactivation & Reactivation**: Soft status updates (`INACTIVE`) to preserve historical organizational analytics while allowing one-click reactivation.

### 📊 2. Organizational Salary Insights & Analytics
- **USD Normalized Metrics**: Real-time aggregated KPIs for **Total Annual Payroll Spend**, **Average Salary**, and **Median Salary**.
- **Salary Distribution Bands**: Interactive progress indicators across salary bands (`< $50k`, `$50k - $100k`, `$100k - $150k`, `$150k+`).
- **Department & Country Breakdown**: Aggregated financial metrics grouped by Department and Location.
- **Isolated Analytics Filters**: Dedicated filter modal for exploring country-specific or department-specific pay patterns.

### 💱 3. Multi-Currency Normalization
- Salaries are stored in the employee's native currency (**INR**, **USD**, **GBP**, **EUR**, **BRL**, **SGD**).
- Cross-country reporting normalizes all base salaries to USD using a seeded exchange-rate engine.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript | Component-based SPA styled with Vanilla CSS design tokens & Lucide icons. |
| **Backend** | Node.js, Express, TypeScript | Layered REST API (`Router ➔ Controller ➔ Service ➔ Repository ➔ Prisma`). |
| **ORM & DB** | Prisma ORM, PostgreSQL | Type-safe database queries with indexing on search/filter columns. |
| **Validation** | Zod | Strict schema validation on both client and server layers. |
| **Testing** | Vitest, React Testing Library | Fast unit and integration testing suite. |
| **CI/CD & Deploy** | GitHub Actions, Vercel, Render, Neon | Cloud deployment across Vercel (FE), Render (BE), and Neon (DB). |

---

## 🌐 Live Cloud Infrastructure

| Layer | Hosting Provider | Description & Config |
| :--- | :--- | :--- |
| **Frontend UI** | **Vercel** | SPA hosted on global CDN with routing fallback (`vercel.json`). |
| **Backend REST API** | **Render** | Node.js Web Service compiled from TypeScript (`render.yaml`). |
| **PostgreSQL Database** | **Neon PostgreSQL** | Serverless cloud PostgreSQL DB pre-populated with 10,000 employees. |

---

## 🧪 Automated Test Suite

The codebase enforces test-driven quality assurance with **122 total automated tests**:

```bash
# Backend Test Suite (103 unit & integration tests)
cd acme-employee-salary-management-backend
npm test

# Frontend Test Suite (19 component & service unit tests)
cd acme-employee-salary-management-frontend
npm test
```

- **Backend Tests**: **103 / 103 Passed**
- **Frontend Tests**: **19 / 19 Passed**
- **TypeScript Health**: **0 Errors**

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **PostgreSQL**: Local instance or remote database URL

### 1. Backend Setup
```bash
cd acme-employee-salary-management-backend

# Install dependencies
npm install

# Configure environment variables (.env)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/acme_employee_salary"
# PORT=3000

# Push Prisma schema and seed 10,000 employees
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd acme-employee-salary-management-frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend will run at `http://localhost:5173` and proxy API requests to `http://localhost:3000`.

---

## 📄 Documentation Sitemap

Full system documentation is available in the [`docs/`](./docs) directory:

- 📄 [**Requirements & Scope**](docs/ACME-Salary-Management-Requirements.md)
- 🏗️ [**System Architecture & Deployment**](docs/architecture.md)
- 🎨 [**Frontend Design & Functionality**](docs/frontend-functionality.md)
- ⚖️ [**Technical Decisions & Trade-offs**](docs/technical-decisions-trade-offs.md)
- 🔌 [**OpenAPI Specification**](docs/api-documentation.yaml)
- 📐 [**Database ER Diagram**](docs/er-diagram.md)
