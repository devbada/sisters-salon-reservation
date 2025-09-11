import { BaseEntity } from '~/shared/lib/types';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'staff' | 'designer';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}