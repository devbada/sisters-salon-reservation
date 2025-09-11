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
  }
};