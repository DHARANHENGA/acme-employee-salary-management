import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, type ToastMessage } from './Toast';

describe('Toast Component', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<Toast toasts={[]} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success and info toast notifications', () => {
    const toasts: ToastMessage[] = [
      { id: '1', type: 'success', message: 'Employee created successfully!' },
      { id: '2', type: 'info', message: 'Employee deactivated.' },
    ];

    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    expect(screen.getByText('Employee created successfully!')).toBeInTheDocument();
    expect(screen.getByText('Employee deactivated.')).toBeInTheDocument();
  });

  it('triggers onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    const toasts: ToastMessage[] = [
      { id: 't-123', type: 'error', message: 'Validation failed' },
    ];

    render(<Toast toasts={toasts} onDismiss={handleDismiss} />);

    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]!);

    expect(handleDismiss).toHaveBeenCalledWith('t-123');
  });
});
