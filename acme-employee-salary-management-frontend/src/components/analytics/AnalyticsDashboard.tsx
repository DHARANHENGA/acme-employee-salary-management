import React from 'react';
import type { AnalyticsData } from '@/types/api.types';
import { Users, DollarSign, TrendingUp, BarChart2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Calculating salary analytics...</p>
      </div>
    );
  }

  const { summary, byCountry, byDepartment, salaryBands } = data;

  const formatUsd = (val: number, decimals: number = 2) => {
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return (
    <div>
      {/* Metrics Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Total Active & Inactive Employees</span>
            <Users size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          </div>
          <div className="metric-value">{summary.employeeCount.toLocaleString()}</div>
        </div>

        <div className="metric-card" title={formatUsd(summary.totalPayroll, 2)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Total Annual Payroll (USD)</span>
            <DollarSign size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          </div>
          <div className="metric-value">{formatUsd(summary.totalPayroll, 2)}</div>
        </div>

        <div className="metric-card" title={formatUsd(summary.averageSalary, 2)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Average Salary (USD)</span>
            <TrendingUp size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          </div>
          <div className="metric-value">{formatUsd(summary.averageSalary, 2)}</div>
        </div>

        <div className="metric-card" title={formatUsd(summary.medianSalary, 2)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-title">Median Salary (USD)</span>
            <BarChart2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          </div>
          <div className="metric-value">{formatUsd(summary.medianSalary, 2)}</div>
        </div>
      </div>

      {/* Salary Bands Distribution Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Salary Distribution Bands (USD Normalized)</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {salaryBands.map((band) => (
            <div key={band.band}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                <span>{band.band}</span>
                <span>
                  {band.employeeCount.toLocaleString()} employees ({band.percentage}%)
                </span>
              </div>
              <div
                style={{
                  height: '12px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${band.percentage}%`,
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-pill)',
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown by Department & Country */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Department Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Salary Breakdown by Department</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Count</th>
                  <th>Avg Salary (USD)</th>
                  <th>Total Payroll (USD)</th>
                </tr>
              </thead>
              <tbody>
                {byDepartment.map((d) => (
                  <tr key={d.department}>
                    <td style={{ fontWeight: 600 }}>{d.department}</td>
                    <td>{d.employeeCount.toLocaleString()}</td>
                    <td>{formatUsd(d.averageSalary, 2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatUsd(d.totalPayroll, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Salary Breakdown by Country</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Count</th>
                  <th>Avg Salary (USD)</th>
                  <th>Total Payroll (USD)</th>
                </tr>
              </thead>
              <tbody>
                {byCountry.map((c) => (
                  <tr key={c.country}>
                    <td style={{ fontWeight: 600 }}>{c.country}</td>
                    <td>{c.employeeCount.toLocaleString()}</td>
                    <td>{formatUsd(c.averageSalary, 2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatUsd(c.totalPayroll, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
