import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiError } from './api.client';

describe('apiClient Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getEmployees builds correct query params including date range and sorting', async () => {
    const mockResponse = {
      status: 'success',
      code: 'EMPLOYEES_RETRIEVED',
      message: 'Employees retrieved successfully',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiClient.getEmployees({
      page: 2,
      limit: 25,
      search: 'Arun',
      sortBy: 'salary',
      sortOrder: 'desc',
      joinedFrom: '2024-01-01',
      joinedTo: '2026-08-29',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/employees?page=2&limit=25&search=Arun&joinedFrom=2024-01-01&joinedTo=2026-08-29&sortBy=salary&sortOrder=desc',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws ApiError on HTTP error status', async () => {
    const errorResponse = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      data: { joinedTo: 'joinedTo must be greater than or equal to joinedFrom' },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    } as Response);

    try {
      await apiClient.getEmployees({ joinedFrom: '2026-08-29', joinedTo: '2024-01-01' });
      expect.fail('Should have thrown ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('VALIDATION_ERROR');
      expect(apiErr.data?.joinedTo).toBe('joinedTo must be greater than or equal to joinedFrom');
    }
  });

  it('createEmployee sends POST request with JSON payload', async () => {
    const payload = {
      name: 'John Doe',
      departmentId: 1,
      jobTitle: 'Developer',
      countryId: 1,
      dateJoined: '2026-08-29',
      salary: 120000,
    };

    const mockResponse = {
      status: 'success',
      code: 'EMPLOYEE_CREATED',
      message: 'Employee created',
      data: { ...payload, employeeId: 'EMP-00001', currency: 'USD', status: 'ACTIVE' },
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await apiClient.createEmployee(payload);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/employees',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
    expect(result.data.employeeId).toBe('EMP-00001');
  });

  it('deactivateEmployee sends PATCH request', async () => {
    const mockResponse = {
      status: 'success',
      code: 'EMPLOYEE_DEACTIVATED',
      message: 'Deactivated',
      data: null,
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await apiClient.deactivateEmployee('EMP-00001');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/employees/EMP-00001/deactivate',
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});
