import { type MusterRow } from '../types';

export const reportService = {
    getAttendanceReport: async (month: number, year: number): Promise<MusterRow[]> => {
        const response = await fetch(`/api/attendance/muster?month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch attendance report');
        }
        return response.json();
    }
};
