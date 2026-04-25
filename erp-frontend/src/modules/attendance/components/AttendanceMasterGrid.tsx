import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { MonthlyMusterRow } from '../types';
import { attendanceService } from '../services/attendanceService';
import { toast } from 'react-hot-toast';

interface AttendanceMasterGridProps {
    month: number;
    year: number;
    initialData: MonthlyMusterRow[];
    onDataChange: (updatedData: MonthlyMusterRow[]) => void;
}

const AttendanceMasterGrid: React.FC<AttendanceMasterGridProps> = ({ 
    month, 
    year, 
    initialData,
    onDataChange 
}) => {
    const [data, setData] = useState<MonthlyMusterRow[]>(initialData);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    
    // Pagination
    const [pageSize] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        setData(initialData);
        setSyncStatus('idle');
    }, [initialData]);

    const daysInMonth = useMemo(() => {
        return new Date(year, month, 0).getDate();
    }, [month, year]);

    const daysArray = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [daysInMonth]);

    const handleCellChange = async (grNo: string, day: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setSyncStatus('saving');
        
        setData(prev => prev.map(row => {
            if (row.grNo === grNo) {
                const newAttendance = { ...row.attendance, [day]: numValue };
                const totalUnits = Object.values(newAttendance).reduce((a, b) => a + b, 0);
                const newTotalSalary = totalUnits * row.salaryPerDay;
                const newClosingBalance = newTotalSalary - row.totalAdvance;

                return { 
                    ...row, 
                    attendance: newAttendance,
                    totalSalary: newTotalSalary,
                    closingBalance: newClosingBalance
                };
            }
            return row;
        }));

        try {
            await attendanceService.saveAttendance({
                grNo,
                month,
                year,
                dailyUpdates: { [day]: numValue }
            });
            setSyncStatus('saved');
            toast.success(`Saved GR No: ${grNo}`, { id: 'save-toast', duration: 1500 });
        } catch (error: any) {
            setSyncStatus('error');
            const errorMsg = error.response?.data || error.message || 'Unknown error';
            toast.error(`Sync Failed for GR No ${grNo}: ${errorMsg}`, { id: 'error-toast' });
        }
    };

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const totalPages = Math.ceil(data.length / pageSize);

    return (
        <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium disabled:opacity-30 hover:bg-white/5 rounded transition-all"
                        >
                            Prev
                        </button>
                        <span className="px-4 py-1 text-sm text-slate-400 border-x border-white/10 font-mono">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium disabled:opacity-30 hover:bg-white/5 rounded transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {syncStatus === 'saving' && (
                        <span className="text-[10px] font-bold text-sky-400 flex items-center gap-2 animate-pulse">
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>
                            SYNCING TABLES...
                        </span>
                    )}
                    {syncStatus === 'saved' && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            DATABASE SYNCED
                        </span>
                    )}
                    {syncStatus === 'error' && (
                        <span className="text-[10px] font-bold text-rose-500 flex items-center gap-2 animate-bounce">
                            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                            SYNC FAILED
                        </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-2 border-l border-white/10 pl-4">
                        AUTO-SAVE ACTIVE
                    </span>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full border-separate border-spacing-0 table-fixed text-[12px]">
                    <thead className="sticky top-0 z-30">
                        <tr className="bg-slate-900 shadow-xl h-12">
                            {/* Sticky Identity Block */}
                            <th className="sticky left-0 z-40 bg-slate-900 p-3 text-left font-bold text-slate-500 uppercase border-r border-b border-white/10 w-[60px] min-w-[60px]">ID</th>
                            <th className="sticky left-[60px] z-40 bg-slate-900 p-3 text-left font-bold text-slate-400 uppercase border-r-2 border-b border-emerald-500/30 w-[160px] min-w-[160px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.7)]">Name</th>
                            
                            {/* Payroll & Bank Info (Scrollable) */}
                            <th className="p-3 text-left font-bold text-slate-500 border-r border-b border-white/5 w-[140px] min-w-[140px] bg-slate-900/50">Bank</th>
                            <th className="p-3 text-left font-bold text-slate-500 border-r border-b border-white/5 w-[160px] min-w-[160px] bg-slate-900/50">Account No</th>
                            <th className="p-3 text-left font-bold text-slate-500 border-r border-b border-white/5 w-[110px] min-w-[110px] bg-slate-900/50">IFSC</th>
                            <th className="p-3 text-center font-bold text-sky-400 border-r border-b border-white/10 bg-slate-900/80 w-[100px] min-w-[100px]">Daily Rate</th>

                            {/* Scrollable Day Columns */}
                            {daysArray.map(day => {
                                const isToday = new Date().getDate() === day && 
                                              new Date().getMonth() + 1 === month && 
                                              new Date().getFullYear() === year;
                                
                                return (
                                    <th key={day} className={`p-2 text-center border-r border-b border-white/10 min-w-[40px] w-[40px] transition-all
                                        ${isToday ? 'bg-sky-500/20 text-sky-400 ring-inset ring-1 ring-sky-500/50' : 'bg-slate-900/50 text-slate-500'}`}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] leading-tight opacity-50 font-medium">
                                                {new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                                            </span>
                                            <span className="text-[13px] font-black">{day}</span>
                                            {isToday && <div className="w-1 h-1 bg-sky-400 rounded-full mt-0.5"></div>}
                                        </div>
                                    </th>
                                );
                            })}
                            
                            {/* Summary Columns (Detailed Advances) */}
                            <th className="p-3 text-right font-bold text-emerald-400 border-r border-b border-white/10 bg-slate-900 w-[110px] min-w-[110px]">Gross Sal.</th>
                            <th className="p-3 text-right font-bold text-amber-600 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Site Adv.</th>
                            <th className="p-3 text-right font-bold text-amber-500 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Online Adv.</th>
                            <th className="p-3 text-right font-bold text-amber-400 border-r border-b border-white/10 bg-slate-900 w-[110px] min-w-[110px]">Total Adv.</th>
                            <th className="p-3 text-right font-bold text-sky-400 border-b border-white/10 bg-slate-900 w-[130px] min-w-[130px]">Debit Bal.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-950">
                        {paginatedData.map((row, idx) => (
                            <tr key={row.grNo} className={`hover:bg-emerald-500/5 transition-colors group h-12 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                                {/* Sticky Identity Block */}
                                <td className="sticky left-0 z-20 bg-slate-950 p-3 text-slate-500 font-mono border-r border-b border-white/10 w-[60px] group-hover:bg-slate-900 transition-colors">{row.grNo}</td>
                                <td className="sticky left-[60px] z-20 bg-slate-950 p-3 font-medium text-slate-200 border-r-2 border-b border-emerald-500/30 w-[160px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.7)] group-hover:bg-slate-900 transition-colors">
                                    <div className="flex flex-col truncate leading-tight">
                                        <span className="truncate text-[13px] font-bold">{row.name}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-medium truncate">{row.designation}</span>
                                    </div>
                                </td>

                                {/* Scrollable Row Data (Read Only) */}
                                <td className="p-3 text-slate-400 border-r border-b border-white/5 w-[140px] truncate text-[11px]">{row.bankName}</td>
                                <td className="p-3 text-slate-400 font-mono border-r border-b border-white/5 w-[160px] text-[11px] truncate">{row.accountNo}</td>
                                <td className="p-3 text-slate-400 font-mono border-r border-b border-white/5 w-[110px] text-[11px] uppercase truncate">{row.ifscCode}</td>
                                
                                <td className="p-3 text-center border-r border-b border-white/10 bg-slate-900/30 w-[100px] text-sky-400 font-black text-[13px]">
                                    ₹{row.salaryPerDay}
                                </td>

                                {/* Attendance Inputs */}
                                {daysArray.map(day => {
                                    const val = row.attendance[day] || 0;
                                    const isToday = new Date().getDate() === day && 
                                                  new Date().getMonth() + 1 === month && 
                                                  new Date().getFullYear() === year;
                                    
                                    return (
                                        <td key={day} className={`border-r border-b border-white/5 p-0 text-center transition-all w-[40px] 
                                            ${val > 0 ? 'bg-emerald-500/10' : ''} 
                                            ${isToday ? 'bg-sky-500/10 ring-inset ring-1 ring-sky-500/30' : ''}`}>
                                            <input 
                                                type="text"
                                                defaultValue={val === 0 ? '' : val}
                                                className={`w-full h-full bg-transparent text-center focus:outline-none transition-all text-[16px] font-black focus:bg-white/10 focus:text-white focus:ring-inset focus:ring-1 focus:ring-emerald-500 ${
                                                    val > 0 ? 'text-emerald-400' : 'text-slate-600'
                                                }`}
                                                placeholder="-"
                                                onBlur={(e) => {
                                                    if (e.target.value !== (val === 0 ? '' : val.toString())) {
                                                        handleCellChange(row.grNo, day, e.target.value);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                                }}
                                            />
                                        </td>
                                    );
                                })}

                                {/* Summaries (Detailed) */}
                                <td className="p-3 text-right text-emerald-400 font-black border-r border-b border-white/10 bg-slate-900/30 w-[110px]">₹{row.totalSalary.toLocaleString()}</td>
                                <td className="p-3 text-right text-amber-600 border-r border-b border-white/10 bg-slate-900/30 w-[100px]">₹{row.siteAdvance.toLocaleString()}</td>
                                <td className="p-3 text-right text-amber-500 border-r border-b border-white/10 bg-slate-900/30 w-[100px]">₹{row.onlineAdvance.toLocaleString()}</td>
                                <td className="p-3 text-right text-amber-400 font-black border-r border-b border-white/10 bg-slate-900/30 w-[110px]">₹{row.totalAdvance.toLocaleString()}</td>
                                <td className="p-3 text-right text-sky-400 font-black border-b border-white/10 bg-slate-900/40 w-[130px] text-[13px]">₹{row.closingBalance.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total Summary Footer */}
            <div className="p-6 bg-slate-950 border-t-2 border-emerald-500/20 flex justify-end gap-16 text-base font-bold">
                <div className="flex flex-col items-end">
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider mb-1">Total Payout</span>
                    <span className="text-slate-200 text-xl font-black">₹{data.reduce((a, b) => a + b.totalSalary, 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end border-l border-white/10 pl-16">
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider mb-1">Total Advances</span>
                    <span className="text-amber-500 text-xl font-black">₹{data.reduce((a, b) => a + b.totalAdvance, 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end border-l border-white/10 pl-16">
                    <span className="text-slate-500 text-[11px] uppercase tracking-wider mb-1">Net Liability</span>
                    <span className="text-sky-400 text-xl font-black">₹{data.reduce((a, b) => a + b.closingBalance, 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMasterGrid;
