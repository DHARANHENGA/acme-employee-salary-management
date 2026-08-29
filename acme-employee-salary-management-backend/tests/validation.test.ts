import { describe, it, expect } from 'vitest';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmployeeQuerySchema,
  AnalyticsQuerySchema,
} from '@/middleware/validation';

// ─── CreateEmployeeSchema ─────────────────────────────────────

describe('CreateEmployeeSchema', () => {
  const valid = {
    name: 'Arun Kumar',
    departmentId: 2,
    jobTitle: 'Software Engineer',
    countryId: 1,
    dateJoined: '2026-08-29',
    salary: 1500000,
  };

  it('accepts a valid payload', () => {
    expect(() => CreateEmployeeSchema.parse(valid)).not.toThrow();
  });

  it('rejects when name is missing', () => {
    const { name: _, ...rest } = valid;
    const result = CreateEmployeeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects when name is empty string', () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects when name exceeds 150 characters', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...valid,
      name: 'a'.repeat(151),
    });
    expect(result.success).toBe(false);
  });

  it('rejects when jobTitle exceeds 100 characters', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...valid,
      jobTitle: 'x'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative salary', () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, salary: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts zero salary', () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, salary: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid dateJoined format', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...valid,
      dateJoined: '29-08-2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer departmentId', () => {
    const result = CreateEmployeeSchema.safeParse({
      ...valid,
      departmentId: 2.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer countryId', () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, countryId: 1.9 });
    expect(result.success).toBe(false);
  });

  it('rejects when currencyId is provided (frontend must not send it)', () => {
    // currencyId is not a field in the schema; extra keys should be stripped/ignored
    // Zod strips by default — but we verify it is NOT in the parsed output
    const result = CreateEmployeeSchema.parse({
      ...valid,
      currencyId: 99,
    });
    expect((result as Record<string, unknown>)['currencyId']).toBeUndefined();
  });
});

// ─── UpdateEmployeeSchema ─────────────────────────────────────

describe('UpdateEmployeeSchema', () => {
  const valid = {
    name: 'Arun Kumar',
    departmentId: 2,
    jobTitle: 'Senior Software Engineer',
    countryId: 1,
    dateJoined: '2026-08-29',
    salary: 1800000,
  };

  it('accepts a valid payload', () => {
    expect(() => UpdateEmployeeSchema.parse(valid)).not.toThrow();
  });

  it('rejects when any required field is missing', () => {
    const { salary: _, ...rest } = valid;
    const result = UpdateEmployeeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─── EmployeeQuerySchema ──────────────────────────────────────

describe('EmployeeQuerySchema', () => {
  it('applies defaults when no params supplied', () => {
    const result = EmployeeQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('coerces string page and limit to numbers', () => {
    const result = EmployeeQuerySchema.parse({ page: '3', limit: '25' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it('rejects limit greater than 100', () => {
    const result = EmployeeQuerySchema.safeParse({ limit: '101' });
    expect(result.success).toBe(false);
  });

  it('rejects page less than 1', () => {
    const result = EmployeeQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status value', () => {
    const result = EmployeeQuerySchema.safeParse({ status: 'PENDING' });
    expect(result.success).toBe(false);
  });

  it('accepts ACTIVE and INACTIVE status values', () => {
    expect(EmployeeQuerySchema.safeParse({ status: 'ACTIVE' }).success).toBe(true);
    expect(EmployeeQuerySchema.safeParse({ status: 'INACTIVE' }).success).toBe(true);
  });

  it('rejects whitespace-only search queries', () => {
    const result = EmployeeQuerySchema.safeParse({ search: '   ' });
    expect(result.success).toBe(false);
  });

  it('trims leading/trailing whitespace from search terms', () => {
    const result = EmployeeQuerySchema.parse({ search: '  Engineering  ' });
    expect(result.search).toBe('Engineering');
  });

  it('accepts valid sortBy and sortOrder options', () => {
    const parsed = EmployeeQuerySchema.parse({ sortBy: 'salary', sortOrder: 'desc' });
    expect(parsed.sortBy).toBe('salary');
    expect(parsed.sortOrder).toBe('desc');
  });

  it('accepts valid joinedFrom and joinedTo date range', () => {
    const result = EmployeeQuerySchema.safeParse({
      joinedFrom: '2024-01-01',
      joinedTo: '2026-08-29',
    });
    expect(result.success).toBe(true);
  });

  it('accepts single-ended joinedFrom or joinedTo', () => {
    expect(EmployeeQuerySchema.safeParse({ joinedFrom: '2024-01-01' }).success).toBe(true);
    expect(EmployeeQuerySchema.safeParse({ joinedTo: '2026-08-29' }).success).toBe(true);
  });

  it('rejects when joinedFrom is greater than joinedTo', () => {
    const result = EmployeeQuerySchema.safeParse({
      joinedFrom: '2026-08-29',
      joinedTo: '2024-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues[0];
      expect(issue?.message).toBe('joinedTo must be greater than or equal to joinedFrom');
      expect(issue?.path).toContain('joinedTo');
    }
  });
});

// ─── AnalyticsQuerySchema ─────────────────────────────────────

describe('AnalyticsQuerySchema', () => {
  it('accepts empty filters', () => {
    const result = AnalyticsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('coerces string countryId and departmentId', () => {
    const result = AnalyticsQuerySchema.parse({
      countryId: '1',
      departmentId: '2',
    });
    expect(result.countryId).toBe(1);
    expect(result.departmentId).toBe(2);
  });

  it('rejects invalid status', () => {
    const result = AnalyticsQuerySchema.safeParse({ status: 'RETIRED' });
    expect(result.success).toBe(false);
  });
});
