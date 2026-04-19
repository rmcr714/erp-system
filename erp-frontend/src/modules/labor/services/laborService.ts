import type { Laborer } from '../types/laborer';

const API_BASE_URL = 'http://localhost:8080/api/laborers';

export const laborService = {
  async getAllLaborers(search?: string): Promise<Laborer[]> {
    const url = search 
      ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` 
      : API_BASE_URL;
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch laborers');
    }
    return response.json();
  }
};
