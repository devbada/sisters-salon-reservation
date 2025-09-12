import { apiClient } from '~/shared/api';
import { Reservation, ReservationFormData, ReservationStatus, ReservationConflict } from '../model/types';
import { ConflictInfo, ConflictCheckRequest, ConflictCheckResponse } from '../model/conflictTypes';

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
  },

  async checkConflicts(data: ReservationFormData): Promise<ReservationConflict[]> {
    const response = await apiClient.post('/appointments/check-conflicts', data);
    return response.data;
  },

  /**
   * 전체 중복 예약 목록 조회 (달력용)
   */
  async getConflicts(): Promise<ConflictInfo[]> {
    try {
      const response = await apiClient.get('/reservations/conflicts');
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation conflicts:', error);
      throw error;
    }
  },

  /**
   * 특정 날짜의 중복 예약 조회
   */
  async getConflictsByDate(date: string): Promise<ConflictInfo | null> {
    try {
      const response = await apiClient.get(`/reservations/conflicts/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conflicts for date ${date}:`, error);
      throw error;
    }
  },

  /**
   * 상세 충돌 체크 (예약 생성/수정 시 사용)
   */
  async checkDetailedConflicts(data: ConflictCheckRequest): Promise<ConflictCheckResponse> {
    try {
      const response = await apiClient.post('/reservations/check-detailed-conflicts', data);
      return response.data;
    } catch (error) {
      console.error('Error checking detailed conflicts:', error);
      return {
        hasConflict: false,
        conflicts: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};