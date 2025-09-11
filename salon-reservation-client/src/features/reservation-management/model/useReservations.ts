import { useEffect } from 'react';
import { reservationApi, ReservationFormData, ReservationStatus } from '~/entities/reservation';
import { useReservationStore } from './reservationStore';

export const useReservations = (date?: string) => {
  const {
    reservations,
    filteredReservations,
    selectedDate,
    isLoading,
    error,
    setReservations,
    setLoading,
    setError
  } = useReservationStore();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = date 
          ? await reservationApi.getReservationsByDate(date)
          : await reservationApi.getReservations();
          
        setReservations(data);
      } catch (error) {
        setError('예약 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [date, selectedDate]);

  const createReservation = async (data: ReservationFormData) => {
    try {
      setLoading(true);
      const newReservation = await reservationApi.createReservation(data);
      useReservationStore.getState().addReservation(newReservation);
      return newReservation;
    } catch (error) {
      setError('예약 생성에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: ReservationStatus) => {
    try {
      const updated = await reservationApi.updateReservationStatus(id, status);
      useReservationStore.getState().updateReservation(id, updated);
      return updated;
    } catch (error) {
      setError('예약 상태 변경에 실패했습니다.');
      throw error;
    }
  };

  return {
    reservations,
    filteredReservations,
    isLoading,
    error,
    createReservation,
    updateReservationStatus,
  };
};