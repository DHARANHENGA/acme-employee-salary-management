# 🤖 AI Prompting Methodology & Performance Considerations

## 1. Overview

This document records the **AI Prompting Methodology**, **Prompts & Instructions**, and **Performance Considerations** used while building the ACME Employee Salary Management System.

---

## 2. Intentional AI Tooling & Prompting Methodology

To build a high-quality, production-ready system rapidly while maintaining high software standards, an **incremental, agentic AI workflow** was adopted:

```text
1. Product & Architecture Framing (PRD & System Specs)
   ↓
2. Data Modeling & Bulk Database Seeding Engine
   ↓
3. Backend Layered Architecture & REST API Implementation
   ↓
4. Unit & Integration Testing (103 Backend Tests)
   ↓
5. Component-Based Frontend UI & CSS System
   ↓
6. Frontend Unit Testing (19 Frontend Tests)
   ↓
7. Cloud Production Deployment (Vercel + Render + Neon)
```

### Key Prompts & Instructions Used Across Stages

#### Stage 1: Product Framing & Architecture
> *"Analyze the ACME HR Salary Management problem for 10,000 employees across 6 countries. Draft a comprehensive Product Requirements Document (PRD), Architecture Spec, OpenAPI spec, and Technical Trade-offs document adhering strictly to MVP scope boundaries."*

#### Stage 2: Database Schema & Seeding Optimization
> *"Create a Prisma schema for PostgreSQL with models for Employee, Department, Country, Currency, and ExchangeRate. Optimize the seed script to seed 10,000 employee records into a cloud database using bulk insert chunks (`createMany`) and pre-fetched reference maps to eliminate N+1 network queries."*

#### Stage 3: Layered Backend & Analytics Service
> *"Implement a layered Express architecture (`Router ➔ Controller ➔ Service ➔ Repository ➔ Prisma`). Analytics queries must perform SQL aggregations and convert native salaries to USD on the database layer rather than pulling 10,000 records into Node memory."*

#### Stage 4: Test Suite & Quality Assurance
> *"Write deterministic unit and integration tests using Vitest covering employee pagination, search, validation error responses, salary analytics metrics, and currency conversion logic."*

#### Stage 5: Premium React UI & Responsive Layout
> *"Build a responsive React UI with liquid CSS sizing, glassmorphism headers, modal scroll locking, and accessible filter inputs."*

---

## 3. Core Performance Considerations

### 1. Database Indexing & Query Strategy
- **Composite & Column Indexes**: Added database indexes on frequently queried/filtered fields (`departmentId`, `countryId`, `status`, `name`, `employeeId`, `dateJoined`).
- **Server-Side Pagination**: The frontend requests only 10 to 20 records per page (`GET /api/employees?page=1&limit=10`), keeping payload sizes `< 2 KB` per response.

### 2. Bulk Database Seeding Optimization
- **Problem**: Individual sequential inserts over a remote cloud database connection (`Neon.tech`) required 30,000 network round-trips (~10–15 minutes).
- **Optimization**: Updated [`prisma/seed.ts`](file:///c:/Users/tenis/OneDrive/Desktop/acme/acme-employee-salary-management/acme-employee-salary-management-backend/prisma/seed.ts) to pre-fetch reference models into memory maps and execute `prisma.employee.createMany()` in **bulk chunks of 2,000 records**.
- **Result**: Reduced seeding duration from 15 minutes to **8 seconds**!

### 3. Server-Side Analytics Aggregations
- **SQL Aggregations**: Total Annual Payroll Spend, Average Salary, and Median Salary are computed directly inside PostgreSQL (`SUM`, `AVG`, `PERCENTILE_CONT`).
- **Zero Browser Processing Overhead**: Only aggregated KPI numbers are transferred to the client, preventing browser main-thread lag when viewing analytics.

### 4. Responsive CSS Fluid Scaling & Overflow Protection
- Used fluid `clamp(18px, 1.8vw, 24px)` typography scaling and text-overflow truncation (`text-overflow: ellipsis`) to prevent large USD metrics (e.g. `$770,245,608.50`) from overflowing KPI cards.
- Locked modal container viewports (`max-height: 88vh`) with internal vertical scrollable bodies (`overflow-y: auto`) so validation errors never warp modal dimensions.
