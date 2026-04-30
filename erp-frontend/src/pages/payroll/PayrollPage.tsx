import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { attendanceService } from '../../modules/attendance/services/attendanceService';
import type { MonthlyMusterRow, PayrollUpdateRequest } from '../../modules/attendance/types';
import Sidebar from '../../components/common/Sidebar';

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const money = (value: number) => `Rs. ${Math.round(value || 0).toLocaleString()}`;

const totalUnits = (row: MonthlyMusterRow) => {
    return Object.values(row.attendance || {}).reduce((sum, units) => sum + (units || 0), 0);
};

const recalculateRow = (row: MonthlyMusterRow): MonthlyMusterRow => {
    const units = totalUnits(row);
    const grossSalary = units * row.salaryPerDay;
    const totalAdvance = row.siteAdvance + row.onlineAdvance;

    return {
        ...row,
        totalSalary: grossSalary,
        totalAdvance,
        closingBalance: grossSalary - totalAdvance - (row.debitBalance || 0)
    };
};

const PayrollPage: React.FC = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<MonthlyMusterRow[]>([]);
    const [dirtyRows, setDirtyRows] = useState<Record<string, true>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [startingMonth, setStartingMonth] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isPastMonth = useMemo(() => {
        const currentDate = new Date();
        return year < currentDate.getFullYear() || 
               (year === currentDate.getFullYear() && month < currentDate.getMonth() + 1);
    }, [month, year]);

    const isFutureMonth = useMemo(() => {
        const currentDate = new Date();
        return year > currentDate.getFullYear() || 
               (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1);
    }, [month, year]);

    const isEditMode = !isPastMonth && window.location.hash.startsWith('#payroll/edit');
    const pageSize = 100;

    // Force URL update if trying to edit past month
    useEffect(() => {
        if (isPastMonth && window.location.hash.startsWith('#payroll/edit')) {
            window.location.hash = '#payroll';
        }
    }, [isPastMonth]);

    useEffect(() => {
        loadPayroll();
    }, [month, year]);

    const loadPayroll = async () => {
        setLoading(true);
        try {
            const rows = await attendanceService.getMonthlyMuster(month, year);
            setData(rows.map(recalculateRow));
            setDirtyRows({});
            setCurrentPage(1);
        } catch (error) {
            toast.error('Failed to load payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleStartMonth = async () => {
        setStartingMonth(true);
        try {
            await attendanceService.startMonth(month, year);
            toast.success(`Payroll started for ${monthNames[month - 1]}`);
            loadPayroll();
        } catch (error) {
            toast.error('Failed to start month');
        } finally {
            setStartingMonth(false);
        }
    };

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => a.grNo.localeCompare(b.grNo, undefined, { numeric: true, sensitivity: 'base' }));
    }, [data]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage]);

    const groupedData = useMemo(() => {
        const groups: Record<string, MonthlyMusterRow[]> = {};
        paginatedData.forEach(row => {
            const designation = row.designation || 'Other';
            if (!groups[designation]) groups[designation] = [];
            groups[designation].push(row);
        });
        return groups;
    }, [paginatedData]);

    const designations = useMemo(() => Object.keys(groupedData).sort(), [groupedData]);
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

    const scrollToSection = (designation: string) => {
        const element = document.getElementById(`section-${designation}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const totals = useMemo(() => {
        return data.reduce(
            (acc, row) => ({
                gross: acc.gross + row.totalSalary,
                advances: acc.advances + row.totalAdvance,
                net: acc.net + row.closingBalance,
                debit: acc.debit + row.debitBalance
            }),
            { gross: 0, advances: 0, net: 0, debit: 0 }
        );
    }, [data]);

    const updatePayrollField = (grNo: string, field: 'salaryPerDay' | 'siteAdvance' | 'onlineAdvance' | 'debitBalance', value: string) => {
        const numberValue = parseFloat(value) || 0;

        setData(prev => prev.map(row => {
            if (row.grNo !== grNo) return row;
            return recalculateRow({ ...row, [field]: numberValue });
        }));

        setDirtyRows(prev => ({ ...prev, [grNo]: true }));
    };

    const savePayroll = async () => {
        const requests: PayrollUpdateRequest[] = data
            .filter(row => dirtyRows[row.grNo])
            .map(row => ({
                grNo: row.grNo,
                month,
                year,
                rate: row.salaryPerDay,
                siteAdvance: row.siteAdvance,
                onlineAdvance: row.onlineAdvance,
                debitBalance: row.debitBalance
            }));

        if (requests.length === 0) {
            toast.success('No payroll changes to save');
            return;
        }

        setSaving(true);
        try {
            await attendanceService.updatePayrollBatch(requests);
            setDirtyRows({});
            toast.success(`Saved payroll for ${requests.length} workers`);
            await loadPayroll();
        } catch (error) {
            toast.error('Failed to save payroll');
        } finally {
            setSaving(false);
        }
    };

    const renderTableHeader = () => (
        <thead className="sticky top-0 z-40">
            <tr className="bg-slate-900 border-b border-white/10 h-12">
                <th className="sticky left-0 z-30 bg-slate-900 p-3 text-left font-bold text-slate-400 uppercase border-r border-b border-white/10 w-[70px] min-w-[70px]">GR No</th>
                <th className="sticky left-[70px] z-30 bg-slate-900 p-3 text-left font-bold text-slate-400 uppercase border-r-2 border-b border-emerald-500/30 w-[190px] min-w-[190px]">Name</th>
                <th className="p-3 text-left font-bold text-slate-500 border-r border-b border-white/5 w-[150px] min-w-[150px]">Designation</th>
                <th className="p-3 text-left font-bold text-sky-200 border-r border-b border-white/5 w-[150px] min-w-[150px] bg-slate-900/50">Bank</th>
                <th className="p-3 text-left font-bold text-indigo-200 border-r border-b border-white/5 w-[120px] min-w-[120px] bg-slate-900/50">IFSC</th>
                <th className="p-3 text-right font-bold text-sky-400 border-r border-b border-white/10 w-[100px] min-w-[100px]">Units</th>
                <th className="p-3 text-right font-bold text-sky-400 border-r border-b border-white/10 w-[120px] min-w-[120px]">Rate</th>
                <th className="p-3 text-right font-bold text-emerald-400 border-r border-b border-white/10 w-[130px] min-w-[130px]">Gross</th>
                <th className="p-3 text-right font-bold text-rose-400 border-r border-b border-white/10 w-[130px] min-w-[130px]">Site Adv.</th>
                <th className="p-3 text-right font-bold text-amber-400 border-r border-b border-white/10 w-[130px] min-w-[130px]">Online Adv.</th>
                <th className="p-3 text-right font-bold text-orange-400 border-r border-b border-white/10 w-[130px] min-w-[130px]">Total Adv.</th>
                <th className="p-3 text-right font-bold text-cyan-400 border-r border-b border-white/10 w-[130px] min-w-[130px]">Debit Bal.</th>
                <th className="p-3 text-right font-bold text-white border-b border-white/10 w-[140px] min-w-[140px]">Net Balance</th>
            </tr>
        </thead>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col gap-4 overflow-hidden">
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar currentPage="payroll" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
                            aria-label="Open menu"
                        >
                            <span className="flex flex-col gap-[6px] items-center">
                                <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                <span className="block h-[3px] w-4 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                                <span className="block h-[3px] w-6 bg-current rounded-full group-hover:w-6 transition-all duration-300"></span>
                            </span>
                        </button>
                        <a href="#dashboard" className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-slate-500 group-hover:text-white group-hover:bg-sky-600 transition-colors">
                                &lt;
                            </span>
                            Dashboard
                        </a>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-outfit text-white tracking-tight">
                            {isEditMode ? 'Edit Payroll' : 'Payroll'}
                        </h1>
                        <p className="text-slate-400 mt-1">{monthNames[month - 1]} {year}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-transparent text-sm font-bold p-2 focus:outline-none">
                            {monthNames.map((name, index) => (
                                <option key={name} value={index + 1} className="bg-slate-900">{name}</option>
                            ))}
                        </select>
                        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent text-sm font-bold p-2 border-l border-white/10 focus:outline-none">
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="bg-slate-900">{y}</option>
                            ))}
                        </select>
                    </div>

                    {isEditMode ? (
                        <>
                            <a href="#payroll" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-colors">
                                View Payroll
                            </a>
                            <button
                                onClick={savePayroll}
                                disabled={saving}
                                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Payroll'}
                            </button>
                        </>
                    ) : (
                        !isPastMonth && (
                            <a href="#payroll/edit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors">
                                Edit Payroll
                            </a>
                        )
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gross Salary</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{money(totals.gross)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Advance</div>
                    <div className="text-2xl font-black text-orange-400 mt-1">{money(totals.advances)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Net Balance</div>
                    <div className="text-2xl font-black text-white mt-1">{money(totals.net)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Debit Balance</div>
                    <div className="text-2xl font-black text-cyan-400 mt-1">{money(totals.debit)}</div>
                </div>
            </div>

            <div className="flex-shrink-0 border border-white/10 rounded-lg bg-slate-900/80 flex flex-col divide-y divide-white/5">
                <div className="flex items-center justify-between p-3">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                        {data.length} Workers - {Object.keys(dirtyRows).length} Edited
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold">
                            Prev
                        </button>
                        <span className="text-sm text-slate-400 font-mono px-2">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold">
                            Next
                        </button>
                    </div>
                </div>

                {/* Designation Quick Jump */}
                <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
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

            <div className="flex-1 min-h-[480px] overflow-y-auto overflow-x-hidden custom-scrollbar border border-white/10 rounded-lg bg-slate-950">
                {loading ? (
                    <div className="h-full min-h-[480px] flex items-center justify-center text-sky-400 font-bold">Loading Payroll...</div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[480px] bg-white/5 border border-dashed border-white/10 rounded-2xl gap-4">
                        <div className="text-6xl">💰</div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">No Payroll Records for {monthNames[month - 1]} {year}</h3>
                            <p className="text-slate-500">
                                {isPastMonth 
                                    ? "There is no historical payroll data for this month."
                                    : isFutureMonth
                                        ? `You cannot start payroll for future months. Please wait until ${monthNames[month - 1]} to start.`
                                        : "Payroll for this month hasn't been started yet."}
                            </p>
                        </div>
                        {!isPastMonth && !isFutureMonth && (
                            <button 
                                onClick={handleStartMonth}
                                disabled={startingMonth}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {startingMonth ? 'Starting...' : `Start Payroll for ${monthNames[month - 1]}`}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="w-full">
                        {designations.map(designation => {
                            const rows = groupedData[designation];
                            return (
                                <div key={designation} id={`section-${designation}`} className="mb-10 w-full overflow-x-auto custom-scrollbar">
                                    <div className="sticky left-0 z-30 bg-slate-900/90 border-y border-white/10 px-5 py-3">
                                        <div className="flex items-center justify-between min-w-[900px]">
                                            <div>
                                                <div className="text-[10px] text-sky-500 font-black uppercase tracking-[0.3em]">Designation Block</div>
                                                <div className="text-xl font-black text-white uppercase">{designation}</div>
                                            </div>
                                            <div className="text-right pr-6">
                                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{rows.length} Workers</div>
                                                <div className="text-lg font-black text-emerald-400">{money(rows.reduce((sum, row) => sum + row.totalSalary, 0))}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <table className="min-w-max border-separate border-spacing-0 table-fixed text-[12px]">
                                        {renderTableHeader()}
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={row.grNo} className={`h-12 transition-colors group ${index % 2 === 0 ? 'bg-white/[0.01]' : ''} ${row.isActive === false ? 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0' : 'hover:bg-emerald-500/5'}`}>
                                                    <td className="sticky left-0 z-20 bg-slate-950 p-3 text-slate-500 font-mono border-r border-b border-white/5 w-[70px]">{row.grNo}</td>
                                                    <td className="sticky left-[70px] z-20 bg-slate-950 p-3 border-r-2 border-b border-emerald-500/30 w-[190px]">
                                                        <div className="font-bold text-slate-100 truncate">{row.name}</div>
                                                    </td>
                                                    <td className="p-3 text-slate-400 border-r border-b border-white/5 w-[150px] truncate">{row.designation}</td>
                                                    <td className="p-3 text-sky-200 font-semibold text-[12px] border-r border-b border-white/5 w-[150px] truncate">{row.bankName}</td>
                                                    <td className="p-3 text-indigo-200 font-bold font-mono tracking-wider text-[12px] border-r border-b border-white/5 w-[120px] truncate uppercase bg-indigo-900/10">{row.ifscCode}</td>
                                                    <td className="p-3 text-right text-sky-400 font-black border-r border-b border-white/10 w-[100px]">{totalUnits(row)}</td>
                                                    <td className="p-2 text-right border-r border-b border-white/10 w-[120px]">
                                                        {isEditMode ? (
                                                            <input value={row.salaryPerDay || ''} onChange={(event) => updatePayrollField(row.grNo, 'salaryPerDay', event.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-sky-300 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500" />
                                                        ) : (
                                                            <span className="font-black text-sky-400">{money(row.salaryPerDay)}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right text-emerald-400 font-black border-r border-b border-white/10 w-[130px]">{money(row.totalSalary)}</td>
                                                    <td className="p-2 text-right border-r border-b border-white/10 w-[130px]">
                                                        {isEditMode ? (
                                                            <input value={row.siteAdvance || ''} onChange={(event) => updatePayrollField(row.grNo, 'siteAdvance', event.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-rose-300 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500" />
                                                        ) : (
                                                            <span className="font-bold text-rose-400">{money(row.siteAdvance)}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2 text-right border-r border-b border-white/10 w-[130px]">
                                                        {isEditMode ? (
                                                            <input value={row.onlineAdvance || ''} onChange={(event) => updatePayrollField(row.grNo, 'onlineAdvance', event.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                                        ) : (
                                                            <span className="font-bold text-amber-400">{money(row.onlineAdvance)}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right text-orange-400 font-black border-r border-b border-white/10 w-[130px]">{money(row.totalAdvance)}</td>
                                                    <td className="p-2 text-right border-r border-b border-white/10 w-[130px]">
                                                        {isEditMode ? (
                                                            <input value={row.debitBalance || ''} onChange={(event) => updatePayrollField(row.grNo, 'debitBalance', event.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-cyan-300 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                                                        ) : (
                                                            <span className="font-black text-cyan-400">{money(row.debitBalance)}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right text-white font-black border-b border-white/10 w-[140px] bg-emerald-600/10">{money(row.closingBalance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollPage;
