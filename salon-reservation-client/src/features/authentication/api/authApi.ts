import { apiClient } from '~/shared/api';
import { User, LoginCredentials, RegisterData } from '../model/types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
};