import React from 'react';

interface StatGridProps {
  totalLaborers: number | string;
  activeToday: number | string;
  dailyPayroll: string;
}

const StatGrid: React.FC<StatGridProps> = ({ totalLaborers, activeToday, dailyPayroll }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 hover:border-accent-primary/30">
        <div className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">Total Laborers</div>
        <div className="text-4xl font-bold text-text-primary">{totalLaborers}</div>
      </div>
      <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 hover:border-accent-primary/30">
        <div className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">Active Today</div>
        <div className="text-4xl font-bold text-text-primary">{activeToday}</div>
      </div>
      <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 hover:border-accent-primary/30">
        <div className="text-text-secondary text-sm font-medium mb-1 uppercase tracking-wider">Total Payroll (Daily)</div>
        <div className="text-4xl font-bold text-text-primary">{dailyPayroll}</div>
      </div>
    </div>
  );
};

export default StatGrid;
