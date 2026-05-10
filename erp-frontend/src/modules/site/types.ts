export interface Site {
  id: number;
  siteCode: string;
  name: string;
  address: string;
  active: boolean;
}

export interface SiteRequest {
  siteCode: string;
  name: string;
  address?: string;
  active?: boolean;
}
