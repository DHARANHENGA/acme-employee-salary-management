import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { EmployeeService } from '@/services/employee.service';
import { EmployeeRepository } from '@/repositories/employee.repository';
import { NotFoundError, AlreadyInactiveError } from '@/errors/app-error';

// Mock the entire repository module — no database needed
vi.mock('@/repositories/employee.repository');

// ─── Fixtures ────────────────────────────────────────────────

const makeDbRow = (overrides: Record<string, unknown> = {}) => ({
  employeeId: 'EMP-00001',
  name: 'Arun Kumar',
  department: { name: 'Engineering' },
  jobTitle: 'Software Engineer',
  country: { name: 'India' },
  dateJoined: new Date('2024-07-01'),
  baseSalary: 1200000,
  currency: { code: 'INR' },
  status: 'ACTIVE',
  ...overrides,
});

// ─── generateEmployeeId ───────────────────────────────────────

describe('EmployeeService.generateEmployeeId', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService();
  });

  it('formats sequence 1 as EMP-00001', () => {
    expect(service.generateEmployeeId(1)).toBe('EMP-00001');
  });

  it('formats sequence 123 as EMP-00123', () => {
    expect(service.generateEmployeeId(123)).toBe('EMP-00123');
  });

  it('formats sequence 10000 as EMP-10000', () => {
    expect(service.generateEmployeeId(10000)).toBe('EMP-10000');
  });

  it('formats sequence 99999 as EMP-99999', () => {
    expect(service.generateEmployeeId(99999)).toBe('EMP-99999');
  });
});

// ─── listEmployees ────────────────────────────────────────────

describe('EmployeeService.listEmployees', () => {
  let service: EmployeeService;
  let mockRepo: EmployeeRepository;

  beforeEach(() => {
    mockRepo = new EmployeeRepository() as Mocked<EmployeeRepository>;
    vi.mocked(mockRepo.findMany).mockResolvedValue({
      rows: [makeDbRow(), makeDbRow({ employeeId: 'EMP-00002', status: 'INACTIVE' })] as never,
      total: 25,
    });
    service = new EmployeeService(mockRepo);
  });

  it('returns paginated result with correct shape', async () => {
    const result = await service.listEmployees({ page: 1, limit: 10 });

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('pagination');
    expect(Array.isArray(result.data)).toBe(true);

    const { pagination } = result;
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('totalPages');
  });

  it('calculates totalPages correctly', async () => {
    const result = await service.listEmployees({ page: 1, limit: 10 });
    const { pagination } = result;
    expect(pagination.totalPages).toBe(Math.ceil(pagination.total / pagination.limit));
  });

  it('each employee has all required fields', async () => {
    const result = await service.listEmployees({ page: 1, limit: 10 });
    for (const emp of result.data) {
      expect(emp).toHaveProperty('employeeId');
      expect(emp).toHaveProperty('name');
      expect(emp).toHaveProperty('department');
      expect(emp).toHaveProperty('jobTitle');
      expect(emp).toHaveProperty('country');
      expect(emp).toHaveProperty('dateJoined');
      expect(emp).toHaveProperty('salary');
      expect(emp).toHaveProperty('currency');
      expect(emp).toHaveProperty('status');
    }
  });

  it('status on each employee is ACTIVE or INACTIVE', async () => {
    const result = await service.listEmployees({ page: 1, limit: 10 });
    for (const emp of result.data) {
      expect(['ACTIVE', 'INACTIVE']).toContain(emp.status);
    }
  });

  it('does NOT expose currencyId on employee objects', async () => {
    const result = await service.listEmployees({ page: 1, limit: 10 });
    for (const emp of result.data) {
      expect((emp as unknown as Record<string, unknown>)['currencyId']).toBeUndefined();
    }
  });

  it('passes filters through to the repository', async () => {
    await service.listEmployees({ page: 2, limit: 5, status: 'ACTIVE' });
    expect(vi.mocked(mockRepo.findMany)).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      status: 'ACTIVE',
    });
  });
});

// ─── createEmployee ───────────────────────────────────────────

describe('EmployeeService.createEmployee', () => {
  let service: EmployeeService;
  let mockRepo: EmployeeRepository;

  const input = {
    name: 'Priya Sharma',
    departmentId: 2,
    jobTitle: 'Software Engineer',
    countryId: 1,
    dateJoined: '2026-08-29',
    salary: 1200000,
  };

  beforeEach(() => {
    mockRepo = new EmployeeRepository() as Mocked<EmployeeRepository>;
    vi.mocked(mockRepo.getCurrencyIdByCountry).mockResolvedValue(1);
    vi.mocked(mockRepo.getNextSequence).mockResolvedValue(42);
    vi.mocked(mockRepo.create).mockResolvedValue(
      makeDbRow({ employeeId: 'EMP-00042', name: 'Priya Sharma', baseSalary: 1200000 }) as never
    );
    service = new EmployeeService(mockRepo);
  });

  it('returns an employee with a generated EMP-XXXXX id', async () => {
    const emp = await service.createEmployee(input);
    expect(emp.employeeId).toMatch(/^EMP-\d{5}$/);
  });

  it('returns employee with status ACTIVE by default', async () => {
    const emp = await service.createEmployee(input);
    expect(emp.status).toBe('ACTIVE');
  });

  it('resolves currency from country — does not accept currencyId from input', async () => {
    const emp = await service.createEmployee(input);
    expect(typeof emp.currency).toBe('string');
    expect(emp.currency.length).toBeGreaterThan(0);
    // Repository should have been asked for the currency by countryId
    expect(vi.mocked(mockRepo.getCurrencyIdByCountry)).toHaveBeenCalledWith(input.countryId);
  });

  it('persists and returns the salary as provided', async () => {
    const emp = await service.createEmployee(input);
    expect(emp.salary).toBe(input.salary);
  });
});

// ─── updateEmployee ───────────────────────────────────────────

describe('EmployeeService.updateEmployee', () => {
  let service: EmployeeService;
  let mockRepo: EmployeeRepository;

  const updateInput = {
    name: 'Updated Name',
    departmentId: 3,
    jobTitle: 'Senior Engineer',
    countryId: 1,
    dateJoined: '2024-01-15',
    salary: 2000000,
  };

  beforeEach(() => {
    mockRepo = new EmployeeRepository() as Mocked<EmployeeRepository>;
    service = new EmployeeService(mockRepo);
  });

  it('resolves without error for an existing employee', async () => {
    vi.mocked(mockRepo.getCurrencyIdByCountry).mockResolvedValue(1);
    vi.mocked(mockRepo.update).mockResolvedValue(makeDbRow() as never);

    await expect(service.updateEmployee('EMP-00001', updateInput)).resolves.toBeUndefined();
  });

  it('throws a NOT_FOUND error for an unknown employeeId', async () => {
    vi.mocked(mockRepo.getCurrencyIdByCountry).mockResolvedValue(1);
    vi.mocked(mockRepo.update).mockRejectedValue(new NotFoundError('Employee EMP-99999 not found'));

    await expect(service.updateEmployee('EMP-99999', updateInput)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

// ─── deactivateEmployee ───────────────────────────────────────

describe('EmployeeService.deactivateEmployee', () => {
  let service: EmployeeService;
  let mockRepo: EmployeeRepository;

  beforeEach(() => {
    mockRepo = new EmployeeRepository() as Mocked<EmployeeRepository>;
    service = new EmployeeService(mockRepo);
  });

  it('deactivates an active employee without error', async () => {
    vi.mocked(mockRepo.deactivate).mockResolvedValue(makeDbRow({ status: 'INACTIVE' }) as never);

    await expect(service.deactivateEmployee('EMP-00001')).resolves.toBeUndefined();
  });

  it('throws NOT_FOUND for an unknown employeeId', async () => {
    vi.mocked(mockRepo.deactivate).mockRejectedValue(new NotFoundError());

    await expect(service.deactivateEmployee('EMP-99999')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws ALREADY_INACTIVE when employee is already inactive', async () => {
    vi.mocked(mockRepo.deactivate).mockRejectedValue(new AlreadyInactiveError());

    await expect(service.deactivateEmployee('EMP-INACTIVE')).rejects.toMatchObject({
      code: 'ALREADY_INACTIVE',
    });
  });
});

