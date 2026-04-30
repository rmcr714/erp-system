import React, { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../../modules/reports/services/analyticsService';
import { type LaborCostData } from '../../modules/reports/types';
import Sidebar from '../../components/common/Sidebar';
import LaborCostCharts from '../../modules/reports/components/LaborCostCharts';

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

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const designations = useMemo(() => Array.from(new Set(data.map(d => d.designation))).sort(), [data]);

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
                    <LaborCostCharts 
                        data={data}
                        filterDesignation={filterDesignation}
                        filterTimeRange={filterTimeRange}
                        customMonth={customMonth}
                        customYear={customYear}
                    />
                )}
            </main>
        </div>
    );
};

export default AnalyticsPage;
