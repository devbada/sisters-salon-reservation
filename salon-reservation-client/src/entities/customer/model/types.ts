import { BaseEntity } from '~/shared/lib/types';

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  isVip: boolean;
  lastVisit?: string;
  totalVisits: number;
  preferences?: CustomerPreferences;
}

export interface CustomerPreferences {
  preferredDesigner?: string;
  preferredServices: string[];
  allergies?: string[];
  notes?: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
}

export interface CustomerSearchParams {
  query?: string;
  phone?: string;
  email?: string;
  isVip?: boolean;
  limit?: number;
  offset?: number;
}