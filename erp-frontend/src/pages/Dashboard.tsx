import React, { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import { dashboardService, type DashboardStats } from '../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DESIGNATION_COLORS: Record<string, string> = {
    'Carpenter': '#f59e0b',
    'Steel fitter': '#3b82f6',
    'Block mason': '#ef4444',
    'Plaster mason': '#8b5cf6',
    'Unskilled': '#6b7280',
    'Other': '#14b8a6',
};

const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString('en-IN')}`;
};

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (err) {
                setError('Could not load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const todayDate = new Date();
    const greeting = todayDate.getHours() < 12 ? 'Good Morning' : todayDate.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="flex h-screen w-screen font-inter bg-bg-main">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}
            <Sidebar currentPage="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:text-white hover:bg-accent-primary hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-300 group"
                                aria-label="Open menu"
                            >
                                <span className="flex flex-col gap-[6px] items-center">
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                </span>
                            </button>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black font-outfit tracking-tight">
                                    <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                                        {greeting}
                                    </span>
                                </h1>
                                <p className="text-text-secondary text-sm mt-1">
                                    {todayDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    {stats && ` • ${MONTH_NAMES[(stats.currentMonth || 1) - 1]} ${stats.currentYear}`}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-accent-primary/30 border-t-accent-primary animate-spin"></div>
                            <p className="text-text-secondary">Loading dashboard...</p>
                        </div>
                    </div>
                ) : error || !stats ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center glass-card p-12">
                            <p className="text-4xl mb-4">⚠️</p>
                            <p className="text-text-secondary text-lg">{error || 'No data available'}</p>
                            <p className="text-text-secondary/60 text-sm mt-2">Make sure the backend is running and the month has been started.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* ═══ ROW 1: Two Key Metric Cards ═══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Active Workers — Hero Card */}
                            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-sky-500/[0.08] via-indigo-500/[0.05] to-transparent border border-sky-500/20 hover:border-sky-400/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-500/[0.06] rounded-full blur-2xl"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="h-9 w-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
                                            <span className="text-lg">👷</span>
                                        </div>
                                        <p className="text-sky-300/80 text-xs font-bold uppercase tracking-[0.15em]">Active Workforce</p>
                                    </div>
                                    <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats.activeLaborers}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-secondary">
                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                            {stats.totalLaborers} total
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                                            {stats.onLeaveLaborers} on leave
                                        </span>
                                        {stats.inactiveLaborers > 0 && (
                                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                                                {stats.inactiveLaborers} inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gross Payroll — Hero Card */}
                            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/20 hover:border-amber-400/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/[0.06] rounded-full blur-2xl"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                            <span className="text-lg">💰</span>
                                        </div>
                                        <p className="text-amber-300/80 text-xs font-bold uppercase tracking-[0.15em]">Gross Payroll</p>
                                    </div>
                                    <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{formatCurrency(stats.currentMonthGrossPayroll)}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                            📅 {MONTH_NAMES[(stats.currentMonth || 1) - 1]} {stats.currentYear}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ ROW 2: Workforce Breakdown + Payroll Trend ═══ */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Workforce by Designation */}
                            <div className="lg:col-span-1 rounded-2xl bg-slate-900/80 border border-white/[0.06] p-6">
                                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Workforce Breakdown</h3>
                                <div className="flex flex-col gap-3">
                                    {Object.entries(stats.laborersByDesignation)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([desig, count]) => {
                                            const percentage = stats.activeLaborers > 0 ? (count / stats.activeLaborers) * 100 : 0;
                                            const color = DESIGNATION_COLORS[desig] || '#6b7280';
                                            return (
                                                <div key={desig} className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="text-sm text-text-primary truncate">{desig}</span>
                                                            <span className="text-sm font-bold text-white ml-2">{count}</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                                style={{ width: `${percentage}%`, backgroundColor: color }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                {stats.newJoineesThisMonth > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                                        <span className="text-lg">🆕</span>
                                        <span className="text-sm text-emerald-400 font-medium">{stats.newJoineesThisMonth} new joinees this month</span>
                                    </div>
                                )}
                            </div>

                            {/* Payroll Trend Chart */}
                            <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-white/[0.06] p-6">
                                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Payroll Trend (6 Months)</h3>
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.payrollTrends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                                                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Gross Payroll']}
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            />
                                            <defs>
                                                <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                            <Bar dataKey="value" fill="url(#payrollGradient)" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>


                        {/* ═══ ROW 4: Quick Navigation Cards ═══ */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <a href="#laborers" className="group relative p-5 rounded-2xl bg-gradient-to-br from-sky-500/[0.06] via-sky-600/[0.03] to-transparent border border-white/[0.06] hover:border-sky-500/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500/[0.06] rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex flex-col gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all duration-300">👷</div>
                                    <div>
                                        <p className="text-[15px] font-bold text-white group-hover:text-sky-400 transition-colors duration-300">Laborers</p>
                                        <p className="text-xs text-text-secondary mt-0.5">{stats.totalLaborers} registered</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary/50 group-hover:text-sky-400/70 transition-colors">
                                        <span className="text-xs font-medium">Open</span>
                                        <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </div>
                                </div>
                            </a>

                            <a href="#attendance" className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.06] via-emerald-600/[0.03] to-transparent border border-white/[0.06] hover:border-emerald-500/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/[0.06] rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex flex-col gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">📅</div>
                                    <div>
                                        <p className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">Attendance</p>
                                        <p className="text-xs text-text-secondary mt-0.5">Log daily units</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary/50 group-hover:text-emerald-400/70 transition-colors">
                                        <span className="text-xs font-medium">Open</span>
                                        <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </div>
                                </div>
                            </a>

                            <a href="#payroll" className="group relative p-5 rounded-2xl bg-gradient-to-br from-amber-500/[0.06] via-amber-600/[0.03] to-transparent border border-white/[0.06] hover:border-amber-500/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/[0.06] rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex flex-col gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300">💰</div>
                                    <div>
                                        <p className="text-[15px] font-bold text-white group-hover:text-amber-400 transition-colors duration-300">Payroll</p>
                                        <p className="text-xs text-text-secondary mt-0.5">Process salaries</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary/50 group-hover:text-amber-400/70 transition-colors">
                                        <span className="text-xs font-medium">Open</span>
                                        <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </div>
                                </div>
                            </a>

                            <a href="#reports" className="group relative p-5 rounded-2xl bg-gradient-to-br from-purple-500/[0.06] via-purple-600/[0.03] to-transparent border border-white/[0.06] hover:border-purple-500/40 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/[0.06] rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative flex flex-col gap-3">
                                    <div className="h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300">📑</div>
                                    <div>
                                        <p className="text-[15px] font-bold text-white group-hover:text-purple-400 transition-colors duration-300">Reports</p>
                                        <p className="text-xs text-text-secondary mt-0.5">Analytics & exports</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-text-secondary/50 group-hover:text-purple-400/70 transition-colors">
                                        <span className="text-xs font-medium">Open</span>
                                        <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
