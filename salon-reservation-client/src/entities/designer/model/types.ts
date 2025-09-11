import { BaseEntity } from '~/shared/lib/types';

export interface Designer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  workSchedule: WorkSchedule;
  isActive: boolean;
  hireDate: string;
  rating: number;
  profileImage?: string;
}

export interface WorkSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DesignerFormData {
  name: string;
  phone: string;
  email?: string;
  specialties: string[];
  workSchedule: WorkSchedule;
}