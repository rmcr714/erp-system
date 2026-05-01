import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { attendanceService } from '../../modules/attendance/services/attendanceService';

interface WorkerPresence {
    grNo: string;
    name: string;
    designation: string;
    units: number;
    day: number;
}

const WorkerPresencePage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<WorkerPresence[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 20;

    // Default to current day, but allow 0 for "All"
    const [day, setDay] = useState<number>(new Date().getDate());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [grNo, setGrNo] = useState('');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const handleSearch = async (targetPage = 0) => {
        // Validation: Must have at least GR No OR Month+Year
        if (!grNo.trim() && (month === 0 || year === 0)) {
            alert("Please provide at least a GR Number OR select a specific Month and Year.");
            return;
        }

        setLoading(true);
        setSearchPerformed(true);
        setPage(targetPage);
        
        try {
            const response = await attendanceService.getWorkerPresence(
                day === 0 ? null : day, 
                month === 0 ? null : month, 
                year === 0 ? null : year, 
                grNo.trim() || undefined,
                targetPage,
                size
            );
            setData(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            handleSearch(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            handleSearch(page - 1);
        }
    };

    return (
        <div className="flex h-screen w-screen font-inter bg-slate-950 text-slate-200">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}
            <Sidebar currentPage="reports/worker-presence" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 p-10 overflow-y-auto flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:text-white hover:bg-sky-500 transition-all group shrink-0">
                                <span className="flex flex-col gap-[6px] items-center">
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                    <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                </span>
                            </button>
                            <a href="#report" className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:text-white hover:bg-sky-500 transition-all text-sm font-bold">
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-500/20 text-sky-300 group-hover:text-sky-600 group-hover:bg-white transition-colors">&lt;</span>
                                Reports
                            </a>
                            <h1 className="text-5xl font-black font-outfit tracking-tight">
                                <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Worker Presence</span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Search Controls Card */}
                <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Day</label>
                            <select value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                                <option value={0}>All Days</option>
                                {[...Array(31)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Month</label>
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                                <option value={0}>All Months</option>
                                {monthNames.map((m, i) => (
                                    <option key={i+1} value={i+1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Year</label>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all">
                                <option value={0}>All Years</option>
                                {[...Array(5)].map((_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    return <option key={y} value={y}>{y}</option>
                                })}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">GR Number</label>
                            <input 
                                type="text" 
                                value={grNo} 
                                onChange={(e) => setGrNo(e.target.value)} 
                                placeholder="Search GR..."
                                className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button 
                            onClick={() => handleSearch(0)}
                            disabled={loading}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : '🔍 Search Presence'}
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div className="flex-1 min-h-0 bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                    {!searchPerformed ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                            <span className="text-6xl">🔍</span>
                            <p className="text-xl font-bold">Select a date and click search to view records</p>
                        </div>
                    ) : loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                            <span className="text-6xl">📭</span>
                            <p className="text-xl font-bold uppercase tracking-widest">No Records Found</p>
                            <p className="text-sm">Try adjusting your filters or searching by a different GR Number.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1 flex flex-col">
                            <table className="w-full text-left border-collapse flex-1">
                                <thead className="sticky top-0 z-10 bg-slate-800 border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">GR No</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Worker Name</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Designation</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Units Marked</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, idx) => (
                                        <tr key={`${row.grNo}-${row.day}-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-bold text-slate-400 text-xs uppercase">
                                                {row.day} {monthNames[month === 0 ? 0 : month - 1]} {year === 0 ? '' : year}
                                                {(month === 0 || year === 0) && " (Entry)"}
                                            </td>
                                            <td className="p-4 font-mono text-sky-400 font-bold">{row.grNo}</td>
                                            <td className="p-4 font-bold text-white group-hover:text-sky-300 transition-colors">{row.name}</td>
                                            <td className="p-4 text-slate-400">{row.designation}</td>
                                            <td className="p-4 text-right">
                                                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                                                    {row.units} Units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Pagination Footer */}
                            <div className="p-6 bg-slate-800/50 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-slate-400 text-sm font-bold order-2 md:order-1">
                                    Showing <span className="text-sky-400">{data.length}</span> of <span className="text-sky-400">{totalElements}</span> entries
                                    <span className="ml-2 text-slate-600">|</span>
                                    <span className="ml-2">Page {page + 1} of {totalPages}</span>
                                </div>
                                
                                <div className="flex gap-2 order-1 md:order-2">
                                    <button 
                                        onClick={handlePrevPage}
                                        disabled={page === 0 || loading}
                                        className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-all text-sm font-black uppercase tracking-widest"
                                    >
                                        &larr; Prev
                                    </button>
                                    <button 
                                        onClick={handleNextPage}
                                        disabled={page >= totalPages - 1 || loading}
                                        className="px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:text-white hover:bg-sky-500 transition-all text-sm font-black uppercase tracking-widest"
                                    >
                                        Next &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WorkerPresencePage;
