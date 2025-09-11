import { BaseEntity } from '~/shared/lib/types';

export interface Reservation extends BaseEntity {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  designerName: string;
  service: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: ReservationStatus;
  notes?: string;
  price: number;
  isConflict?: boolean;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  designerName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  price: number;
}

export interface ReservationConflict {
  reservationId: string;
  conflictType: 'time_overlap' | 'designer_unavailable' | 'double_booking';
  message: string;
}