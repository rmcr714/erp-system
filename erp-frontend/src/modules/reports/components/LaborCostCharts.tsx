import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { type LaborCostData } from '../types';

interface LaborCostChartsProps {
    data: LaborCostData[];
    filterDesignation: string;
    filterTimeRange: number;
    customMonth: number;
    customYear: number;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const chartColors = ['#38bdf8', '#a78bfa', '#fb7185', '#34d399', '#fbbf24', '#60a5fa', '#f472b6'];

const formatCurrency = (value: number) => {
    if (value >= 10000000) return `Rs. ${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)} L`;
    if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1)} K`;
    return `Rs. ${value.toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const rows = payload
        .filter((entry: any) => Number(entry.value) > 0)
        .sort((a: any, b: any) => Number(b.value) - Number(a.value));
    const total = rows.reduce((sum: number, entry: any) => sum + Number(entry.value), 0);

    return (
        <div className="min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="mt-1 text-xs text-slate-400">Total {formatCurrency(total || payload[0]?.payload?.total || 0)}</p>
            <div className="mt-3 flex flex-col gap-2">
                {rows.slice(0, 7).map((entry: any) => (
                    <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-slate-300">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="truncate">{entry.name || entry.dataKey}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-white">{formatCurrency(Number(entry.value))}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LaborCostCharts: React.FC<LaborCostChartsProps> = ({
    data,
    filterDesignation,
    filterTimeRange,
    customMonth,
    customYear,
}) => {
    const designations = Array.from(new Set(data.map(d => d.designation))).sort();
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
    const averageMonthlyCost = trendData.length > 0 ? totalGrossSummary / trendData.length : 0;
    const latestMonth = trendData[trendData.length - 1];
    const previousMonth = trendData[trendData.length - 2];
    const monthChange = latestMonth && previousMonth && previousMonth.total > 0
        ? ((latestMonth.total - previousMonth.total) / previousMonth.total) * 100
        : 0;
    const visibleDesignations = filterDesignation === 'All' ? designations : [filterDesignation];
    const roleBreakdown = latestMonth
        ? designations
            .map((designation, index) => ({
                designation,
                value: latestMonth[designation] || 0,
                fill: chartColors[index % chartColors.length],
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
        : [];
    const topRole = roleBreakdown[0];

    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-pink-500/15 via-slate-900 to-slate-900 border border-pink-500/20 p-5 shadow-lg">
                    <span className="text-pink-300 font-bold uppercase tracking-widest text-xs">Total Gross Cost</span>
                    <span className="mt-3 block text-3xl font-black text-white">{formatCurrency(totalGrossSummary)}</span>
                    <span className="mt-1 block text-slate-400 text-sm">
                        {filterDesignation === 'All' ? 'All roles' : filterDesignation} - {filterTimeRange === -1 ? `${monthNames[customMonth - 1]} ${customYear}` : filterTimeRange === 1 ? 'This month' : `Last ${filterTimeRange} months`}
                    </span>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-lg">
                    <span className="text-sky-300 font-bold uppercase tracking-widest text-xs">Monthly Average</span>
                    <span className="mt-3 block text-3xl font-black text-white">{formatCurrency(averageMonthlyCost)}</span>
                    <span className="mt-1 block text-slate-400 text-sm">Based on {trendData.length || 0} visible month{trendData.length === 1 ? '' : 's'}</span>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-lg">
                    <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">Latest Movement</span>
                    <span className={`mt-3 block text-3xl font-black ${monthChange >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {previousMonth ? `${monthChange >= 0 ? '+' : ''}${monthChange.toFixed(1)}%` : 'New'}
                    </span>
                    <span className="mt-1 block text-slate-400 text-sm">{latestMonth ? `${latestMonth.label} vs previous month` : 'No data to compare'}</span>
                </div>
            </div>

            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Month-wise Labor Cost</h2>
                        <p className="text-sm text-slate-400">Roles are shown side by side for easier month-to-month comparison.</p>
                    </div>
                    {topRole && (
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2 text-sm">
                            <span className="text-slate-400">Top role: </span>
                            <span className="font-bold text-white">{topRole.designation}</span>
                        </div>
                    )}
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} margin={{ top: 18, right: 12, left: 6, bottom: 8 }} barCategoryGap="24%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => formatCurrency(Number(val))} tickLine={false} axisLine={false} width={74} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: 18, color: '#cbd5e1', fontSize: 12 }} />
                            {visibleDesignations.map((desig, index) => (
                                <Bar
                                    key={desig}
                                    dataKey={desig}
                                    name={desig}
                                    fill={chartColors[index % chartColors.length]}
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={58}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {filterDesignation === 'All' && roleBreakdown.length > 0 && (
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-white">Role Cost Breakdown</h2>
                        <p className="text-sm text-slate-400">{latestMonth?.label} - sorted from highest to lowest cost.</p>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roleBreakdown} margin={{ top: 18, right: 16, left: 6, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                                <XAxis dataKey="designation" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval={0} dy={8} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => formatCurrency(Number(val))} tickLine={false} axisLine={false} width={74} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '14px', color: '#e2e8f0' }}
                                    formatter={(value: any) => [formatCurrency(Number(value)), 'Gross cost']}
                                    cursor={{ fill: 'rgba(148,163,184,0.06)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={70}>
                                    {roleBreakdown.map(entry => (
                                        <Cell key={entry.designation} fill={entry.fill} />
                                    ))}
                                    <LabelList dataKey="value" position="top" formatter={(value: any) => formatCurrency(Number(value))} fill="#cbd5e1" fontSize={11} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaborCostCharts;
