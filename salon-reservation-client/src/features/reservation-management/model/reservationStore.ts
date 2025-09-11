import { create } from 'zustand';
import { Reservation } from '~/entities/reservation';

interface ReservationState {
  reservations: Reservation[];
  filteredReservations: Reservation[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

interface ReservationActions {
  setReservations: (reservations: Reservation[]) => void;
  setFilteredReservations: (reservations: Reservation[]) => void;
  setSelectedDate: (date: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
}

export const useReservationStore = create<ReservationState & ReservationActions>((set, get) => ({
  reservations: [],
  filteredReservations: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),
  
  setFilteredReservations: (filteredReservations) => set({ filteredReservations }),
  
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  addReservation: (reservation) => {
    const { reservations } = get();
    set({ reservations: [...reservations, reservation] });
  },
  
  updateReservation: (id, updatedData) => {
    const { reservations } = get();
    const updated = reservations.map(r => 
      r.id === id ? { ...r, ...updatedData } : r
    );
    set({ reservations: updated });
  },
  
  removeReservation: (id) => {
    const { reservations } = get();
    set({ reservations: reservations.filter(r => r.id !== id) });
  },
}));