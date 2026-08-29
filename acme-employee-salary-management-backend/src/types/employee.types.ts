import { Pagination } from './pagination.types';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  employeeId: string;
  name: string;
  department: string;
  jobTitle: string;
  country: string;
  dateJoined: string; // ISO date string YYYY-MM-DD
  salary: number;
  currency: string;
  status: EmployeeStatus;
}

export interface EmployeeListResult {
  data: Employee[];
  pagination: Pagination;
}

export interface CreateEmployeeInput {
  name: string;
  departmentId: number;
  jobTitle: string;
  countryId: number;
  dateJoined: string;
  salary: number;
}

export interface UpdateEmployeeInput {
  name: string;
  departmentId: number;
  jobTitle: string;
  countryId: number;
  dateJoined: string;
  salary: number;
  status?: EmployeeStatus;
}

export interface EmployeeFilters {
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
