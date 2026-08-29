import React from 'react';
import { EmployeeFilterBar } from '@/components/employees/EmployeeFilterBar';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { Pagination } from '@/components/common/Pagination/Pagination';
import type {
  Employee,
  Department,
  Country,
  EmployeeQueryParams,
  PaginationMeta,
} from '@/types/api.types';

interface EmployeesPageProps {
  employees: Employee[];
  departments: Department[];
  countries: Country[];
  pagination: PaginationMeta;
  filters: EmployeeQueryParams;
  loading: boolean;
  onFilterChange: (filters: Partial<EmployeeQueryParams>) => void;
  onResetFilters: () => void;
  onSortChange: (field: 'employeeId' | 'name' | 'dateJoined' | 'salary') => void;
  onAddEmployeeClick: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeactivateEmployee: (employee: Employee) => void;
  onReactivateEmployee: (employee: Employee) => void;
}

export const Employees: React.FC<EmployeesPageProps> = ({
  employees,
  departments,
  countries,
  pagination,
  filters,
  loading,
  onFilterChange,
  onResetFilters,
  onSortChange,
  onAddEmployeeClick,
  onEditEmployee,
  onDeactivateEmployee,
  onReactivateEmployee,
}) => {
  return (
    <div>
      <EmployeeFilterBar
        departments={departments}
        countries={countries}
        filters={filters}
        totalCount={pagination.total}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        onAddEmployeeClick={onAddEmployeeClick}
      />

      <EmployeeTable
        employees={employees}
        loading={loading}
        filters={filters}
        onSortChange={onSortChange}
        onEditEmployee={onEditEmployee}
        onDeactivateEmployee={onDeactivateEmployee}
        onReactivateEmployee={onReactivateEmployee}
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page) => onFilterChange({ page })}
        onLimitChange={(limit) => onFilterChange({ limit, page: 1 })}
      />
    </div>
  );
};
