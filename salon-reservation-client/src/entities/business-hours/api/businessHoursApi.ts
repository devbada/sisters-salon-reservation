import { apiClient } from '~/shared/api';
import { BusinessHours, SpecialBusinessHours } from '../model/types';

export const businessHoursApi = {
  async getBusinessHours(): Promise<BusinessHours[]> {
    const response = await apiClient.get('/business-hours');
    return response.data;
  },

  async updateBusinessHours(id: string, data: Partial<BusinessHours>): Promise<BusinessHours> {
    const response = await apiClient.put(`/business-hours/${id}`, data);
    return response.data;
  },

  async getSpecialHours(date: string): Promise<SpecialBusinessHours | null> {
    const response = await apiClient.get(`/business-hours/special/${date}`);
    return response.data;
  },

  async createSpecialHours(data: SpecialBusinessHours): Promise<SpecialBusinessHours> {
    const response = await apiClient.post('/business-hours/special', data);
    return response.data;
  }
};