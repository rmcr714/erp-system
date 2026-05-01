import type { MonthlyMusterRow, AttendanceSaveRequest, PayrollUpdateRequest } from '../types';

const API_BASE_URL = '/api/attendance';

export const attendanceService = {
    async getMonthlyMuster(month: number, year: number): Promise<MonthlyMusterRow[]> {
        const response = await fetch(`${API_BASE_URL}/muster?month=${month}&year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch muster');
        return response.json();
    },

    async startMonth(month: number, year: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/start-month?month=${month}&year=${year}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to start month');
    },

    async saveAttendance(request: AttendanceSaveRequest): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to save attendance');
    },

    async saveBatchAttendance(requests: AttendanceSaveRequest[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/save-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requests),
        });
        if (!response.ok) throw new Error('Failed to save batch attendance');
    },

    async updateRate(grNo: string, month: number, year: number, rate: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/rate?grNo=${grNo}&month=${month}&year=${year}&rate=${rate}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to update rate');
    },

    async addAdvance(data: any): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/advance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to record advance');
    },

    async updatePayroll(request: PayrollUpdateRequest): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/payroll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error('Failed to update payroll');
    },

    async updatePayrollBatch(requests: PayrollUpdateRequest[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/payroll/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requests),
        });
        if (!response.ok) throw new Error('Failed to update payroll batch');
    },

    async getWorkerPresence(day: number | null, month: number | null, year: number | null, grNo?: string, page = 0, size = 10): Promise<any> {
        let params = new URLSearchParams();
        if (day && day > 0) params.append('day', day.toString());
        if (month && month > 0) params.append('month', month.toString());
        if (year && year > 0) params.append('year', year.toString());
        if (grNo) params.append('grNo', grNo);
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        const response = await fetch(`${API_BASE_URL}/worker-presence?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch worker presence');
        return response.json();
    }
};
