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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar currentPage="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
        <header className="flex justify-between items-center">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
            </div>
          </button>

          <div className="flex-1 lg:flex-none">
            <h1 className="text-4xl font-bold mb-2 tracking-tight text-text-primary">Dashboard</h1>
            <p className="text-text-secondary text-lg">Welcome back! Here's an overview of your ERP system.</p>
          </div>
        </header>

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
