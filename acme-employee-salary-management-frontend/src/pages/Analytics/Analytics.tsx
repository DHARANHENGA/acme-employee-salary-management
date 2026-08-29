import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { FilterModal } from '@/components/employees/FilterModal';
import type { AnalyticsData, Department, Country, EmployeeQueryParams } from '@/types/api.types';

interface AnalyticsPageProps {
  data: AnalyticsData | null;
  loading: boolean;
  departments: Department[];
  countries: Country[];
  filters: EmployeeQueryParams;
  onFilterChange: (filters: Partial<EmployeeQueryParams>) => void;
  onResetFilters: () => void;
}

export const Analytics: React.FC<AnalyticsPageProps> = ({
  data,
  loading,
  departments,
  countries,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Active filter count for Analytics (Department, Country, Status)
  const activeFilterCount = [filters.departmentId, filters.countryId, filters.status].filter(
    Boolean
  ).length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
            Organizational Salary Analytics
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Real-time aggregated metrics normalized to USD for global salary transparency.
          </p>
        </div>

        {/* Analytics Filter Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            title="Filter Analytics"
            aria-label="Filter Analytics"
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
        </div>
      </div>

      <AnalyticsDashboard data={data} loading={loading} />

      {/* Filter Modal Dialog for Analytics (No Date Filters per spec section 15) */}
      <FilterModal
        isOpen={isFilterModalOpen}
        departments={departments}
        countries={countries}
        filters={filters}
        showDateFilters={false}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(updatedFilters) => onFilterChange(updatedFilters)}
        onReset={onResetFilters}
      />
    </div>
  );
};
