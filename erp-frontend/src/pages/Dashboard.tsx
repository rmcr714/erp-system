import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import StatGrid from '../components/common/StatGrid';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen w-screen font-inter bg-bg-main">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar currentPage="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
        {/* Header Area */}
        <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:text-white hover:bg-accent-primary hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-300 group"
                        aria-label="Open menu"
                    >
                        <span className="flex flex-col gap-[4px] items-center">
                            <span className="block h-[2px] w-5 bg-current rounded-full group-hover:w-5 transition-all duration-300"></span>
                            <span className="block h-[2px] w-3 bg-current rounded-full group-hover:w-5 transition-all duration-300"></span>
                            <span className="block h-[2px] w-5 bg-current rounded-full group-hover:w-5 transition-all duration-300"></span>
                        </span>
                    </button>
                </div>
                <h1 className="text-4xl font-black font-outfit text-text-primary tracking-tight flex items-center gap-3">
                    Dashboard
                </h1>
                <p className="text-text-secondary text-lg">
                    Welcome back! Here's an overview of your ERP system.
                </p>
            </div>
        </div>

        <StatGrid 
          totalLaborers="3,000" 
          activeToday="2,842" 
          dailyPayroll="₹12.4L" 
        />

        <section className="bg-bg-card border border-border-subtle rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#laborers" className="p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle transition-all hover:-translate-y-1">
              <div className="text-3xl mb-2">👷</div>
              <h3 className="font-bold text-text-primary">Manage Laborers</h3>
              <p className="text-text-secondary text-sm mt-1">Add, view, and manage all laborers</p>
            </a>
            <a href="#attendance" className="p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle transition-all hover:-translate-y-1">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-bold text-text-primary">Attendance</h3>
              <p className="text-text-secondary text-sm mt-1">Track daily attendance records</p>
            </a>
            <a href="#payroll" className="p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle transition-all hover:-translate-y-1">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold text-text-primary">Payroll</h3>
              <p className="text-text-secondary text-sm mt-1">Manage payments and salary</p>
            </a>
            <a href="#settings" className="p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle transition-all hover:-translate-y-1">
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-bold text-text-primary">Settings</h3>
              <p className="text-text-secondary text-sm mt-1">Configure system settings</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
