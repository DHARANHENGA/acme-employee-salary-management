import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterModal } from './FilterModal';

const mockDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'HR' },
];

const mockCountries = [
  { id: 1, name: 'India', code: 'IN', currencyId: 1, currency: { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' } },
  { id: 2, name: 'USA', code: 'US', currencyId: 2, currency: { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' } },
];

describe('FilterModal Component', () => {
  it('renders filter form controls and handles date range validation', () => {
    const handleClose = vi.fn();
    const handleApply = vi.fn();
    const handleReset = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        departments={mockDepartments}
        countries={mockCountries}
        filters={{}}
        showDateFilters={true}
        onClose={handleClose}
        onApply={handleApply}
        onReset={handleReset}
      />
    );

    expect(screen.getByText('Filter Employee Records')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Joined From')).toBeInTheDocument();
    expect(screen.getByLabelText('Joined To')).toBeInTheDocument();
  });

  it('disables Apply Filters button when no filter is selected', () => {
    render(
      <FilterModal
        isOpen={true}
        departments={mockDepartments}
        countries={mockCountries}
        filters={{}}
        onClose={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />
    );

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    expect(applyBtn).toBeDisabled();
  });

  it('enables Apply Filters button when a department is selected and submits form', () => {
    const handleApply = vi.fn();

    render(
      <FilterModal
        isOpen={true}
        departments={mockDepartments}
        countries={mockCountries}
        filters={{}}
        onClose={vi.fn()}
        onApply={handleApply}
        onReset={vi.fn()}
      />
    );

    const deptSelect = screen.getByLabelText('Department');
    fireEvent.change(deptSelect, { target: { value: '1' } });

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    expect(applyBtn).not.toBeDisabled();

    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentId: 1,
        page: 1,
      })
    );
  });

  it('omits date inputs when showDateFilters is false', () => {
    render(
      <FilterModal
        isOpen={true}
        departments={mockDepartments}
        countries={mockCountries}
        filters={{}}
        showDateFilters={false}
        onClose={vi.fn()}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Joined From')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Joined To')).not.toBeInTheDocument();
  });
});
