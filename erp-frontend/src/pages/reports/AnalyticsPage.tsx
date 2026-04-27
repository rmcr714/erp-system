import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { analyticsService, type LaborCostData } from '../../modules/analytics/services/analyticsService';
import Sidebar from '../../components/common/Sidebar';

const AnalyticsPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<LaborCostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDesignation, setFilterDesignation] = useState<string>('All');
    const [filterTimeRange, setFilterTimeRange] = useState<number>(1);
    const [customMonth, setCustomMonth] = useState<number>(new Date().getMonth() + 1);
    const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const rawData = await analyticsService.getLaborCostTrends();
            setData(rawData);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    // Process data for charts
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get unique designations
    const designations = Array.from(new Set(data.map(d => d.designation))).sort();

    // Prepare M/M Trend Data
    // Group by "Year-Month", then create an object with each designation as a key
    const trendDataMap = new Map<string, any>();
    data.forEach(item => {
        if (filterDesignation !== 'All' && item.designation !== filterDesignation) return;

        const label = `${monthNames[item.month - 1]} ${item.year}`;
        const sortKey = item.year * 12 + item.month;
        if (!trendDataMap.has(label)) {
            trendDataMap.set(label, { label, sortKey, total: 0 });
        }
        const entry = trendDataMap.get(label);
        entry[item.designation] = (entry[item.designation] || 0) + item.totalGrossSalary;
        entry.total += item.totalGrossSalary;
    });

    let trendData = Array.from(trendDataMap.values()).sort((a, b) => a.sortKey - b.sortKey);

    if (filterTimeRange > 0) {
        trendData = trendData.slice(-filterTimeRange);
    } else if (filterTimeRange === -1) {
        const customSortKey = customYear * 12 + customMonth;
        trendData = trendData.filter(item => item.sortKey === customSortKey);
    }

    const totalGrossSummary = trendData.reduce((sum, item) => sum + item.total, 0);

    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];

    return (
        <div className="flex h-screen w-screen font-inter bg-bg-main text-slate-200">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar currentPage="reports/analytics" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:text-white hover:bg-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all duration-300 group shrink-0"
                            >
                                <span className="flex flex-col gap-[6px] items-center">
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                </span>
                            </button>
                            <a 
                                href="#reports" 
                                className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:text-white hover:bg-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all text-sm font-bold"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-pink-500/20 text-pink-300 group-hover:text-pink-600 group-hover:bg-white transition-colors">
                                    &lt;
                                </span>
                                Reports
                            </a>
                            <h1 className="text-5xl font-black font-outfit tracking-tight flex items-center gap-3 ml-2">
                                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-sm">
                                    Analytics
                                </span>
                            </h1>
                        </div>
                        <p className="text-slate-400 text-lg">
                            Track labor cost trends (Gross Salary) over time.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative flex items-center gap-4 bg-slate-900 border border-white/10 p-2 rounded-2xl">
                            <span className="text-sm font-bold text-slate-400 pl-2">Filter Role:</span>
                            
                            <div className="relative">
                                <button
                                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                    className="flex items-center gap-2 bg-slate-800 text-pink-400 font-bold px-4 py-2 rounded-xl border border-pink-500/30 hover:bg-slate-700 hover:border-pink-500/50 transition-all focus:outline-none min-w-[220px] justify-between shadow-inner"
                                >
                                    <span className="truncate">{filterDesignation === 'All' ? 'All Workers Combined' : filterDesignation}</span>
                                    <span className={`text-pink-500 text-[10px] transition-transform duration-300 ${roleDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {roleDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40"
                                            onClick={() => setRoleDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-pink-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                <button
                                                    onClick={() => { setFilterDesignation('All'); setRoleDropdownOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 font-bold transition-colors ${filterDesignation === 'All' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-300 hover:bg-slate-700 hover:text-pink-300'}`}
                                                >
                                                    All Workers Combined
                                                </button>
                                                {designations.map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => { setFilterDesignation(d); setRoleDropdownOpen(false); }}
                                                        className={`w-full text-left px-4 py-3 font-bold transition-colors border-t border-white/5 ${filterDesignation === d ? 'bg-pink-500/20 text-pink-400' : 'text-slate-300 hover:bg-slate-700 hover:text-pink-300'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 border border-white/10 p-1.5 rounded-2xl">
                            {[
                                { label: 'This Month', value: 1 },
                                { label: '3 Months', value: 3 },
                                { label: '6 Months', value: 6 },
                                { label: '12 Months', value: 12 },
                                { label: 'Custom', value: -1 }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilterTimeRange(option.value)}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${
                                        filterTimeRange === option.value 
                                            ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        {filterTimeRange === -1 && (
                            <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-2xl animate-in fade-in zoom-in duration-300">
                                {/* Custom Month Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                                        className="flex items-center gap-2 bg-slate-800 text-purple-400 font-bold px-4 py-1.5 rounded-xl border border-purple-500/30 hover:bg-slate-700 transition-all focus:outline-none min-w-[110px] justify-between shadow-inner"
                                    >
                                        <span>{monthNames[customMonth - 1]}</span>
                                        <span className={`text-purple-500 text-[10px] transition-transform duration-300 ${monthDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                    </button>

                                    {monthDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setMonthDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-purple-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {monthNames.map((m, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => { setCustomMonth(i + 1); setMonthDropdownOpen(false); }}
                                                            className={`w-full text-left px-4 py-2 font-bold transition-colors ${i > 0 ? 'border-t border-white/5' : ''} ${customMonth === i + 1 ? 'bg-purple-500/20 text-purple-400' : 'text-slate-300 hover:bg-slate-700 hover:text-purple-300'}`}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Custom Year Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                                        className="flex items-center gap-2 bg-slate-800 text-purple-400 font-bold px-4 py-1.5 rounded-xl border border-purple-500/30 hover:bg-slate-700 transition-all focus:outline-none min-w-[90px] justify-between shadow-inner"
                                    >
                                        <span>{customYear}</span>
                                        <span className={`text-purple-500 text-[10px] transition-transform duration-300 ${yearDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                    </button>

                                    {yearDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setYearDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-purple-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {[...Array(5)].map((_, i) => {
                                                        const year = new Date().getFullYear() - i;
                                                        return (
                                                            <button
                                                                key={year}
                                                                onClick={() => { setCustomYear(year); setYearDropdownOpen(false); }}
                                                                className={`w-full text-left px-4 py-2 font-bold transition-colors ${i > 0 ? 'border-t border-white/5' : ''} ${customYear === year ? 'bg-purple-500/20 text-purple-400' : 'text-slate-300 hover:bg-slate-700 hover:text-purple-300'}`}
                                                            >
                                                                {year}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-pink-400 font-bold animate-pulse text-xl">Loading Analytics...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/5 border border-pink-500/20 rounded-3xl p-6 flex flex-col gap-2 shadow-lg">
                                <span className="text-pink-300 font-bold uppercase tracking-widest text-xs">Total Gross Cost</span>
                                <span className="text-4xl font-black text-white">₹{totalGrossSummary.toLocaleString()}</span>
                                <span className="text-slate-400 text-sm">For {filterDesignation === 'All' ? 'All Roles' : filterDesignation} ({filterTimeRange === -1 ? `${monthNames[customMonth - 1]} ${customYear}` : filterTimeRange === 1 ? 'This Month' : `Last ${filterTimeRange} Months`})</span>
                            </div>
                        </div>

                        {/* Trend Chart */}
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6">M/M Labor Cost Trends (Gross)</h2>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="label" stroke="#64748b" />
                                        <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val/1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                                        />
                                        <Legend />
                                        
                                        {filterDesignation === 'All' ? (
                                            designations.map((desig, i) => (
                                                <Bar 
                                                    key={desig}
                                                    dataKey={desig} 
                                                    fill={colors[i % colors.length]} 
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            ))
                                        ) : (
                                            <Bar 
                                                dataKey={filterDesignation} 
                                                fill="#ec4899" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                        )}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart Summary for currently selected/latest month */}
                        {filterDesignation === 'All' && trendData.length > 0 && (
                            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6">Role Cost Breakdown ({trendData[trendData.length - 1]?.label})</h2>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[trendData[trendData.length - 1]]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <XAxis dataKey="label" stroke="#64748b" />
                                            <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val/1000}k`} />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                                            />
                                            <Legend />
                                            {designations.map((desig, i) => (
                                                <Bar key={desig} dataKey={desig} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AnalyticsPage;
