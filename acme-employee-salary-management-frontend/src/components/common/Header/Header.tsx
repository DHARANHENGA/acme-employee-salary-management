import React from 'react';
import { Users, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'employees' | 'analytics';
  onTabChange: (tab: 'employees' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand Left */}
        <div className="brand">
          <h1 className="brand-title">ACME Corp</h1>
        </div>

        {/* Navigation Tabs Centered */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => onTabChange('employees')}
            aria-selected={activeTab === 'employees'}
          >
            <Users size={16} /> Employees
          </button>
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => onTabChange('analytics')}
            aria-selected={activeTab === 'analytics'}
          >
            <BarChart3 size={16} /> Salary Analytics
          </button>
        </nav>

        {/* Right Spacer for exact centering */}
        <div className="header-spacer" />
      </div>
    </header>
  );
};
