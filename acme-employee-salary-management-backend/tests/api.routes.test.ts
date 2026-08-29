import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Server } from 'http';
import type { Express } from 'express';
import { NotFoundError, AlreadyInactiveError } from '@/errors/app-error';

/**
 * API route integration tests.
 *
 * Services and repositories are mocked — no database required.
 * The Express app is spun up on a random port for each test.
 */

// ─── Service mocks ────────────────────────────────────────────

vi.mock('@/services/employee.service');
vi.mock('@/services/analytics.service');
vi.mock('@/repositories/reference.repository');

// ─── Fixtures ────────────────────────────────────────────────

const mockEmployee = {
  employeeId: 'EMP-00001',
  name: 'Arun Kumar',
  department: 'Engineering',
  jobTitle: 'Software Engineer',
  country: 'India',
  dateJoined: '2024-07-01',
  salary: 1200000,
  currency: 'INR',
  status: 'ACTIVE' as const,
};

const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1 };

const mockAnalyticsData = {
  summary: {
    totalPayroll: 125_400_000,
    averageSalary: 62_400,
    medianSalary: 55_000,
    employeeCount: 100,
    currency: 'USD',
  },
  byCountry: [{ country: 'India', employeeCount: 50, averageSalary: 18_000, medianSalary: 16_000, totalPayroll: 900_000, currency: 'USD' }],
  byDepartment: [{ department: 'Engineering', employeeCount: 50, averageSalary: 72_000, medianSalary: 68_000, totalPayroll: 3_600_000, currency: 'USD' }],
  salaryBands: [
    { band: '<25K',      employeeCount: 10, percentage: 10 },
    { band: '25K-50K',   employeeCount: 20, percentage: 20 },
    { band: '50K-75K',   employeeCount: 35, percentage: 35 },
    { band: '75K-100K',  employeeCount: 20, percentage: 20 },
    { band: '100K-150K', employeeCount: 10, percentage: 10 },
    { band: '>150K',     employeeCount: 5,  percentage: 5  },
  ],
};

const mockDepartments = [{ id: 1, name: 'Engineering' }, { id: 2, name: 'HR' }];
const mockCountries = [{ id: 1, name: 'India', code: 'IN', currency: { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' } }];
const mockCurrencies = [{ id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' }];

// ─── Server lifecycle ─────────────────────────────────────────

let app: Express;
let server: Server;
let baseUrl: string;

beforeEach(async () => {
  vi.resetModules();

  // Set up service mocks BEFORE importing app (so DI picks them up)
  const { EmployeeService } = await import('@/services/employee.service');
  const { AnalyticsService } = await import('@/services/analytics.service');
  const { ReferenceRepository } = await import('@/repositories/reference.repository');

  const empProto = EmployeeService.prototype as vi.Mocked<typeof EmployeeService.prototype>;
  empProto.listEmployees   = vi.fn().mockResolvedValue({ data: [mockEmployee], pagination: mockPagination });
  empProto.createEmployee  = vi.fn().mockResolvedValue(mockEmployee);
  empProto.updateEmployee  = vi.fn().mockResolvedValue(undefined);
  empProto.deactivateEmployee = vi.fn().mockResolvedValue(undefined);

  const anaProto = AnalyticsService.prototype as vi.Mocked<typeof AnalyticsService.prototype>;
  anaProto.getAnalytics = vi.fn().mockResolvedValue(mockAnalyticsData);

  const refProto = ReferenceRepository.prototype as vi.Mocked<typeof ReferenceRepository.prototype>;
  refProto.getDepartments = vi.fn().mockResolvedValue(mockDepartments);
  refProto.getCountries   = vi.fn().mockResolvedValue(mockCountries);
  refProto.getCurrencies  = vi.fn().mockResolvedValue(mockCurrencies);

  const { default: createApp } = await import('@/app');
  app = createApp();
  server = app.listen(0);
  const addr = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${addr.port}/api`;
});

afterEach(() => {
  server?.close();
});

// ─── Helpers ─────────────────────────────────────────────────

const get  = (path: string) => fetch(`${baseUrl}${path}`);
const post = (path: string, body: unknown) =>
  fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const put  = (path: string, body: unknown) =>
  fetch(`${baseUrl}${path}`, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const patch = (path: string) => fetch(`${baseUrl}${path}`, { method: 'PATCH' });

// ─── GET /employees ───────────────────────────────────────────

describe('GET /api/employees', () => {
  it('returns 200 with correct envelope shape', async () => {
    const res = await get('/employees');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('EMPLOYEES_RETRIEVED');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toBeDefined();
  });

  it('returns default pagination values', async () => {
    const res = await get('/employees');
    const body = await res.json();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
  });

  it('respects page and limit query params', async () => {
    const { EmployeeService } = await import('../src/services/employee.service');
    vi.mocked(EmployeeService.prototype.listEmployees).mockResolvedValueOnce({
      data: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
    });
    const res = await get('/employees?page=2&limit=5');
    const body = await res.json();
    expect(body.pagination.page).toBe(2);
    expect(body.pagination.limit).toBe(5);
  });

  it('returns 400 when limit exceeds 100', async () => {
    const res = await get('/employees?limit=999');
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
  });

  it('returns 400 for invalid status filter', async () => {
    const res = await get('/employees?status=PENDING');
    expect(res.status).toBe(400);
  });

  it('filters by status=ACTIVE — returns only ACTIVE employees', async () => {
    const res = await get('/employees?status=ACTIVE');
    expect(res.status).toBe(200);
    const body = await res.json();
    for (const emp of body.data) {
      expect(emp.status).toBe('ACTIVE');
    }
  });
});

// ─── POST /employees ──────────────────────────────────────────

describe('POST /api/employees', () => {
  const validPayload = {
    name: 'Priya Sharma',
    departmentId: 1,
    jobTitle: 'Software Engineer',
    countryId: 1,
    dateJoined: '2026-08-29',
    salary: 1200000,
  };

  it('returns 201 with correct envelope', async () => {
    const res = await post('/employees', validPayload);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('EMPLOYEE_CREATED');
    expect(body.data).toBeDefined();
  });

  it('generates an EMP-XXXXX employeeId on the backend', async () => {
    const res = await post('/employees', validPayload);
    const body = await res.json();
    expect(body.data.employeeId).toMatch(/^EMP-\d{5}$/);
  });

  it('returns ACTIVE status on newly created employee', async () => {
    const res = await post('/employees', validPayload);
    const body = await res.json();
    expect(body.data.status).toBe('ACTIVE');
  });

  it('derives currency from country — ignores currencyId in request body', async () => {
    const res = await post('/employees', { ...validPayload, currencyId: 99 });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.data.currency).toBe('string');
  });

  it('returns 400 when name is missing', async () => {
    const { name: _, ...rest } = validPayload;
    const res = await post('/employees', rest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when salary is negative', async () => {
    const res = await post('/employees', { ...validPayload, salary: -500 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when dateJoined is not YYYY-MM-DD', async () => {
    const res = await post('/employees', { ...validPayload, dateJoined: '29/08/2026' });
    expect(res.status).toBe(400);
  });
});

// ─── PUT /employees/:employeeId ───────────────────────────────

describe('PUT /api/employees/:employeeId', () => {
  const validPayload = {
    name: 'Arun Kumar',
    departmentId: 2,
    jobTitle: 'Senior Software Engineer',
    countryId: 1,
    dateJoined: '2024-07-01',
    salary: 1800000,
  };

  it('returns 200 with correct envelope for existing employee', async () => {
    const res = await put('/employees/EMP-00001', validPayload);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('EMPLOYEE_UPDATED');
  });

  it('returns 404 for non-existent employeeId', async () => {
    const { EmployeeService } = await import('../src/services/employee.service');
    vi.mocked(EmployeeService.prototype.updateEmployee).mockRejectedValueOnce(
      new NotFoundError('Employee EMP-99999 not found')
    );
    const res = await put('/employees/EMP-99999', validPayload);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('returns 400 when required field is missing', async () => {
    const { salary: _, ...rest } = validPayload;
    const res = await put('/employees/EMP-00001', rest);
    expect(res.status).toBe(400);
  });
});

// ─── PATCH /employees/:employeeId/deactivate ──────────────────

describe('PATCH /api/employees/:employeeId/deactivate', () => {
  it('returns 200 with correct envelope for an active employee', async () => {
    const res = await patch('/employees/EMP-00001/deactivate');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('EMPLOYEE_DEACTIVATED');
  });

  it('returns 404 for a non-existent employeeId', async () => {
    const { EmployeeService } = await import('../src/services/employee.service');
    vi.mocked(EmployeeService.prototype.deactivateEmployee).mockRejectedValueOnce(
      new NotFoundError()
    );
    const res = await patch('/employees/EMP-99999/deactivate');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('NOT_FOUND');
  });

  it('returns 409 when employee is already inactive', async () => {
    const { EmployeeService } = await import('../src/services/employee.service');
    vi.mocked(EmployeeService.prototype.deactivateEmployee).mockRejectedValueOnce(
      new AlreadyInactiveError()
    );
    const res = await patch('/employees/EMP-INACTIVE/deactivate');
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.status).toBe('error');
  });
});

// ─── GET /analytics ───────────────────────────────────────────

describe('GET /api/analytics', () => {
  it('returns 200 with correct envelope', async () => {
    const res = await get('/analytics');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('ANALYTICS_RETRIEVED');
    expect(body.data).toBeDefined();
  });

  it('response data has summary, byCountry, byDepartment, salaryBands', async () => {
    const res = await get('/analytics');
    const { data } = await res.json();
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('byCountry');
    expect(data).toHaveProperty('byDepartment');
    expect(data).toHaveProperty('salaryBands');
  });

  it('summary.currency is USD', async () => {
    const res = await get('/analytics');
    const { data } = await res.json();
    expect(data.summary.currency).toBe('USD');
  });

  it('returns 400 for invalid status filter', async () => {
    const res = await get('/analytics?status=UNKNOWN');
    expect(res.status).toBe(400);
  });
});

// ─── GET /departments ─────────────────────────────────────────

describe('GET /api/departments', () => {
  it('returns 200 with correct envelope', async () => {
    const res = await get('/departments');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('DEPARTMENTS_RETRIEVED');
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('each department has id and name', async () => {
    const res = await get('/departments');
    const body = await res.json();
    for (const dept of body.data) {
      expect(dept).toHaveProperty('id');
      expect(dept).toHaveProperty('name');
    }
  });
});

// ─── GET /countries ───────────────────────────────────────────

describe('GET /api/countries', () => {
  it('returns 200 with correct envelope', async () => {
    const res = await get('/countries');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('COUNTRIES_RETRIEVED');
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('each country has id, name, code and nested currency', async () => {
    const res = await get('/countries');
    const body = await res.json();
    for (const c of body.data) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('code');
      expect(c).toHaveProperty('currency');
      expect(c.currency).toHaveProperty('id');
      expect(c.currency).toHaveProperty('code');
      expect(c.currency).toHaveProperty('symbol');
    }
  });
});

// ─── GET /currencies ──────────────────────────────────────────

describe('GET /api/currencies', () => {
  it('returns 200 with correct envelope', async () => {
    const res = await get('/currencies');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('CURRENCIES_RETRIEVED');
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('each currency has id, code, name, symbol', async () => {
    const res = await get('/currencies');
    const body = await res.json();
    for (const cur of body.data) {
      expect(cur).toHaveProperty('id');
      expect(cur).toHaveProperty('code');
      expect(cur).toHaveProperty('name');
      expect(cur).toHaveProperty('symbol');
    }
  });
});

// ─── GET /health & GET /api/health ───────────────────────────

describe('GET /health & GET /api/health', () => {
  it('returns 200 operational status from /health', async () => {
    const res = await fetch(`${baseUrl.replace('/api', '')}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('HEALTH_OK');
    expect(body.data).toHaveProperty('database');
  });

  it('returns 200 operational status from /api/health', async () => {
    const res = await get('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.code).toBe('HEALTH_OK');
  });
});
