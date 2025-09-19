import { apiClient } from '~/shared/api/base';
import { LegacyCustomer, LegacyCustomerSearchResponse } from '../model';

export const customerApi = {
  searchCustomers: async (params: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<LegacyCustomerSearchResponse> => {
    const response = await apiClient.get<LegacyCustomerSearchResponse>('/customers', {
      params,
    });
    return response.data;
  },

  getCustomerById: async (id: number): Promise<LegacyCustomer> => {
    const response = await apiClient.get<LegacyCustomer>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customer: Omit<LegacyCustomer, 'id' | 'created_at' | 'updated_at'>): Promise<LegacyCustomer> => {
    const response = await apiClient.post<LegacyCustomer>('/customers', customer);
    return response.data;
  },

  updateCustomer: async (id: number, customer: Partial<Omit<LegacyCustomer, 'id' | 'created_at' | 'updated_at'>>): Promise<LegacyCustomer> => {
    const response = await apiClient.put<LegacyCustomer>(`/customers/${id}`, customer);
    return response.data;
  },

  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
