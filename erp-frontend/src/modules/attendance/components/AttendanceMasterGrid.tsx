import { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { MonthlyMusterRow } from '../types';
import { attendanceService } from '../services/attendanceService';
import { toast } from 'react-hot-toast';

interface AttendanceMasterGridProps {
    month: number;
    year: number;
    initialData: MonthlyMusterRow[];
    isEditMode: boolean;
    onDataChange: (updatedData: MonthlyMusterRow[]) => void;
}

export interface AttendanceMasterGridHandle {
    saveAllChanges: () => Promise<void>;
}

const GridInput = ({ 
    initialValue, 
    isEditMode, 
    onChange 
}: { 
    initialValue: number; 
    isEditMode: boolean; 
    onChange: (val: string) => void;
}) => {
    const [localValue, setLocalValue] = useState(initialValue === 0 ? '' : initialValue.toString());

    // Sync with external changes (like month switches)
    useEffect(() => {
        setLocalValue(initialValue === 0 ? '' : initialValue.toString());
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(val)) {
            setLocalValue(val);
            const initialStr = initialValue === 0 ? '' : initialValue.toString();
            // If the user typed '0' specifically, or changed the value, trigger onChange
            if (val !== initialStr || (val === '0' && initialValue === 0)) {
                if (val !== '' && !val.endsWith('.')) {
                    onChange(val);
                } else if (val === '') {
                    onChange('0');
                }
            }
        }
    };

    const handleBlur = () => {
        const initialStr = initialValue === 0 ? '' : initialValue.toString();
        if (localValue !== initialStr) {
            const numVal = parseFloat(localValue) || 0;
            const fixed = numVal.toString();
            setLocalValue(fixed); // Keep the '0' if they typed it
            onChange(fixed);
        }
    };

    return (
        <input 
            type="text"
            value={localValue}
            readOnly={!isEditMode}
            className={`w-full h-full bg-transparent text-center focus:outline-none transition-all text-[16px] font-black ${
                isEditMode ? 'focus:bg-white/10 focus:text-white focus:ring-inset focus:ring-1 focus:ring-emerald-500 cursor-text' : 'cursor-default'
            } ${
                parseFloat(localValue) > 0 ? 'text-emerald-400' : 'text-slate-600'
            }`}
            placeholder="-"
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
        />
    );
};

const AttendanceMasterGrid = forwardRef<AttendanceMasterGridHandle, AttendanceMasterGridProps>(({ 
    month, 
    year, 
    initialData,
    isEditMode,
    onDataChange 
}, ref) => {
    const [data, setData] = useState<MonthlyMusterRow[]>(initialData);
    const [dirtyUpdates, setDirtyUpdates] = useState<Record<string, Record<number, number>>>({});
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Pagination
    const [pageSize] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        setData(initialData);
        setDirtyUpdates({});
        setSyncStatus('idle');
    }, [initialData]);

    const daysInMonth = useMemo(() => {
        return new Date(year, month, 0).getDate();
    }, [month, year]);

    const daysArray = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [daysInMonth]);

    const handleCellChange = (grNo: string, day: number, value: string) => {
        if (!isEditMode) return;

        const numValue = parseFloat(value) || 0;
        
        setData(prev => prev.map(row => {
            if (row.grNo === grNo) {
                const newAttendance = { ...row.attendance, [day]: numValue };
                const totalUnits = Object.values(newAttendance).reduce((a, b) => a + b, 0);
                const newTotalSalary = totalUnits * row.salaryPerDay;
                const totalAdvance = row.siteAdvance + row.onlineAdvance;
                const newClosingBalance = newTotalSalary - totalAdvance - (row.debitBalance || 0);

                return { 
                    ...row, 
                    attendance: newAttendance,
                    totalSalary: newTotalSalary,
                    totalAdvance,
                    closingBalance: newClosingBalance
                };
            }
            return row;
        }));

        setDirtyUpdates(prev => ({
            ...prev,
            [grNo]: {
                ...(prev[grNo] || {}),
                [day]: numValue
            }
        }));
        
        setSyncStatus('idle');
    };

    const handleSaveAll = async () => {
        setSyncStatus('saving');
        
        try {
            const requests = Object.entries(dirtyUpdates).map(([grNo, dailyUpdates]) => ({
                grNo,
                month,
                year,
                dailyUpdates
            }));
            
            if (requests.length === 0) {
                setSyncStatus('saved');
                toast.success('No attendance changes to save', { id: 'save-toast', duration: 2000 });
                return;
            }

            await attendanceService.saveBatchAttendance(requests);
            
            setDirtyUpdates({});
            setSyncStatus('saved');
            onDataChange(data);
            toast.success(`Saved ${requests.length} laborer's attendance`, { id: 'save-toast', duration: 2000 });
        } catch (error: any) {
            setSyncStatus('error');
            const errorMsg = error.response?.data || error.message || 'Unknown error';
            toast.error(`Save Failed: ${errorMsg}`, { id: 'error-toast' });
        }
    };

    useImperativeHandle(ref, () => ({
        saveAllChanges: handleSaveAll
    }));

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => a.grNo.localeCompare(b.grNo, undefined, { numeric: true, sensitivity: 'base' }));
    }, [data]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(data.length / pageSize);

    const groupedData = useMemo(() => {
        const groups: Record<string, MonthlyMusterRow[]> = {};
        paginatedData.forEach(row => {
            const desig = row.designation || 'Other';
            if (!groups[desig]) groups[desig] = [];
            groups[desig].push(row);
        });
        return groups;
    }, [paginatedData]);

    const designations = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);

    const scrollToSection = (desig: string) => {
        const element = document.getElementById(`section-${desig}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderHeader = (isSticky = true) => (
        <thead className={isSticky ? "sticky top-0 z-50 shadow-2xl" : ""}>
            <tr className="bg-slate-900 border-b border-white/10 h-12">
                <th className="sticky left-0 z-40 bg-slate-900 p-3 text-left font-bold text-slate-400 uppercase border-r border-b border-white/10 w-[60px] min-w-[60px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.7)]">ID</th>
                <th className="sticky left-[60px] z-40 bg-slate-900 p-3 text-left font-bold text-slate-400 uppercase border-r-2 border-b border-emerald-500/30 w-[160px] min-w-[160px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.7)]">Name</th>
                
                <th className="p-3 text-left font-bold text-sky-200 border-r border-b border-white/5 w-[140px] min-w-[140px] bg-slate-900/50">Bank</th>
                <th className="p-3 text-left font-bold text-cyan-200 border-r border-b border-white/5 w-[160px] min-w-[160px] bg-slate-900/50">Account No</th>
                <th className="p-3 text-left font-bold text-indigo-200 border-r border-b border-white/5 w-[110px] min-w-[110px] bg-slate-900/50">IFSC</th>
                <th className="p-3 text-center font-bold text-sky-400 border-r border-b border-white/10 bg-slate-900/80 w-[100px] min-w-[100px]">Daily Rate</th>

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
                
                <th className="p-3 text-center font-bold text-purple-400 border-r border-b border-white/10 bg-slate-900/80 w-[100px] min-w-[100px]">Total Units</th>
                <th className="p-3 text-right font-bold text-emerald-400 border-r border-b border-white/10 bg-slate-900 w-[110px] min-w-[110px]">Gross Sal.</th>
                <th className="p-3 text-right font-bold text-rose-400 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Site Adv.</th>
                <th className="p-3 text-right font-bold text-amber-400 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Online Adv.</th>
                <th className="p-3 text-right font-bold text-orange-400 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Total Adv.</th>
                <th className="p-3 text-right font-bold text-cyan-400 border-r border-b border-white/10 bg-slate-900 w-[100px] min-w-[100px]">Debit Bal.</th>
                <th className="p-3 text-right font-bold text-white border-r border-b border-white/10 bg-emerald-600/20 w-[120px] min-w-[120px]">Closing Bal.</th>
                <th className="p-3 text-left font-bold text-slate-400 border-b border-white/10 bg-slate-900 w-[150px] min-w-[150px]">Remark</th>
            </tr>
        </thead>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
            {/* Top Toolbar: Pagination & Save Button */}
            <div className="flex-shrink-0 border-b border-white/10 flex flex-col gap-2 bg-slate-900/80 backdrop-blur-xl">
                {/* First Row: Pagination + Save Button */}
                <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-medium disabled:opacity-30 hover:bg-white/5 rounded transition-all"
                            >Prev</button>
                            <span className="px-4 py-1 text-sm text-slate-400 border-x border-white/10 font-mono">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm font-medium disabled:opacity-30 hover:bg-white/5 rounded transition-all"
                            >Next</button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 border-l border-white/10 pl-4 uppercase tracking-widest">
                            {data.length} Laborers
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {syncStatus === 'saving' && <span className="text-[10px] font-bold text-sky-400 animate-pulse">SAVING...</span>}
                        {syncStatus === 'saved' && <span className="text-[10px] font-bold text-emerald-400">CHANGES SAVED</span>}
                        {syncStatus === 'error' && <span className="text-[10px] font-bold text-rose-400">SAVE FAILED</span>}
                    </div>
                </div>

                {/* Designation Quick Jump */}
                <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar border-t border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 whitespace-nowrap">Jump To:</span>
                    {designations.map(desig => (
                        <button
                            key={desig}
                            onClick={() => scrollToSection(desig)}
                            className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/30 transition-all whitespace-nowrap uppercase tracking-wider"
                        >
                            {desig}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Container */}
            {/* Main Grid Section - Only vertical scroll now */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative bg-slate-950 pb-20">
                <div className="w-full">
                    {designations.map((desig) => {
                        const rows = groupedData[desig];
                        const sectionGross = rows.reduce((sum, r) => sum + r.totalSalary, 0);
                        const sectionAdvance = rows.reduce((sum, r) => sum + (r.siteAdvance + r.onlineAdvance), 0);
                        const sectionBalance = rows.reduce((sum, r) => sum + r.closingBalance, 0);

                        return (
                            <div key={desig} id={`section-${desig}`} className="mb-20 w-full overflow-x-auto custom-scrollbar">
                                {/* Large Section Banner */}
                                <div className="sticky top-0 z-40 w-full mb-2">
                                    <div className="sticky left-0 bg-gradient-to-r from-sky-900/40 to-slate-950/95 backdrop-blur-md border-y border-white/10 px-4 py-2 flex justify-between items-center w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] min-w-[900px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.22em]">Designation Block</span>
                                                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-3 leading-tight">
                                                    {desig}
                                                    <span className="bg-sky-500/20 px-2 py-0.5 rounded-full text-[10px] text-sky-400 font-black border border-sky-500/20">
                                                        {rows.length} Workers
                                                    </span>
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 pr-6">
                                            <div className="text-right">
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Section Gross</div>
                                                <div className="text-sm font-black text-emerald-400">₹{sectionGross.toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Advance</div>
                                                <div className="text-sm font-black text-orange-400">₹{sectionAdvance.toLocaleString()}</div>
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-right">
                                                <div className="text-[9px] text-emerald-500/70 font-black uppercase text-center tracking-widest">Total Net Owed</div>
                                                <div className="text-base font-black text-white leading-tight">₹{sectionBalance.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <table className="min-w-max border-separate border-spacing-0 table-fixed text-[12px]">
                                    {/* Repeat Header for every designation group */}
                                    {renderHeader(false)}
                                    <tbody className="bg-slate-950">
                                        {rows.map((row, idx) => (
                                            <tr key={row.grNo} className={`transition-colors group h-9 ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''} ${row.isActive === false ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : 'hover:bg-emerald-500/5'}`}>
                                                <td className="sticky left-0 z-10 bg-slate-950 px-3 py-1.5 text-slate-500 font-mono border-r border-b border-white/5 w-[60px] group-hover:bg-slate-900 transition-colors">{row.grNo}</td>
                                                <td className="sticky left-[60px] z-10 bg-slate-950 px-3 py-1.5 font-medium text-slate-200 border-r-2 border-b border-emerald-500/30 w-[160px] shadow-[4px_0_12px_-2px_rgba(0,0,0,0.7)] group-hover:bg-slate-900 transition-colors">
                                                    <div className="flex flex-col truncate leading-tight">
                                                        <span className="truncate text-[13px] font-bold">{row.name}</span>
                                                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">{row.designation}</span>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-1.5 text-sky-200 font-semibold border-r border-b border-white/5 w-[140px] truncate text-[12px]">{row.bankName}</td>
                                                <td className="px-3 py-1.5 text-cyan-200 font-bold font-mono tracking-wide border-r border-b border-white/5 w-[160px] text-[12px] truncate bg-cyan-900/10">{row.accountNo}</td>
                                                <td className="px-3 py-1.5 text-indigo-200 font-bold font-mono tracking-wider border-r border-b border-white/5 w-[110px] text-[12px] uppercase truncate bg-indigo-900/10">{row.ifscCode}</td>
                                                
                                                <td className="px-3 py-1.5 text-center border-r border-b border-white/10 bg-slate-900/30 w-[100px] text-sky-400 font-black text-[13px]">
                                                    ₹{row.salaryPerDay}
                                                </td>

                                                {daysArray.map(day => {
                                                    const val = row.attendance[day] || 0;
                                                    const isToday = new Date().getDate() === day && 
                                                                  new Date().getMonth() + 1 === month && 
                                                                  new Date().getFullYear() === year;
                                                    
                                                    return (
                                                        <td key={day} className={`border-r border-b border-white/5 p-0 text-center transition-all w-[40px] 
                                                            ${val > 0 ? 'bg-emerald-500/10' : ''} 
                                                            ${isToday ? 'bg-sky-500/10 ring-inset ring-1 ring-sky-500/30' : ''}`}>
                                                            <GridInput 
                                                                initialValue={val}
                                                                isEditMode={isEditMode}
                                                                onChange={(newVal) => handleCellChange(row.grNo, day, newVal)}
                                                            />
                                                        </td>
                                                    );
                                                })}

                                                <td className="px-3 py-1.5 text-center font-black text-purple-400 border-r border-b border-white/10 w-[100px] bg-purple-500/5 text-[13px]">{Object.values(row.attendance).reduce((a, b) => a + b, 0)}</td>
                                                <td className="px-3 py-1.5 text-right font-black text-emerald-400 border-r border-b border-white/10 w-[110px] bg-emerald-500/5">₹{row.totalSalary.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right font-bold text-rose-400/70 border-r border-b border-white/10 w-[100px] text-[11px]">₹{row.siteAdvance.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right font-bold text-amber-400/70 border-r border-b border-white/10 w-[100px] text-[11px]">₹{row.onlineAdvance.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right font-bold text-orange-400 border-r border-b border-white/10 w-[100px] bg-orange-500/10 text-[12px]">₹{row.totalAdvance.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right font-bold text-cyan-400 border-r border-b border-white/10 w-[100px] bg-cyan-500/10 text-[12px]">₹{row.debitBalance.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right font-black text-white border-r border-b border-white/10 w-[120px] bg-emerald-600/10 text-[14px]">₹{row.closingBalance.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-left border-b border-white/10 w-[150px] bg-slate-900/20">
                                                    <span className="text-slate-500 italic text-[11px] truncate block w-full" title={row.remarks || ''}>
                                                        {row.remarks || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default AttendanceMasterGrid;
