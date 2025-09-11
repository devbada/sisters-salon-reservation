// 영업시간 관리 관련 타입 정의
export interface BusinessHour {
  id?: number;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface BusinessHoliday {
  id?: number;
  date: string;
  name: string;
  is_recurring: boolean;
}

export interface SpecialHour {
  id?: number;
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}