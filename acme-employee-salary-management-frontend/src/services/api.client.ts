import type {
  EmployeeListResponse,
  SingleResponse,
  Department,
  Country,
  Currency,
  AnalyticsData,
  EmployeeQueryParams,
  AnalyticsQueryParams,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  Employee,
  ApiErrorResponse,
} from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  public status: number;
  public code: string;
  public data?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    data?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    const errorRes = json as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorRes.code || 'UNKNOWN_ERROR',
      errorRes.message || 'An error occurred',
      errorRes.data
    );
  }

  return json as T;
}

export const apiClient = {
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
    return request<EmployeeListResponse>(`/employees${queryString ? `?${queryString}` : ''}`);
  },

  createEmployee: (payload: CreateEmployeePayload): Promise<SingleResponse<Employee>> => {
    return request<SingleResponse<Employee>>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateEmployee: (employeeId: string, payload: UpdateEmployeePayload): Promise<SingleResponse<null>> => {
    return request<SingleResponse<null>>(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deactivateEmployee: (employeeId: string): Promise<SingleResponse<null>> => {
    return request<SingleResponse<null>>(`/employees/${employeeId}/deactivate`, {
      method: 'PATCH',
    });
  },

  getAnalytics: (params: AnalyticsQueryParams = {}): Promise<SingleResponse<AnalyticsData>> => {
    const query = new URLSearchParams();
    if (params.countryId) query.append('countryId', String(params.countryId));
    if (params.departmentId) query.append('departmentId', String(params.departmentId));
    if (params.status) query.append('status', params.status);

    const queryString = query.toString();
    return request<SingleResponse<AnalyticsData>>(`/analytics${queryString ? `?${queryString}` : ''}`);
  },

  getDepartments: (): Promise<SingleResponse<Department[]>> => {
    return request<SingleResponse<Department[]>>('/departments');
  },

  getCountries: (): Promise<SingleResponse<Country[]>> => {
    return request<SingleResponse<Country[]>>('/countries');
  },

  getCurrencies: (): Promise<SingleResponse<Currency[]>> => {
    return request<SingleResponse<Currency[]>>('/currencies');
  },
};

export { ApiError };
