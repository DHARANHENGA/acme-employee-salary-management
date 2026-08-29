import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, UserX, UserCheck } from 'lucide-react';
import type { Employee, EmployeeQueryParams } from '@/types/api.types';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  filters: EmployeeQueryParams;
  onSortChange: (sortBy: 'employeeId' | 'name' | 'dateJoined' | 'salary') => void;
  onEditEmployee: (employee: Employee) => void;
  onDeactivateEmployee: (employee: Employee) => void;
  onReactivateEmployee: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  filters,
  onSortChange,
  onEditEmployee,
  onDeactivateEmployee,
  onReactivateEmployee,
}) => {
  const renderSortIcon = (field: 'employeeId' | 'name' | 'dateJoined' | 'salary') => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return filters.sortOrder === 'desc' ? (
      <ArrowDown size={14} style={{ color: 'var(--color-primary)' }} />
    ) : (
      <ArrowUp size={14} style={{ color: 'var(--color-primary)' }} />
    );
  };

  const formatCurrency = (val: number, curr: string) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      BRL: 'R$',
      SGD: 'S$',
    };
    const symbol = symbolMap[curr] || `${curr} `;
    return `${symbol}${val.toLocaleString('en-US')}`;
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => onSortChange('employeeId')}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  ID {renderSortIcon('employeeId')}
                </div>
              </th>
              <th className="sortable" onClick={() => onSortChange('name')}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Name {renderSortIcon('name')}
                </div>
              </th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Country</th>
              <th className="sortable" onClick={() => onSortChange('dateJoined')}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Date Joined {renderSortIcon('dateJoined')}
                </div>
              </th>
              <th className="sortable" onClick={() => onSortChange('salary')}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Salary {renderSortIcon('salary')}
                </div>
              </th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                  No employees found matching the selected filters.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{emp.employeeId}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td>{emp.jobTitle}</td>
                  <td>{emp.department}</td>
                  <td>{emp.country}</td>
                  <td>{emp.dateJoined}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(emp.salary, emp.currency)}
                  </td>
                  <td>
                    <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        title="Edit Employee"
                        onClick={() => onEditEmployee(emp)}
                      >
                        <Edit2 size={14} />
                      </button>
                      {emp.status === 'ACTIVE' ? (
                        <button
                          className="btn-icon"
                          title="Deactivate Employee"
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => onDeactivateEmployee(emp)}
                        >
                          <UserX size={14} />
                        </button>
                      ) : (
                        <button
                          className="btn-icon"
                          title="Reactivate Employee"
                          style={{ color: 'var(--color-primary)' }}
                          onClick={() => onReactivateEmployee(emp)}
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
