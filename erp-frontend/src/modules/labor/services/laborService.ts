import type { Laborer } from '../types/laborer';

const API_BASE_URL = 'http://localhost:8080/api/laborers';

interface SearchCriteria {
  name?: string;
  grNo?: string;
  designation?: string;
  idProofNumber?: string;
}

export const laborService = {
  async getAllLaborers(searchCriteria?: SearchCriteria | string): Promise<Laborer[]> {
    let url = API_BASE_URL;

    // Handle both old string-based search and new criteria-based search
    if (typeof searchCriteria === 'string') {
      // Legacy support for simple search string
      url = searchCriteria 
        ? `${API_BASE_URL}?search=${encodeURIComponent(searchCriteria)}` 
        : API_BASE_URL;
    } else if (searchCriteria && typeof searchCriteria === 'object') {
      // New criteria-based search
      const params = new URLSearchParams();
      
      if (searchCriteria.name) params.append('name', searchCriteria.name);
      if (searchCriteria.grNo) params.append('grNo', searchCriteria.grNo);
      // Only append designation if it's not the wildcard "all designations" value
      if (searchCriteria.designation && searchCriteria.designation !== '*') {
        params.append('designation', searchCriteria.designation);
      }
      if (searchCriteria.idProofNumber) params.append('idProofNumber', searchCriteria.idProofNumber);

      const queryString = params.toString();
      url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    }
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch laborers');
    }
    return response.json();
  }
};
