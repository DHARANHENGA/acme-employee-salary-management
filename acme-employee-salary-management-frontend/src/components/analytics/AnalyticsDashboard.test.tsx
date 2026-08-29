import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { AnalyticsData } from '@/types/api.types';

const mockAnalyticsData: AnalyticsData = {
  summary: {
    totalPayroll: 770245608.5,
    averageSalary: 77009.16,
    medianSalary: 71181.21,
    employeeCount: 10002,
    currency: 'USD',
  },
  byCountry: [
    { country: 'India', employeeCount: 2000, totalPayroll: 150000000, averageSalary: 75000, medianSalary: 72000, currency: 'USD' },
    { country: 'USA', employeeCount: 3000, totalPayroll: 300000000, averageSalary: 100000, medianSalary: 95000, currency: 'USD' },
  ],
  byDepartment: [
    { department: 'Engineering', employeeCount: 4000, totalPayroll: 350000000, averageSalary: 87500, medianSalary: 85000, currency: 'USD' },
    { department: 'HR', employeeCount: 1000, totalPayroll: 70000000, averageSalary: 70000, medianSalary: 68000, currency: 'USD' },
  ],
  salaryBands: [
    { band: '< $50k', employeeCount: 2000, percentage: 20 },
    { band: '$50k - $100k', employeeCount: 5000, percentage: 50 },
  ],
};

describe('AnalyticsDashboard Component', () => {
  it('renders loading state when loading prop is true', () => {
    render(<AnalyticsDashboard data={null} loading={true} />);
    expect(screen.getByText('Calculating salary analytics...')).toBeInTheDocument();
  });

  it('renders metrics summary cards, salary bands, and department/country tables', () => {
    render(<AnalyticsDashboard data={mockAnalyticsData} loading={false} />);

    expect(screen.getByText('10,002')).toBeInTheDocument();
    expect(screen.getByText('$770,245,608.50')).toBeInTheDocument();
    expect(screen.getByText('$77,009.16')).toBeInTheDocument();
    expect(screen.getByText('$71,181.21')).toBeInTheDocument();

    expect(screen.getByText('Salary Distribution Bands (USD Normalized)')).toBeInTheDocument();
    expect(screen.getByText('Salary Breakdown by Department')).toBeInTheDocument();
    expect(screen.getByText('Salary Breakdown by Country')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('India')).toBeInTheDocument();
  });
});
