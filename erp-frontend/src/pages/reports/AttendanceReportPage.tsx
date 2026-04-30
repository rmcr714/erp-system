import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { reportService } from '../../modules/reports/services/reportService';
import { type MusterRow } from '../../modules/reports/types';
import AttendanceReportGrid from '../../modules/reports/components/AttendanceReportGrid';

const AttendanceReportPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<MusterRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [filterDesignation, setFilterDesignation] = useState<string>('All');

    // Custom Dropdown States
    const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const result = await reportService.getAttendanceReport(month, year);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    const designations = useMemo(() => 
        Array.from(new Set(data.map(d => d.designation))).sort(), 
    [data]);

    return (
        <div className="flex h-screen w-screen font-inter bg-bg-main text-slate-200">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar currentPage="reports/attendance" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 group shrink-0"
                            >
                                <span className="flex flex-col gap-[6px] items-center">
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                </span>
                            </button>
                            <a
                                href="#reports"
                                className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all text-sm font-bold"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-purple-300 group-hover:text-purple-600 group-hover:bg-white transition-colors">
                                    &lt;
                                </span>
                                Reports
                            </a>
                            <h1 className="text-5xl font-black font-outfit tracking-tight flex items-center gap-3 ml-2">
                                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                                    Attendance Report
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative flex items-center gap-4 bg-slate-900 border border-white/10 p-2 rounded-2xl animate-in fade-in zoom-in duration-300">
                            <span className="text-sm font-bold text-slate-400 pl-2">Filter Role:</span>

                            <div className="relative">
                                <button
                                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                    className="flex items-center gap-2 bg-slate-800 text-indigo-400 font-bold px-4 py-2 rounded-xl border border-indigo-500/30 hover:bg-slate-700 hover:border-indigo-500/50 transition-all focus:outline-none min-w-[200px] justify-between shadow-inner"
                                >
                                    <span className="truncate">{filterDesignation === 'All' ? 'All Roles' : filterDesignation}</span>
                                    <span className={`text-indigo-500 text-[10px] transition-transform duration-300 ${roleDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {roleDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setRoleDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-indigo-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                <button
                                                    onClick={() => { setFilterDesignation('All'); setRoleDropdownOpen(false); }}
                                                    className={`w-full text-left px-4 py-3 font-bold transition-colors ${filterDesignation === 'All' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-700 hover:text-indigo-300'}`}
                                                >
                                                    All Roles
                                                </button>
                                                {designations.map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => { setFilterDesignation(d); setRoleDropdownOpen(false); }}
                                                        className={`w-full text-left px-4 py-3 font-bold transition-colors border-t border-white/5 ${filterDesignation === d ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-700 hover:text-indigo-300'}`}
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


                        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-2xl animate-in fade-in zoom-in duration-300">
                            <div className="relative">
                                <button onClick={() => setMonthDropdownOpen(!monthDropdownOpen)} className="flex items-center gap-2 bg-slate-800 text-indigo-400 font-bold px-4 py-2 rounded-xl border border-indigo-500/30 hover:bg-slate-700 transition-all focus:outline-none min-w-[120px] justify-between shadow-inner">
                                    <span>{monthNames[month - 1]}</span>
                                    <span className={`text-indigo-500 text-[10px] transition-transform duration-300 ${monthDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {monthDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setMonthDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-indigo-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {monthNames.map((m, i) => (
                                                    <button key={i} onClick={() => { setMonth(i + 1); setMonthDropdownOpen(false); }} className={`w-full text-left px-4 py-2 font-bold transition-colors ${i > 0 ? 'border-t border-white/5' : ''} ${month === i + 1 ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-700 hover:text-indigo-300'}`}>{m}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button onClick={() => setYearDropdownOpen(!yearDropdownOpen)} className="flex items-center gap-2 bg-slate-800 text-indigo-400 font-bold px-4 py-2 rounded-xl border border-indigo-500/30 hover:bg-slate-700 transition-all focus:outline-none min-w-[100px] justify-between shadow-inner">
                                    <span>{year}</span>
                                    <span className={`text-indigo-500 text-[10px] transition-transform duration-300 ${yearDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {yearDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setYearDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-indigo-500/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {[...Array(5)].map((_, i) => {
                                                    const y = new Date().getFullYear() - i;
                                                    return <button key={y} onClick={() => { setYear(y); setYearDropdownOpen(false); }} className={`w-full text-left px-4 py-2 font-bold transition-colors ${i > 0 ? 'border-t border-white/5' : ''} ${year === y ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-700 hover:text-indigo-300'}`}>{y}</button>
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-indigo-400 font-bold animate-pulse text-xl">Loading Report...</div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-slate-500 font-bold text-xl">No attendance data found for {monthNames[month - 1]} {year}.</div>
                    </div>
                ) : (
                    <AttendanceReportGrid 
                        data={data}
                        month={month}
                        year={year}
                        filterDesignation={filterDesignation}
                        onDesignationChange={setFilterDesignation}
                    />
                )}
            </main>
        </div>
    );
};

export default AttendanceReportPage;
