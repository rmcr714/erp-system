import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { reportService } from '../../modules/reports/services/reportService';
import { type MusterRow } from '../../modules/reports/types';
import AttendanceReportGrid from '../../modules/reports/components/AttendanceReportGrid';
import { toast } from 'react-hot-toast';

interface AttendanceReportPageProps {
    siteId: number;
}

const AttendanceReportPage: React.FC<AttendanceReportPageProps> = ({ siteId }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<MusterRow[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(100);
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
        setCurrentPage(0);
        fetchReport(0);
    }, [month, year, siteId]);

    const fetchReport = async (page: number) => {
        setLoading(true);
        try {
            const response = await reportService.getAttendanceReport(month, year, siteId, page, pageSize);
            // The service now returns PaginatedMuster
            setData(response.page.content as any);
            setTotalElements(response.page.totalElements);
            setCurrentPage(page);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

    const handleExportAll = async () => {
        try {
            toast.loading('Preparing full report...', { id: 'export' });
            // Fetch everything (max 10000 for export)
            const response = await reportService.getAttendanceReport(month, year, siteId, 0, 10000);
            const daysInMonth = new Date(year, month, 0).getDate();
            const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
            const monthName = monthNames[month - 1];
            
            const { exportAttendanceToExcel } = await import('../../modules/reports/utils/attendanceExport');
            await exportAttendanceToExcel(response.page.content, monthName, year, daysArray);
            toast.success('Report downloaded!', { id: 'export' });
        } catch (error) {
            toast.error('Export failed', { id: 'export' });
        }
    };

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

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button 
                            onClick={handleExportAll}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                        >
                            <span>📊</span> Download Full Excel
                        </button>

                        <div className="relative flex items-center gap-4 bg-slate-900 border border-white/10 p-2 rounded-2xl">
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

                        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-2xl">
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
                    <>
                        <AttendanceReportGrid 
                            data={data}
                            month={month}
                            year={year}
                            filterDesignation={filterDesignation}
                            onDesignationChange={setFilterDesignation}
                        />
                        
                        {/* Pagination Controls */}
                        {totalElements > pageSize && (
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <button 
                                    onClick={() => fetchReport(currentPage - 1)} 
                                    disabled={currentPage === 0 || loading} 
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl font-bold transition-all border border-white/10"
                                >
                                    Previous Page
                                </button>
                                <span className="text-slate-400 font-mono">
                                    Page {currentPage + 1} of {totalPages} ({totalElements} Workers)
                                </span>
                                <button 
                                    onClick={() => fetchReport(currentPage + 1)} 
                                    disabled={currentPage + 1 >= totalPages || loading} 
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20"
                                >
                                    Next Page
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AttendanceReportPage;
