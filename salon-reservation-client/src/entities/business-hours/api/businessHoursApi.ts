import { apiClient } from '~/shared/api';
import { BusinessHours, SpecialBusinessHours, BusinessHoursFormData } from '../model/types';

export const businessHoursApi = {
  async getBusinessHours(): Promise<BusinessHours[]> {
    const response = await apiClient.get('/business-hours');
    return response.data;
  },

  async updateBusinessHours(data: BusinessHoursFormData[]): Promise<BusinessHours[]> {
    const response = await apiClient.put('/business-hours', data);
    return response.data;
  },

  async getSpecialHours(): Promise<SpecialBusinessHours[]> {
    const response = await apiClient.get('/business-hours/special');
    return response.data;
  },

  async createSpecialHours(data: SpecialBusinessHours): Promise<SpecialBusinessHours> {
    const response = await apiClient.post('/business-hours/special', data);
    return response.data;
  },

  async updateSpecialHours(id: string, data: Partial<SpecialBusinessHours>): Promise<SpecialBusinessHours> {
    const response = await apiClient.put(`/business-hours/special/${id}`, data);
    return response.data;
  },

  async deleteSpecialHours(id: string): Promise<void> {
    await apiClient.delete(`/business-hours/special/${id}`);
  },

  async getHolidays(): Promise<any[]> {
    const response = await apiClient.get('/business-hours/holidays');
    return response.data;
  },

  async isBusinessDay(date: string): Promise<{ isOpen: boolean; reason?: string }> {
    const response = await apiClient.get(`/business-hours/check/${date}`);
    return response.data;
  }
};