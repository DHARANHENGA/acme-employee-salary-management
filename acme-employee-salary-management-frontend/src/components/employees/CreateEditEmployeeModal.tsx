import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3 } from 'lucide-react';
import type { Department, Country, Employee, CreateEmployeePayload, EmployeeStatus } from '@/types/api.types';

interface CreateEditEmployeeModalProps {
  isOpen: boolean;
  employeeToEdit?: Employee | null;
  departments: Department[];
  countries: Country[];
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload & { status?: EmployeeStatus }) => Promise<void>;
}

export const CreateEditEmployeeModal: React.FC<CreateEditEmployeeModalProps> = ({
  isOpen,
  employeeToEdit,
  departments,
  countries,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [jobTitle, setJobTitle] = useState('');
  const [countryId, setCountryId] = useState<number>(0);
  const [dateJoined, setDateJoined] = useState('');
  const [salary, setSalary] = useState<string>('');
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setJobTitle(employeeToEdit.jobTitle);
      setDateJoined(employeeToEdit.dateJoined);
      setSalary(String(employeeToEdit.salary));
      setStatus(employeeToEdit.status);

      const matchedDept = departments.find((d) => d.name === employeeToEdit.department);
      if (matchedDept) setDepartmentId(matchedDept.id);

      const matchedCountry = countries.find((c) => c.name === employeeToEdit.country);
      if (matchedCountry) setCountryId(matchedCountry.id);
    } else {
      setName('');
      setJobTitle('');
      setDateJoined(new Date().toISOString().split('T')[0]!);
      setSalary('');
      setStatus('ACTIVE');
      setDepartmentId(departments[0]?.id || 0);
      setCountryId(countries[0]?.id || 0);
    }
    setErrors({});
  }, [employeeToEdit, isOpen, departments, countries]);

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

  const selectedCountry = countries.find((c) => c.id === countryId);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name cannot be empty or whitespace only';
    if (!jobTitle.trim()) errs.jobTitle = 'Job title cannot be empty or whitespace only';
    if (!departmentId) errs.departmentId = 'Department is required';
    if (!countryId) errs.countryId = 'Country is required';
    if (!dateJoined || !/^\d{4}-\d{2}-\d{2}$/.test(dateJoined)) errs.dateJoined = 'Must be YYYY-MM-DD';
    if (salary === '' || Number(salary) < 0 || isNaN(Number(salary))) {
      errs.salary = 'Salary must be a non-negative number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        departmentId,
        jobTitle: jobTitle.trim(),
        countryId,
        dateJoined,
        salary: Number(salary),
        ...(employeeToEdit && { status }),
      });
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'data' in err && (err as { data?: Record<string, string> }).data) {
        setErrors((err as { data: Record<string, string> }).data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {employeeToEdit ? <Edit3 size={20} /> : <UserPlus size={20} />}
            {employeeToEdit ? `Edit Employee (${employeeToEdit.employeeId})` : 'Create New Employee'}
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arun Kumar"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Job Title */}
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className={`form-control ${errors.jobTitle ? 'error' : ''}`}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
              {errors.jobTitle && <span className="error-text">{errors.jobTitle}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className={`form-control ${errors.departmentId ? 'error' : ''}`}
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && <span className="error-text">{errors.departmentId}</span>}
            </div>

            {/* Country & Native Currency Preview */}
            <div className="form-group">
              <label className="form-label">Country *</label>
              <select
                className={`form-control ${errors.countryId ? 'error' : ''}`}
                value={countryId}
                onChange={(e) => setCountryId(Number(e.target.value))}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.currency.code} - {c.currency.symbol})
                  </option>
                ))}
              </select>
              {selectedCountry && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600 }}>
                  ℹ️ Native Currency auto-linked: {selectedCountry.currency.name} ({selectedCountry.currency.code})
                </span>
              )}
              {errors.countryId && <span className="error-text">{errors.countryId}</span>}
            </div>

            {/* Date Joined */}
            <div className="form-group">
              <label className="form-label">Date Joined (YYYY-MM-DD) *</label>
              <input
                type="date"
                className={`form-control ${errors.dateJoined ? 'error' : ''}`}
                value={dateJoined}
                onChange={(e) => setDateJoined(e.target.value)}
              />
              {errors.dateJoined && <span className="error-text">{errors.dateJoined}</span>}
            </div>

            {/* Base Salary */}
            <div className="form-group">
              <label className="form-label">
                Base Salary ({selectedCountry?.currency.code || 'Native Currency'}) *
              </label>
              <input
                type="number"
                min={0}
                step="any"
                className={`form-control ${errors.salary ? 'error' : ''}`}
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 1500000"
              />
              {errors.salary && <span className="error-text">{errors.salary}</span>}
            </div>

            {/* Status Field when editing */}
            {employeeToEdit && (
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : employeeToEdit ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
