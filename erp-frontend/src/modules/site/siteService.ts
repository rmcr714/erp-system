import type { Site, SiteRequest } from './types';

const API_BASE_URL = '/api/sites';

export const siteService = {
  async getSites(): Promise<Site[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch sites');
    return response.json();
  },

  async addSite(site: SiteRequest): Promise<Site> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(site),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add site');
    }

    return response.json();
  },
};
