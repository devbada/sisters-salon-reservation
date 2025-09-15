/**
 * 영업시간 관리 유틸리티 함수들
 * 백업에서 이관된 비즈니스 로직
 */

// 레거시 타입 정의 (백업 호환성)
export interface LegacyBusinessHour {
  id?: number;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface LegacyHoliday {
  id?: number;
  date: string;
  name: string;
  is_recurring: boolean;
  is_closed?: boolean;
}

export interface LegacySpecialHour {
  id?: number;
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
  reason?: string;
}

/**
 * 특정 날짜의 영업시간 확인
 * 우선순위: 휴일 > 특별 영업시간 > 기본 영업시간
 */
export function getBusinessHoursForDate(
  date: string,
  businessHours: LegacyBusinessHour[],
  holidays: LegacyHoliday[],
  specialHours: LegacySpecialHour[]
): LegacyBusinessHour | LegacySpecialHour | null {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();

  // 1. 휴일 확인
  const isHoliday = holidays.some(holiday => {
    if (holiday.is_recurring) {
      // 매년 반복되는 휴일 (월-일만 비교)
      const holidayDate = new Date(holiday.date + 'T00:00:00');
      return (
        dateObj.getMonth() === holidayDate.getMonth() &&
        dateObj.getDate() === holidayDate.getDate()
      );
    } else {
      // 특정 연도의 휴일
      return holiday.date === date;
    }
  });

  if (isHoliday) {
    return null; // 휴일
  }

  // 2. 특별 영업시간 확인
  const specialHour = specialHours.find(special => special.date === date);
  if (specialHour) {
    return specialHour;
  }

  // 3. 기본 영업시간 반환
  const defaultHour = businessHours.find(hour => hour.day_of_week === dayOfWeek);
  return defaultHour || null;
}

/**
 * 예약 가능한 시간대 생성 (30분 간격)
 */
export function generateAvailableTimeSlots(
  businessHour: LegacyBusinessHour | LegacySpecialHour | null
): string[] {
  if (!businessHour || businessHour.is_closed || !businessHour.open_time || !businessHour.close_time) {
    return [];
  }

  const slots: string[] = [];
  const openTime = timeStringToMinutes(businessHour.open_time);
  const closeTime = timeStringToMinutes(businessHour.close_time);
  const breakStart = businessHour.break_start ? timeStringToMinutes(businessHour.break_start) : null;
  const breakEnd = businessHour.break_end ? timeStringToMinutes(businessHour.break_end) : null;

  // 30분 간격으로 시간 슬롯 생성
  for (let time = openTime; time < closeTime; time += 30) {
    // 휴게시간 건너뛰기
    if (breakStart !== null && breakEnd !== null && time >= breakStart && time < breakEnd) {
      continue;
    }

    slots.push(minutesToTimeString(time));
  }

  return slots;
}

/**
 * 시간 문자열을 분으로 변환 (예: "09:30" -> 570)
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 분을 시간 문자열로 변환 (예: 570 -> "09:30")
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 특정 날짜가 영업일인지 확인
 */
export function isBusinessDay(
  date: string,
  businessHours: LegacyBusinessHour[],
  holidays: LegacyHoliday[],
  specialHours: LegacySpecialHour[]
): boolean {
  const businessHour = getBusinessHoursForDate(date, businessHours, holidays, specialHours);
  return businessHour !== null && !businessHour.is_closed;
}

/**
 * 영업시간 데이터를 API에서 가져오는 함수
 */
export async function fetchBusinessHoursData(): Promise<{
  businessHours: LegacyBusinessHour[];
  holidays: LegacyHoliday[];
  specialHours: LegacySpecialHour[];
}> {
  try {
    // 실제 구현에서는 API 호출을 하지만, 여기서는 빈 배열 반환
    // 각 컴포넌트에서 실제 API 호출을 수행할 예정
    return {
      businessHours: [],
      holidays: [],
      specialHours: []
    };
  } catch (error) {
    console.error('Failed to fetch business hours data:', error);
    return {
      businessHours: [],
      holidays: [],
      specialHours: []
    };
  }
}

/**
 * 두 시간대가 겹치는지 확인
 */
export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Minutes = timeStringToMinutes(start1);
  const end1Minutes = timeStringToMinutes(end1);
  const start2Minutes = timeStringToMinutes(start2);
  const end2Minutes = timeStringToMinutes(end2);

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

/**
 * 시간대 포맷팅 (예: "09:00" -> "오전 9:00")
 */
export function formatTimeSlot(timeSlot: string): string {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const isPM = hours >= 12;
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const period = isPM ? '오후' : '오전';

  return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD -> 한국어 형식)
 */
export function formatDateToKorean(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜가 오늘 이후인지 확인
 */
export function isDateInFuture(dateString: string): boolean {
  const today = getTodayDate();
  return dateString >= today;
}

/**
 * 두 날짜 사이의 일수 계산
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}