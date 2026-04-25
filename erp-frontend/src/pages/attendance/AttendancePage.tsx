import React, { useState, useEffect, useRef } from 'react';
import AttendanceMasterGrid, { type AttendanceMasterGridHandle } from '../../modules/attendance/components/AttendanceMasterGrid';
import { attendanceService } from '../../modules/attendance/services/attendanceService';
import type { MonthlyMusterRow } from '../../modules/attendance/types';
import { toast } from 'react-hot-toast';

const AttendancePage: React.FC = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<MonthlyMusterRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery] = useState('');
    const gridRef = useRef<AttendanceMasterGridHandle>(null);
    const isEditMode = window.location.hash.startsWith('#attendance/edit');

    useEffect(() => {
        loadMuster();
    }, [month, year]);

    const loadMuster = async () => {
        setLoading(true);
        try {
            const muster = await attendanceService.getMonthlyMuster(month, year);
            setData(muster);
        } catch (error) {
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(row => 
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.grNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col gap-4 md:gap-8 overflow-hidden">
            {/* Header Area */}
            <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                <div className="flex flex-col gap-4">
                    <a 
                        href="#dashboard" 
                        className="group flex items-center gap-2 w-fit px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold"
                    >
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-slate-500 group-hover:text-white group-hover:bg-sky-600 transition-colors">
                            &lt;
                        </span>
                        Dashboard
                    </a>
                    <h1 className="text-4xl font-black font-outfit text-white tracking-tight flex items-center gap-3">
                        {isEditMode ? 'Edit Attendance' : 'Attendance Muster'}
                        <span className="px-3 py-1 text-xs rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30 uppercase tracking-widest">Live</span>
                    </h1>
                    <p className="text-slate-400">
                        {isEditMode ? 'Update daily hours for the selected month.' : 'Review daily hours and payroll balances.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-transparent text-sm font-bold p-2 focus:outline-none"
                        >
                            {monthNames.map((name, i) => (
                                <option key={name} value={i + 1} className="bg-slate-900">{name}</option>
                            ))}
                        </select>
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-transparent text-sm font-bold p-2 border-l border-white/10 focus:outline-none"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y} className="bg-slate-900">{y}</option>
                            ))}
                        </select>
                    </div>

                    {isEditMode ? (
                        <>
                            <a href="#attendance" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-colors">
                                View Attendance
                            </a>
                            <button
                                onClick={() => gridRef.current?.saveAllChanges()}
                                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                            >
                                Save Attendance
                            </button>
                        </>
                    ) : (
                        <a href="#attendance/edit" className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors">
                            Edit Attendance
                        </a>
                    )}
                </div>
            </div>

            {/* Main Grid Section */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                            <span className="text-accent-primary font-bold animate-pulse">Loading Muster...</span>
                        </div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white/5 border border-dashed border-white/10 rounded-2xl gap-4">
                        <div className="text-6xl">🔍</div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">No Laborers Found</h3>
                            <p className="text-slate-500">Please add laborers in the Directory first.</p>
                        </div>
                        <a href="#laborers" className="px-6 py-2 bg-accent-primary text-white rounded-xl font-bold">
                            Go to Directory
                        </a>
                    </div>
                ) : (
                    <AttendanceMasterGrid 
                        ref={gridRef}
                        month={month}
                        year={year}
                        initialData={filteredData}
                        isEditMode={isEditMode}
                        onDataChange={(updated) => {
                            // Update local data when child saves
                            setData(prev => prev.map(p => {
                                const up = updated.find(u => u.grNo === p.grNo);
                                return up || p;
                            }));
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default AttendancePage;
