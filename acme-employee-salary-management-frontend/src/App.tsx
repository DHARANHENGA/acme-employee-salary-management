import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/common/Header';
import { Employees } from '@/pages/Employees/Employees';
import { Analytics } from '@/pages/Analytics/Analytics';
import { CreateEditEmployeeModal } from '@/components/employees/CreateEditEmployeeModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal/ConfirmationModal';
import { Toast, type ToastMessage } from '@/components/common/Toast/Toast';
import { employeeService } from '@/services/employee.service';
import { analyticsService } from '@/services/analytics.service';
import { referenceService } from '@/services/reference.service';
import type {
  Employee,
  Department,
  Country,
  AnalyticsData,
  EmployeeQueryParams,
  PaginationMeta,
  CreateEmployeePayload,
} from '@/types/api.types';
import { ApiError } from '@/services/api.client';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'analytics'>('employees');

  // Master Reference Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Employee Directory State & Independent Filters
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [employeeFilters, setEmployeeFilters] = useState<EmployeeQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'employeeId',
    sortOrder: 'asc',
  });
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Analytics State & Independent Filters
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsFilters, setAnalyticsFilters] = useState<EmployeeQueryParams>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modal Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);

  // Error Banner State
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Reference Data on Boot
  useEffect(() => {
    async function fetchRefData() {
      try {
        const [deptRes, countryRes] = await Promise.all([
          referenceService.getDepartments(),
          referenceService.getCountries(),
        ]);
        setDepartments(deptRes.data);
        setCountries(countryRes.data);
      } catch (err: unknown) {
        setErrorBanner('Failed to load reference metadata');
      }
    }
    fetchRefData();
  }, []);

  // Fetch Employees List using employeeFilters
  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      setErrorBanner(null);
      const res = await employeeService.getEmployees(employeeFilters);
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message || 'Failed to fetch employees');
      } else {
        setErrorBanner('Unable to connect to backend server');
      }
    } finally {
      setLoadingEmployees(false);
    }
  }, [employeeFilters]);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    }
  }, [activeTab, fetchEmployees]);

  // Fetch Salary Analytics using independent analyticsFilters
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      setErrorBanner(null);
      const res = await analyticsService.getAnalytics({
        departmentId: analyticsFilters.departmentId,
        countryId: analyticsFilters.countryId,
        status: analyticsFilters.status,
      });
      setAnalyticsData(res.data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message || 'Failed to fetch analytics');
      } else {
        setErrorBanner('Unable to connect to backend server');
      }
    } finally {
      setLoadingAnalytics(false);
    }
  }, [analyticsFilters.departmentId, analyticsFilters.countryId, analyticsFilters.status]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  // Employee Directory Filter & Sort Event Handlers
  const handleEmployeeFilterChange = (newFilters: Partial<EmployeeQueryParams>) => {
    setEmployeeFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetEmployeeFilters = () => {
    setEmployeeFilters((prev) => ({
      ...prev,
      departmentId: undefined,
      countryId: undefined,
      status: undefined,
      joinedFrom: undefined,
      joinedTo: undefined,
    }));
    addToast('info', 'Directory filters reset');
  };

  const handleSortChange = (sortByField: 'employeeId' | 'name' | 'dateJoined' | 'salary') => {
    setEmployeeFilters((prev) => {
      const isSameField = prev.sortBy === sortByField;
      const nextOrder = isSameField && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: sortByField, sortOrder: nextOrder, page: 1 };
    });
  };

  // Analytics Filter Event Handlers
  const handleAnalyticsFilterChange = (newFilters: Partial<EmployeeQueryParams>) => {
    setAnalyticsFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetAnalyticsFilters = () => {
    setAnalyticsFilters({});
    addToast('info', 'Analytics filters reset');
  };

  // Employee CRUD Action Handlers
  const handleCreateOrUpdate = async (payload: CreateEmployeePayload) => {
    try {
      if (employeeToEdit) {
        await employeeService.updateEmployee(employeeToEdit.employeeId, payload);
        addToast('success', `Employee ${payload.name} updated successfully!`);
      } else {
        await employeeService.createEmployee(payload);
        addToast('success', `Employee ${payload.name} created successfully!`);
      }
      fetchEmployees();
      if (activeTab === 'analytics') fetchAnalytics();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        addToast('error', err.message);
      } else {
        addToast('error', 'Action failed');
      }
      throw err;
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingEmployee) return;
    try {
      await employeeService.deactivateEmployee(deactivatingEmployee.employeeId);
      addToast('info', `Employee ${deactivatingEmployee.name} deactivated.`);
      setDeactivatingEmployee(null);
      fetchEmployees();
      if (activeTab === 'analytics') fetchAnalytics();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        addToast('error', err.message);
      } else {
        addToast('error', 'Failed to deactivate employee');
      }
    }
  };

  const handleReactivate = async (employee: Employee) => {
    try {
      const matchedDept = departments.find((d) => d.name === employee.department);
      const matchedCountry = countries.find((c) => c.name === employee.country);

      await employeeService.updateEmployee(employee.employeeId, {
        name: employee.name,
        departmentId: matchedDept ? matchedDept.id : 1,
        countryId: matchedCountry ? matchedCountry.id : 1,
        jobTitle: employee.jobTitle,
        dateJoined: employee.dateJoined,
        salary: employee.salary,
        status: 'ACTIVE',
      });
      addToast('success', `Employee ${employee.name} reactivated!`);
      fetchEmployees();
      if (activeTab === 'analytics') fetchAnalytics();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        addToast('error', err.message);
      } else {
        addToast('error', 'Failed to reactivate employee');
      }
    }
  };

  return (
    <div className="app-container">
      {/* Universal Header Component */}
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Persistent Toast Popup System */}
        <Toast toasts={toasts} onDismiss={handleDismissToast} />

        {/* Global Error Banner */}
        {errorBanner && (
          <div
            className="card"
            style={{
              backgroundColor: 'var(--color-status-inactive-bg)',
              color: 'var(--color-status-inactive-text)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>Error:</strong> {errorBanner}
            </div>
            <button className="btn btn-secondary" onClick={() => fetchEmployees()}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Tab 1: Employees Directory Page */}
        {activeTab === 'employees' && (
          <Employees
            employees={employees}
            departments={departments}
            countries={countries}
            pagination={pagination}
            filters={employeeFilters}
            loading={loadingEmployees}
            onFilterChange={handleEmployeeFilterChange}
            onResetFilters={handleResetEmployeeFilters}
            onSortChange={handleSortChange}
            onAddEmployeeClick={() => {
              setEmployeeToEdit(null);
              setIsModalOpen(true);
            }}
            onEditEmployee={(emp) => {
              setEmployeeToEdit(emp);
              setIsModalOpen(true);
            }}
            onDeactivateEmployee={(emp) => setDeactivatingEmployee(emp)}
            onReactivateEmployee={handleReactivate}
          />
        )}

        {/* Tab 2: Salary Analytics Page */}
        {activeTab === 'analytics' && (
          <Analytics
            data={analyticsData}
            loading={loadingAnalytics}
            departments={departments}
            countries={countries}
            filters={analyticsFilters}
            onFilterChange={handleAnalyticsFilterChange}
            onResetFilters={handleResetAnalyticsFilters}
          />
        )}

        {/* Create/Edit Modal */}
        <CreateEditEmployeeModal
          isOpen={isModalOpen}
          employeeToEdit={employeeToEdit}
          departments={departments}
          countries={countries}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
        />

        {/* Deactivation Confirmation Modal */}
        <ConfirmationModal
          isOpen={Boolean(deactivatingEmployee)}
          title="Deactivate Employee"
          message={`Are you sure you want to deactivate ${deactivatingEmployee?.name}? Their record will remain available for historical analytics.`}
          confirmLabel="Confirm Deactivation"
          onCancel={() => setDeactivatingEmployee(null)}
          onConfirm={handleDeactivate}
        />
      </main>
    </div>
  );
};

export default App;
