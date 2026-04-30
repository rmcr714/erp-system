import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { type LaborCostData } from '../types';

interface LaborCostChartsProps {
    data: LaborCostData[];
    filterDesignation: string;
    filterTimeRange: number;
    customMonth: number;
    customYear: number;
}

const LaborCostCharts: React.FC<LaborCostChartsProps> = ({ 
    data, 
    filterDesignation, 
    filterTimeRange, 
    customMonth, 
    customYear 
}) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];
    const designations = Array.from(new Set(data.map(d => d.designation))).sort();

    // Prepare M/M Trend Data
    const trendDataMap = new Map<string, any>();
    data.forEach(item => {
        if (filterDesignation !== 'All' && item.designation !== filterDesignation) return;

        const label = `${monthNames[item.month - 1]} ${item.year}`;
        const sortKey = item.year * 12 + item.month;
        if (!trendDataMap.has(label)) {
            trendDataMap.set(label, { label, sortKey, total: 0 });
        }
        const entry = trendDataMap.get(label);
        entry[item.designation] = (entry[item.designation] || 0) + item.totalGrossSalary;
        entry.total += item.totalGrossSalary;
    });

    let trendData = Array.from(trendDataMap.values()).sort((a, b) => a.sortKey - b.sortKey);

    if (filterTimeRange > 0) {
        trendData = trendData.slice(-filterTimeRange);
    } else if (filterTimeRange === -1) {
        const customSortKey = customYear * 12 + customMonth;
        trendData = trendData.filter(item => item.sortKey === customSortKey);
    }

    const totalGrossSummary = trendData.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="grid grid-cols-1 gap-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/5 border border-pink-500/20 rounded-3xl p-6 flex flex-col gap-2 shadow-lg">
                    <span className="text-pink-300 font-bold uppercase tracking-widest text-xs">Total Gross Cost</span>
                    <span className="text-4xl font-black text-white">₹{totalGrossSummary.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm">For {filterDesignation === 'All' ? 'All Roles' : filterDesignation} ({filterTimeRange === -1 ? `${monthNames[customMonth - 1]} ${customYear}` : filterTimeRange === 1 ? 'This Month' : `Last ${filterTimeRange} Months`})</span>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">M/M Labor Cost Trends (Gross)</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="label" stroke="#64748b" />
                            <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val/1000}k`} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                            />
                            <Legend />
                            
                            {filterDesignation === 'All' ? (
                                designations.map((desig, i) => (
                                    <Bar 
                                        key={desig}
                                        dataKey={desig} 
                                        fill={colors[i % colors.length]} 
                                        radius={[4, 4, 0, 0]}
                                    />
                                ))
                            ) : (
                                <Bar 
                                    dataKey={filterDesignation} 
                                    fill="#ec4899" 
                                    radius={[4, 4, 0, 0]}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart Summary for currently selected/latest month */}
            {filterDesignation === 'All' && trendData.length > 0 && (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Role Cost Breakdown ({trendData[trendData.length - 1]?.label})</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[trendData[trendData.length - 1]]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="label" stroke="#64748b" />
                                <YAxis stroke="#64748b" tickFormatter={(val) => `₹${val/1000}k`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                                />
                                <Legend />
                                {designations.map((desig, i) => (
                                    <Bar key={desig} dataKey={desig} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaborCostCharts;
