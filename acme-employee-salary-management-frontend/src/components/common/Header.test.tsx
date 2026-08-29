import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header/Header';

describe('Header Component', () => {
  it('renders branding title and navigation tabs', () => {
    render(<Header activeTab="employees" onTabChange={vi.fn()} />);

    expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Employees/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salary Analytics/i })).toBeInTheDocument();
  });

  it('calls onTabChange when navigation tabs are clicked', () => {
    const onTabChange = vi.fn();
    render(<Header activeTab="employees" onTabChange={onTabChange} />);

    const analyticsTab = screen.getByRole('button', { name: /Salary Analytics/i });
    fireEvent.click(analyticsTab);

    expect(onTabChange).toHaveBeenCalledWith('analytics');
  });
});
