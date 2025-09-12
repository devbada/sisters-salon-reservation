// 영업시간 관리 관련 타입 정의
export interface BusinessHour {
  id: string;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

export interface BusinessHoliday {
  id: string;
  date: string;
  name: string;
  type: 'public' | 'custom';
  isRecurring?: boolean;
  isClosed: boolean;
  isSubstitute: boolean;
  notes?: string;
}

export interface SpecialHour {
  id: string;
  date: string;
  reason: string;
  type: 'closed' | 'modified';
  openTime?: string;
  closeTime?: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
  isActive: boolean;
}

// Legacy types for backward compatibility
export interface LegacyBusinessHour {
  id?: number;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface LegacyBusinessHoliday {
  id?: number;
  date: string;
  name: string;
  type: string;
  is_recurring: boolean;
  is_closed: boolean;
  is_substitute: boolean;
  description?: string;
}

export interface LegacySpecialHour {
  id?: number;
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}