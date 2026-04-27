import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';

const ReportsPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-screen font-inter bg-bg-main text-slate-200">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar currentPage="reports" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 group shrink-0"
                                aria-label="Open menu"
                            >
                                <span className="flex flex-col gap-[6px] items-center">
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                </span>
                            </button>
                            <a 
                                href="#dashboard" 
                                className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all text-sm font-bold"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-purple-300 group-hover:text-purple-600 group-hover:bg-white transition-colors">
                                    &lt;
                                </span>
                                Dashboard
                            </a>
                            <h1 className="text-5xl font-black font-outfit tracking-tight flex items-center gap-3 ml-2">
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                                    Reports
                                </span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-lg">
                            Generate comprehensive attendance reports and view system analytics.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Attendance Report Card */}
                    <div className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-500 overflow-hidden min-h-[240px] cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-3xl group-hover:scale-110 transition-transform duration-500">
                                📑
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Attendance Report</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">Generate and download detailed attendance reports for any given month.</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 mt-4">
                            Generate Report &rarr;
                        </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 transition-all duration-500 overflow-hidden min-h-[240px] cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 text-3xl group-hover:scale-110 transition-transform duration-500">
                                📈
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Analytics</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">View deep analytics, insights, and charts across labor metrics and system usage.</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-pink-400 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 mt-4">
                            View Analytics &rarr;
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
