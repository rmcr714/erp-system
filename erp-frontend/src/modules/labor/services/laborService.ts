import type { Laborer } from '../types/laborer';

const API_BASE_URL = '/api/laborers';

interface SearchCriteria {
  name?: string;
  grNo?: string;
  designation?: string;
  idProofNumber?: string;
  contactNo?: string;
  siteId?: number;
  onlyActive?: boolean;
  page?: number;
  size?: number;
}

export interface PaginatedLaborers {
  content: Laborer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const laborService = {
  async getAllLaborers(searchCriteria?: SearchCriteria): Promise<PaginatedLaborers> {
    const params = new URLSearchParams();
    
    if (searchCriteria) {
      if (searchCriteria.name) params.append('name', searchCriteria.name);
      if (searchCriteria.grNo) params.append('grNo', searchCriteria.grNo);
      if (searchCriteria.designation && searchCriteria.designation !== '*') params.append('designation', searchCriteria.designation);
      if (searchCriteria.contactNo) params.append('contactNo', searchCriteria.contactNo);
      if (searchCriteria.siteId) params.append('siteId', searchCriteria.siteId.toString());
      if (searchCriteria.onlyActive) params.append('onlyActive', 'true');
      if (searchCriteria.idProofNumber) params.append('idProofNumber', searchCriteria.idProofNumber);
      if (searchCriteria.page !== undefined) params.append('page', (searchCriteria.page - 1).toString()); // Spring uses 0-indexed pages
      if (searchCriteria.size !== undefined) params.append('size', searchCriteria.size.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
      
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
  },

  async updateLaborer(grNo: string, laborer: Partial<Laborer>): Promise<Laborer> {
    const response = await fetch(`${API_BASE_URL}/${grNo}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(laborer),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update laborer');
    }

    return response.json();
  }
};
