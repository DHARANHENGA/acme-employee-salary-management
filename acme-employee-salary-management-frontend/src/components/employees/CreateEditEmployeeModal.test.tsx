import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateEditEmployeeModal } from './CreateEditEmployeeModal';

const mockDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'HR' },
];

const mockCountries = [
  { id: 1, name: 'India', code: 'IN', currencyId: 1, currency: { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' } },
  { id: 2, name: 'USA', code: 'US', currencyId: 2, currency: { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' } },
];

describe('CreateEditEmployeeModal Component', () => {
  it('renders form fields for creating a new employee', () => {
    render(
      <CreateEditEmployeeModal
        isOpen={true}
        employeeToEdit={null}
        departments={mockDepartments}
        countries={mockCountries}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Create New Employee')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Arun Kumar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create employee/i })).toBeInTheDocument();
  });

  it('shows validation error messages when submitting empty form', async () => {
    const handleSubmit = vi.fn();

    render(
      <CreateEditEmployeeModal
        isOpen={true}
        employeeToEdit={null}
        departments={mockDepartments}
        countries={mockCountries}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /create employee/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Name cannot be empty or whitespace only')).toBeInTheDocument();
    expect(await screen.findByText('Job title cannot be empty or whitespace only')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('pre-populates existing data when editing an employee', () => {
    const mockEmployee = {
      employeeId: 'EMP-00001',
      name: 'Audit Updated Employee',
      department: 'HR',
      jobTitle: 'Lead QA Engineer',
      country: 'India',
      dateJoined: '2026-08-29',
      salary: 105000,
      currency: 'INR',
      status: 'ACTIVE' as const,
    };

    render(
      <CreateEditEmployeeModal
        isOpen={true}
        employeeToEdit={mockEmployee}
        departments={mockDepartments}
        countries={mockCountries}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/Edit Employee/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Audit Updated Employee')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lead QA Engineer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update employee/i })).toBeInTheDocument();
  });
});
