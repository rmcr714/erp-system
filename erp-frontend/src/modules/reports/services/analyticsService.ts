import { type LaborCostData } from '../types';

const API_URL = '/api/reports/analytics';

export const analyticsService = {
    getLaborCostTrends: async (siteId: number): Promise<LaborCostData[]> => {
        const response = await fetch(`${API_URL}/labor-cost?siteId=${siteId}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    }
};
