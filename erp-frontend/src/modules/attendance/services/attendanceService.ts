import type { MonthlyMusterRow, AttendanceSaveRequest, PayrollUpdateRequest } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/attendance';

export const attendanceService = {
    async getMonthlyMuster(month: number, year: number): Promise<MonthlyMusterRow[]> {
        const response = await fetch(`${API_BASE_URL}/muster?month=${month}&year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch muster');
        return response.json();
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
    }
};
