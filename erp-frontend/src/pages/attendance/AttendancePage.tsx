import React, { useState, useEffect } from 'react';
import AttendanceMasterGrid from '../../modules/attendance/components/AttendanceMasterGrid';
import { attendanceService } from '../../modules/attendance/services/attendanceService';
import type { MonthlyMusterRow } from '../../modules/attendance/types';
import { toast } from 'react-hot-toast';

const AttendancePage: React.FC = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<MonthlyMusterRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col gap-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-4">
                    <a 
                        href="#dashboard" 
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </a>
                    <h1 className="text-4xl font-black font-outfit text-white tracking-tight flex items-center gap-3">
                        Attendance Muster
                        <span className="px-3 py-1 text-xs rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30 uppercase tracking-widest">Live</span>
                    </h1>
                    <p className="text-slate-400">Manage daily hours and real-time payroll balances.</p>
                </div>

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
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Strength</span>
                    <span className="text-3xl font-black text-white">{data.length}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Present Today</span>
                    <span className="text-3xl font-black text-emerald-400">
                        {data.filter(r => r.attendance[new Date().getDate()] > 0).length}
                    </span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Liability</span>
                    <span className="text-3xl font-black text-sky-400">₹{data.reduce((a,b) => a + b.closingBalance, 0).toLocaleString()}</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Advances Paid</span>
                    <span className="text-3xl font-black text-amber-500">₹{data.reduce((a,b) => a + b.totalAdvance, 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Toolbar & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Search by name, gr no, or designation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
                    />
                    <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold border border-white/10 transition-all active:scale-95">
                        Download Excel
                    </button>
                    <button className="flex-1 md:flex-none px-6 py-3 bg-accent-primary text-white rounded-xl font-bold shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Main Grid Section */}
            <div className="flex-1 relative">
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
                        month={month}
                        year={year}
                        initialData={filteredData}
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
