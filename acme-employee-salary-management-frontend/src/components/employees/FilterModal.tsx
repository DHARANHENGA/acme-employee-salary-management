import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import type { Department, Country, EmployeeQueryParams } from '@/types/api.types';

interface FilterModalProps {
  isOpen: boolean;
  departments: Department[];
  countries: Country[];
  filters: EmployeeQueryParams;
  showDateFilters?: boolean;
  onClose: () => void;
  onApply: (filters: Partial<EmployeeQueryParams>) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  departments,
  countries,
  filters,
  showDateFilters = true,
  onClose,
  onApply,
  onReset,
}) => {
  const [departmentId, setDepartmentId] = useState<number | undefined>(filters.departmentId);
  const [countryId, setCountryId] = useState<number | undefined>(filters.countryId);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | undefined>(filters.status);
  const [joinedFrom, setJoinedFrom] = useState<string | undefined>(filters.joinedFrom);
  const [joinedTo, setJoinedTo] = useState<string | undefined>(filters.joinedTo);

  const [dateError, setDateError] = useState<string | null>(null);

  // Sync internal state when modal opens or external filters change
  useEffect(() => {
    setDepartmentId(filters.departmentId);
    setCountryId(filters.countryId);
    setStatus(filters.status);
    setJoinedFrom(filters.joinedFrom);
    setJoinedTo(filters.joinedTo);
  }, [filters, isOpen]);

  // Date range validation check
  useEffect(() => {
    if (showDateFilters && joinedFrom && joinedTo && new Date(joinedFrom) > new Date(joinedTo)) {
      setDateError('Joining Date From cannot be later than Joining Date To');
    } else {
      setDateError(null);
    }
  }, [joinedFrom, joinedTo, showDateFilters]);

  // Background scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasSelectedValue = Boolean(
    departmentId || countryId || status || (showDateFilters && (joinedFrom || joinedTo))
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;

    onApply({
      departmentId,
      countryId,
      status,
      ...(showDateFilters ? { joinedFrom, joinedTo } : { joinedFrom: undefined, joinedTo: undefined }),
      page: 1,
    });
    onClose();
  };

  const handleReset = () => {
    setDepartmentId(undefined);
    setCountryId(undefined);
    setStatus(undefined);
    setJoinedFrom(undefined);
    setJoinedTo(undefined);
    setDateError(null);
    onReset();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> {showDateFilters ? 'Filter Employee Records' : 'Filter Salary Analytics'}
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleApply}>
          <div className="modal-body">
            {/* Department */}
            <div className="form-group">
              <label htmlFor="filter-department" className="form-label">Department</label>
              <select
                id="filter-department"
                className="form-control"
                value={departmentId || ''}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="form-group">
              <label htmlFor="filter-country" className="form-label">Country</label>
              <select
                id="filter-country"
                className="form-control"
                value={countryId || ''}
                onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="filter-status" className="form-label">Status</label>
              <select
                id="filter-status"
                className="form-control"
                value={status || ''}
                onChange={(e) => setStatus((e.target.value as 'ACTIVE' | 'INACTIVE') || undefined)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Joined From & Joined To (Dashboard only) */}
            {showDateFilters && (
              <>
                <div className="form-group">
                  <label htmlFor="filter-joined-from" className="form-label">Joined From</label>
                  <input
                    id="filter-joined-from"
                    type="date"
                    className={`form-control ${dateError ? 'error' : ''}`}
                    value={joinedFrom || ''}
                    max={joinedTo || undefined}
                    onChange={(e) => setJoinedFrom(e.target.value || undefined)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="filter-joined-to" className="form-label">Joined To</label>
                  <input
                    id="filter-joined-to"
                    type="date"
                    className={`form-control ${dateError ? 'error' : ''}`}
                    value={joinedTo || ''}
                    min={joinedFrom || undefined}
                    onChange={(e) => setJoinedTo(e.target.value || undefined)}
                  />
                  {dateError && <span className="error-text">⚠️ {dateError}</span>}
                </div>
              </>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={14} /> Clear Filters
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!hasSelectedValue || Boolean(dateError)}
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
