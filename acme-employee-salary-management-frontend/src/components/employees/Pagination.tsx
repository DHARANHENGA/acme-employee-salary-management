import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/api.types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const { page, limit, total, totalPages } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        Showing <strong style={{ color: 'var(--color-text-main)' }}>{startItem}</strong> - <strong style={{ color: 'var(--color-text-main)' }}>{endItem}</strong> of <strong style={{ color: 'var(--color-text-main)' }}>{total}</strong> employees
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          <span>Per page:</span>
          <select
            className="form-control"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ padding: '6px 12px' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{ padding: '6px 12px' }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, padding: '0 8px' }}>
            Page {page} of {totalPages || 1}
          </span>

          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{ padding: '6px 12px' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
