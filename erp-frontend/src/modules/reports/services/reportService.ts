import type { PaginatedMuster } from '../../attendance/services/attendanceService';

export const reportService = {
    getAttendanceReport: async (month: number, year: number, siteId: number, page = 0, size = 100): Promise<PaginatedMuster> => {
        const response = await fetch(`/api/attendance/muster?month=${month}&year=${year}&siteId=${siteId}&page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error('Failed to fetch attendance report');
        }
        return response.json();
    }
};
