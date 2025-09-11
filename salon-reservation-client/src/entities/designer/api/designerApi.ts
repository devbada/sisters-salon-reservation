import { apiClient } from '~/shared/api';
import { Designer, DesignerFormData } from '../model/types';

export const designerApi = {
  async getDesigners(): Promise<Designer[]> {
    const response = await apiClient.get('/designers');
    return response.data;
  },

  async getDesigner(id: string): Promise<Designer> {
    const response = await apiClient.get(`/designers/${id}`);
    return response.data;
  },

  async getActiveDesigners(): Promise<Designer[]> {
    const response = await apiClient.get('/designers?active=true');
    return response.data;
  },

  async createDesigner(data: DesignerFormData): Promise<Designer> {
    const response = await apiClient.post('/designers', data);
    return response.data;
  },

  async updateDesigner(id: string, data: Partial<DesignerFormData>): Promise<Designer> {
    const response = await apiClient.put(`/designers/${id}`, data);
    return response.data;
  },

  async deleteDesigner(id: string): Promise<void> {
    await apiClient.delete(`/designers/${id}`);
  },

  async updateDesignerStatus(id: string, isActive: boolean): Promise<Designer> {
    const response = await apiClient.patch(`/designers/${id}/status`, { isActive });
    return response.data;
  },

  async getDesignerReservations(id: string, date?: string): Promise<any[]> {
    const params = date ? { date } : {};
    const response = await apiClient.get(`/designers/${id}/reservations`, { params });
    return response.data;
  }
};