import { apiClient } from '~/shared/api';
import { Customer, CustomerFormData, CustomerSearchParams } from '../model/types';

export const customerApi = {
  async getCustomers(params?: CustomerSearchParams): Promise<Customer[]> {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const response = await apiClient.get('/customers/search', {
      params: { q: query }
    });
    return response.data;
  },

  async createCustomer(data: CustomerFormData): Promise<Customer> {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  async getCustomerReservations(id: string): Promise<any[]> {
    const response = await apiClient.get(`/customers/${id}/reservations`);
    return response.data;
  }
};