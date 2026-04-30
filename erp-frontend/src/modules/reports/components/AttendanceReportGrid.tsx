import React, { useMemo, useState } from 'react';
import { type MusterRow } from '../types';
import { exportAttendanceToExcel } from '../utils/attendanceExport';

interface AttendanceReportGridProps {
    data: MusterRow[];
    month: number;
    year: number;
    filterDesignation: string;
    onDesignationChange: (designation: string) => void;
}

const AttendanceReportGrid: React.FC<AttendanceReportGridProps> = ({ 
    data, 
    month, 
    year, 
    filterDesignation,
    onDesignationChange
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // Reset to page 1 when filter or data changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterDesignation, data]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const designations = useMemo(() => 
        Array.from(new Set(data.map(d => d.designation))).sort(), 
    [data]);

    const filteredData = useMemo(() => 
        data
            .filter(row => filterDesignation === 'All' || row.designation === filterDesignation)
            .sort((a, b) => a.grNo.localeCompare(b.grNo, undefined, { numeric: true, sensitivity: 'base' })),
    [data, filterDesignation]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const groupedData = useMemo(() => {
        const groups: Record<string, MusterRow[]> = {};
        paginatedData.forEach(row => {
            const desig = row.designation || 'Other';
            if (!groups[desig]) groups[desig] = [];
            groups[desig].push(row);
        });
        return groups;
    }, [paginatedData]);

    const visibleDesignations = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

    const getTotalUnits = (attendance: Record<number, number>) => {
        return Object.values(attendance || {}).reduce((sum, val) => sum + (val || 0), 0);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Designation Quick Jump & Export */}
            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 whitespace-nowrap">Jump To:</span>
                    {designations.map(desig => (
                        <button
                            key={desig}
                            onClick={() => {
                                onDesignationChange(desig);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all whitespace-nowrap uppercase tracking-wider ${filterDesignation === desig ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                        >
                            {desig}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => exportAttendanceToExcel(filteredData, monthNames[month - 1], year, daysArray)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest whitespace-nowrap"
                >
                    📊 Export
                </button>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[70vh]">
                <div className="overflow-auto custom-scrollbar flex-1 relative">
                    {visibleDesignations.map((desig) => {
                        const rows = groupedData[desig];
                        const sectionGross = rows.reduce((sum, r) => sum + (r.totalSalary || 0), 0);
                        const sectionNet = rows.reduce((sum, r) => sum + (r.closingBalance || 0), 0);

                        return (
                            <div key={desig} className="mb-8 last:mb-0">
                                {/* Section Header - Double Sticky (Top & Left) */}
                                <div className="sticky top-0 left-0 z-40 bg-slate-800/95 backdrop-blur-md border-y border-white/10 px-4 py-3 flex justify-between items-center shadow-md min-w-full">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                            {desig}
                                            <span className="bg-indigo-500/20 px-2 py-0.5 rounded-full text-[10px] text-indigo-400 font-black border border-indigo-500/20">
                                                {rows.length} Workers
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Gross</span>
                                            <span className="text-xs font-black text-white">₹{sectionGross.toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block text-rose-400/70">Total Adv</span>
                                            <span className="text-xs font-black text-rose-400">₹{rows.reduce((s, r) => s + (r.totalAdvance || 0), 0).toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block text-indigo-400/70">Net Owed</span>
                                            <span className="text-xs font-black text-indigo-400">₹{sectionNet.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-[10px] uppercase bg-slate-900/50 text-slate-500 border-b border-white/5">
                                        <tr>
                                            <th className="px-4 py-2 font-bold sticky left-0 bg-slate-900/90 backdrop-blur z-30 border-r border-white/5 min-w-[180px]">Worker Details</th>
                                            <th className="px-4 py-2 text-center border-r border-white/5 w-20 sticky left-[180px] bg-slate-900/90 backdrop-blur z-30 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Rate</th>
                                            <th className="px-4 py-2 text-left w-32 border-l border-white/5">Bank Name</th>
                                            <th className="px-4 py-2 text-left w-40">Account No</th>
                                            <th className="px-4 py-2 text-left w-24 border-r border-white/5">IFSC</th>
                                            {daysArray.map(day => (
                                                <th key={day} className="px-1 py-2 text-center min-w-[30px]">{day}</th>
                                            ))}
                                            <th className="px-4 py-2 text-center border-l border-white/5 text-indigo-400 font-black w-16">Total</th>
                                            <th className="px-4 py-2 text-right border-l border-white/5 w-24">Gross</th>
                                            <th className="px-4 py-2 text-right w-20 text-rose-400">Site Adv</th>
                                            <th className="px-4 py-2 text-right w-20 text-rose-400">Online Adv</th>
                                            <th className="px-4 py-2 text-right w-20 text-rose-400 font-black">Total Adv</th>
                                            <th className="px-4 py-2 text-right w-20 text-orange-400">Debit</th>
                                            <th className="px-4 py-2 text-right w-24 text-emerald-400 font-black">Net Pay</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {rows.map((row) => (
                                            <tr key={row.grNo} className={`hover:bg-slate-800/30 transition-colors ${!row.isActive ? 'opacity-40 grayscale' : ''}`}>
                                                <td className="px-4 py-2 sticky left-0 bg-slate-900/95 border-r border-white/5 z-10">
                                                    <div className="font-bold text-white text-xs whitespace-nowrap">{row.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">{row.grNo}</div>
                                                </td>
                                                <td className="px-4 py-2 text-center border-r border-white/5 font-black text-sky-400 text-xs bg-sky-900/40 sticky left-[180px] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                                                    ₹{row.salaryPerDay}
                                                </td>
                                                <td className="px-4 py-2 text-left text-sky-400/80 text-[10px] border-l border-white/5 truncate max-w-[120px] font-medium" title={row.bankName}>
                                                    {row.bankName || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-left text-sky-300 font-mono text-[10px] tracking-wider font-bold">
                                                    {row.accountNo || '-'}
                                                </td>
                                                <td className="px-4 py-2 text-left text-sky-300 font-mono text-[10px] border-r border-white/5">
                                                    {row.ifscCode || '-'}
                                                </td>
                                                {daysArray.map(day => {
                                                    const unit = row.attendance && row.attendance[day];
                                                    return (
                                                        <td key={day} className="px-1 py-2 text-center text-[10px]">
                                                            {unit ? (
                                                                <span className={`px-1 rounded font-bold ${unit === 1 ? 'text-emerald-400' : unit === 0.5 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                                    {unit}
                                                                </span>
                                                            ) : <span className="text-slate-700 opacity-30">.</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-2 text-center border-l border-white/5 font-black text-indigo-400 bg-indigo-500/5 text-xs">
                                                    {getTotalUnits(row.attendance)}
                                                </td>
                                                <td className="px-4 py-2 text-right border-l border-white/5 font-mono text-slate-300 text-xs">
                                                    ₹{row.totalSalary?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-rose-400 text-xs">
                                                    ₹{row.siteAdvance?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-rose-400 text-xs">
                                                    ₹{row.onlineAdvance?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-rose-500 text-xs font-black">
                                                    ₹{row.totalAdvance?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-orange-400 text-xs">
                                                    ₹{row.debitBalance?.toLocaleString() || 0}
                                                </td>
                                                <td className="px-4 py-2 text-right font-mono text-emerald-400 font-black bg-emerald-500/5 text-xs">
                                                    ₹{row.closingBalance?.toLocaleString() || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="bg-slate-800/50 border-t border-white/10 p-4 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Showing <span className="text-white font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-white font-bold">{filteredData.length}</span> workers
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                &larr; Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/5'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceReportGrid;
