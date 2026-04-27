const API_URL = '/api/reports/analytics';

export interface LaborCostData {
    month: number;
    year: number;
    designation: string;
    totalGrossSalary: number;
}

export const analyticsService = {
    getLaborCostTrends: async (): Promise<LaborCostData[]> => {
        const response = await fetch(`${API_URL}/labor-cost`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    }
};
