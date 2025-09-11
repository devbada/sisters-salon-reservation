import { apiClient } from '~/shared/api';
import { Reservation, ReservationFormData, ReservationStatus } from '../model/types';

export const reservationApi = {
  async getReservations(): Promise<Reservation[]> {
    const response = await apiClient.get('/appointments');
    return response.data;
  },

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    const response = await apiClient.get(`/appointments?date=${date}`);
    return response.data;
  },

  async createReservation(data: ReservationFormData): Promise<Reservation> {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },

  async updateReservation(id: string, data: Partial<ReservationFormData>): Promise<Reservation> {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  },

  async deleteReservation(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  }
};