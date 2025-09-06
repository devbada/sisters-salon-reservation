export interface Customer {
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
  notes?: CustomerNote[];
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: number;
  note: string;
  is_important: boolean;
  created_by: string;
  created_at: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  gender?: 'male' | 'female' | 'other';
  preferredStylist?: string;
  preferredService?: string;
  allergies?: string;
  vipStatus?: boolean;
  vipLevel?: number;
  notes?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface VisitHistory {
  _id: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
  createdAt: string;
}

export interface CustomerHistoryResponse {
  customer: {
    id: number;
    name: string;
  };
  history: VisitHistory[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}