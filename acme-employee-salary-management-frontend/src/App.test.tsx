import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders application header and default employee directory tab', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('/departments')) {
        return Promise.resolve({ ok: true, json: async () => ({ status: 'success', data: [] }) } as Response);
      }
      if (url.toString().includes('/countries')) {
        return Promise.resolve({ ok: true, json: async () => ({ status: 'success', data: [] }) } as Response);
      }
      if (url.toString().includes('/employees')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            status: 'success',
            data: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }),
        } as Response);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<App />);

    expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    expect(screen.getByText('Employee Directory')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No employees found/i)).toBeInTheDocument();
    });
  });
});
