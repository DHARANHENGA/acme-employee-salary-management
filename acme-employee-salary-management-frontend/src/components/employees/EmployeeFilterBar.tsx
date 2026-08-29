import React, { useState, useEffect } from 'react';
import { Search, Filter, X, UserPlus } from 'lucide-react';
import { FilterModal } from '@/components/employees/FilterModal';
import type { Department, Country, EmployeeQueryParams } from '@/types/api.types';

interface EmployeeFilterBarProps {
  departments: Department[];
  countries: Country[];
  filters: EmployeeQueryParams;
  totalCount?: number;
  onFilterChange: (filters: Partial<EmployeeQueryParams>) => void;
  onResetFilters: () => void;
  onAddEmployeeClick: () => void;
}

export const EmployeeFilterBar: React.FC<EmployeeFilterBarProps> = ({
  departments,
  countries,
  filters,
  totalCount = 0,
  onFilterChange,
  onResetFilters,
  onAddEmployeeClick,
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync local search input with filters prop
  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  // Active non-search filter count
  const activeFilterCount = [
    filters.departmentId,
    filters.countryId,
    filters.status,
    filters.joinedFrom,
    filters.joinedTo,
  ].filter(Boolean).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: search.trim() || undefined, page: 1 });
  };

  const handleSearchClear = () => {
    setSearch('');
    onFilterChange({ search: undefined, page: 1 });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Directory Title, Total Count Badge & Subtitle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Employee Directory
            </h2>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {totalCount.toLocaleString()} {totalCount === 1 ? 'employee' : 'employees'}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
            Manage employee profiles, compensation, and active statuses.
          </p>
        </div>

        {/* Action Controls: Search Input + Filter Icon + Add Employee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Input Field */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '250px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim() && filters.search) {
                  onFilterChange({ search: undefined, page: 1 });
                }
              }}
              style={{ width: '100%', paddingLeft: '36px', paddingRight: search ? '32px' : '12px' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={handleSearchClear}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Filter Icon Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            title="Filter Directory"
            aria-label="Filter Directory"
            style={{
              position: 'relative',
              padding: '9px 13px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeFilterCount > 0 ? 'var(--color-primary)' : 'var(--color-bg-card)',
              color: activeFilterCount > 0 ? '#ffffff' : 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-fast)',
            }}
          >
            <Filter size={16} />
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent)',
                }}
              />
            )}
          </button>

          {/* Add Employee Button */}
          <button className="btn btn-primary" onClick={onAddEmployeeClick}>
            <UserPlus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filter Modal Dialog */}
      <FilterModal
        isOpen={isFilterModalOpen}
        departments={departments}
        countries={countries}
        filters={filters}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(updatedFilters) => onFilterChange(updatedFilters)}
        onReset={onResetFilters}
      />
    </div>
  );
};
