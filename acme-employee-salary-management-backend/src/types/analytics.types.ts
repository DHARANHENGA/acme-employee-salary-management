import { EmployeeStatus } from './employee.types';

export interface AnalyticsSummary {
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  employeeCount: number;
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

export interface AnalyticsFilters {
  countryId?: number;
  departmentId?: number;
  status?: EmployeeStatus;
}
