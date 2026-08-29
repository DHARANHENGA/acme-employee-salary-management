import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types/api.types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function getPageNumbers(current: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (current >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', current - 1, current, current + 1, '...', totalPages];
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const { page, limit, total, totalPages } = pagination;

  // Only present if count is 5 or more (per spec section 13)
  if (total < 5) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="card" style={{ padding: '12px 20px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
      {/* Per Page Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        <span>Per page:</span>
        <select
          className="form-control"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          style={{ padding: '4px 10px' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Page Navigation with Numbers & Icon-only Prev/Next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Previous Icon Only */}
        <button
          className="btn-icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Previous Page"
          aria-label="Previous Page"
          style={{ padding: '6px 10px', opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Number Buttons */}
        {pageNumbers.map((num, idx) => {
          if (typeof num === 'string') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '0 4px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                ...
              </span>
            );
          }

          const isActive = num === page;
          return (
            <button
              key={`page-${num}`}
              onClick={() => onPageChange(num)}
              style={{
                padding: '5px 11px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 700 : 600,
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-main)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border-subtle)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              {num}
            </button>
          );
        })}

        {/* Next Icon Only */}
        <button
          className="btn-icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Next Page"
          aria-label="Next Page"
          style={{ padding: '6px 10px', opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
