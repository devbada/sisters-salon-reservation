import { BaseEntity } from '~/shared/lib/types';

export interface BusinessHours extends BaseEntity {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breakTimes: TimeSlot[];
  isHoliday?: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface SpecialBusinessHours {
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  reason?: string; // 임시 휴무, 연장 영업 등
}