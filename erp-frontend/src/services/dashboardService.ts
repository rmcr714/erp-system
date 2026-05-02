export interface DashboardStats {
    totalLaborers: number;
    activeLaborers: number;
    inactiveLaborers: number;
    onLeaveLaborers: number;
    laborersByDesignation: Record<string, number>;
    currentMonth: number;
    currentYear: number;
    todayPresentCount: number;
    todayTotalUnits: number;
    monthAverageAttendancePercent: number;
    currentMonthGrossPayroll: number;
    currentMonthTotalAdvance: number;
    currentMonthNetPayroll: number;
    currentMonthTotalDebit: number;
    payrollTrends: MonthlyTrend[];
    attendanceTrends: MonthlyTrend[];
    newJoineesThisMonth: number;
    topEarners: TopWorker[];
    highestDebits: TopWorker[];
}

export interface MonthlyTrend {
    month: number;
    year: number;
    label: string;
    value: number;
}

export interface TopWorker {
    grNo: string;
    name: string;
    designation: string;
    amount: number;
    totalUnits: number;
}

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        const response = await fetch('/api/reports/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    }
};
