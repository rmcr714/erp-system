const API_URL = 'http://localhost:8080/api/reports/analytics';

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
