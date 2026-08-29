import { httpClient } from '@/client/client';
import type {
  EmployeeListResponse,
  SingleResponse,
  Employee,
  EmployeeQueryParams,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from '@/types/api.types';

export const employeeService = {
  getEmployees: (params: EmployeeQueryParams = {}): Promise<EmployeeListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.departmentId) query.append('departmentId', String(params.departmentId));
    if (params.countryId) query.append('countryId', String(params.countryId));
    if (params.status) query.append('status', params.status);
    if (params.joinedFrom) query.append('joinedFrom', params.joinedFrom);
    if (params.joinedTo) query.append('joinedTo', params.joinedTo);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    return httpClient<EmployeeListResponse>(`/employees${queryString ? `?${queryString}` : ''}`);
  },

  createEmployee: (payload: CreateEmployeePayload): Promise<SingleResponse<Employee>> => {
    return httpClient<SingleResponse<Employee>>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateEmployee: (employeeId: string, payload: UpdateEmployeePayload): Promise<SingleResponse<null>> => {
    return httpClient<SingleResponse<null>>(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deactivateEmployee: (employeeId: string): Promise<SingleResponse<null>> => {
    return httpClient<SingleResponse<null>>(`/employees/${employeeId}/deactivate`, {
      method: 'PATCH',
    });
  },
};
