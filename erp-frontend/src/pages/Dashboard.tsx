import React, { useState } from 'react';
import Sidebar from '../components/common/Sidebar';

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
                <h1 className="text-5xl font-black font-outfit tracking-tight flex items-center gap-3">
                    <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                        AD Group ERP
                    </span>
                </h1>
                <p className="text-text-secondary text-lg">
                    Welcome back! Here's an overview of your ERP system.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
            {/* Laborers Card */}
            <a href="#laborers" className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all duration-500 overflow-hidden min-h-[240px]">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400 text-3xl group-hover:scale-110 transition-transform duration-500">
                        👷
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">Laborer Directory</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">Manage workforce, onboarding, bank accounts, and active status.</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-sky-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 mt-4">
                    Open Directory &rarr;
                </div>
            </a>

            {/* Attendance Card */}
            <a href="#attendance" className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden min-h-[240px]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-3xl group-hover:scale-110 transition-transform duration-500">
                        📅
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Attendance Muster</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">Track daily presence, log units, and finalize monthly attendance.</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 mt-4">
                    Log Attendance &rarr;
                </div>
            </a>

            {/* Payroll Card */}
            <a href="#payroll" className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all duration-500 overflow-hidden min-h-[240px]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-3xl group-hover:scale-110 transition-transform duration-500">
                        💰
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Monthly Payroll</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">Calculate wages, process advances, and manage closing balances.</p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 mt-4">
                    Process Payroll &rarr;
                </div>
            </a>
            
            {/* Settings Card */}
            <a href="#settings" className="group relative flex flex-col sm:flex-row justify-between sm:items-center p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-500/50 transition-all duration-500 overflow-hidden md:col-span-2 xl:col-span-3">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-3xl group-hover:rotate-90 transition-transform duration-700">
                        ⚙️
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white group-hover:text-slate-300 transition-colors">System Settings</h2>
                        <p className="text-slate-400 text-lg mt-1">Configure project sites, roles, and administrative options.</p>
                    </div>
                </div>
            </a>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
