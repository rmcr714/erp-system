import type { Laborer } from '../types/laborer';

const API_BASE_URL = 'http://localhost:8080/api/laborers';

interface SearchCriteria {
  name?: string;
  grNo?: string;
  designation?: string;
  idProofNumber?: string;
  contactNo?: string;
  onlyActive?: boolean;
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
      if (searchCriteria.designation && searchCriteria.designation !== '*') params.append('designation', searchCriteria.designation);
      if (searchCriteria.contactNo) params.append('contactNo', searchCriteria.contactNo);
      if (searchCriteria.onlyActive) params.append('onlyActive', 'true');
      if (searchCriteria.idProofNumber) params.append('idProofNumber', searchCriteria.idProofNumber);

      const queryString = params.toString();
      url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
    }
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch laborers');
    }
    return response.json();
  },

  async addLaborer(laborer: Partial<Laborer>): Promise<Laborer> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(laborer),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to register laborer');
    }

    return response.json();
  }
};
