export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  country: string;
  dateJoined: string;
  salary: number;
  currency: string;
  status: EmployeeStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListResponse {
  status: 'success';
  code: string;
  message: string;
  data: Employee[];
  pagination: PaginationMeta;
}

export interface SingleResponse<T> {
  status: 'success';
  code: string;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  data?: Record<string, string>;
}

export interface Department {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  };
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export interface AnalyticsSummary {
  employeeCount: number;
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  currency: string;
}

export interface CountrySalaryAnalytics {
  country: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  totalPayroll: number;
  currency: string;
}

export interface DepartmentSalaryAnalytics {
  department: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  totalPayroll: number;
  currency: string;
}

export interface SalaryBand {
  band: string;
  employeeCount: number;
  percentage: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  byCountry: CountrySalaryAnalytics[];
  byDepartment: DepartmentSalaryAnalytics[];
  salaryBands: SalaryBand[];
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  countryId?: number;
  status?: EmployeeStatus;
  joinedFrom?: string;
  joinedTo?: string;
  sortBy?: 'employeeId' | 'name' | 'dateJoined' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsQueryParams {
  countryId?: number;
  departmentId?: number;
  status?: EmployeeStatus;
}

export interface CreateEmployeePayload {
  name: string;
  departmentId: number;
  jobTitle: string;
  countryId: number;
  dateJoined: string;
  salary: number;
}

export interface UpdateEmployeePayload {
  name: string;
  departmentId: number;
  jobTitle: string;
  countryId: number;
  dateJoined: string;
  salary: number;
  status?: EmployeeStatus;
}
