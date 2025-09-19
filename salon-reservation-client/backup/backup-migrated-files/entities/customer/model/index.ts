export interface LegacyCustomer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  gender?: 'male' | 'female' | 'other';
  preferred_stylist?: string;
  preferred_service?: string;
  allergies?: string;
  vip_status: boolean;
  vip_level: number;
  total_visits: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LegacyCustomerSearchResponse {
  customers: LegacyCustomer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
