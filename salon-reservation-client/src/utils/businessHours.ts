// 영업시간 관리 유틸리티 함수들
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export interface BusinessHour {
  id?: number;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  break_start: string | null;
  break_end: string | null;
}

export interface Holiday {
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

// 특정 날짜의 영업시간 확인
export function getBusinessHoursForDate(
  date: string,
  businessHours: BusinessHour[],
  holidays: Holiday[],
  specialHours: SpecialHour[]
): BusinessHour | SpecialHour | null {
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

// 예약 가능한 시간대 생성 (30분 간격)
export function generateAvailableTimeSlots(
  businessHour: BusinessHour | SpecialHour | null
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

// 시간 문자열을 분으로 변환 (예: "09:30" -> 570)
function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// 분을 시간 문자열로 변환 (예: 570 -> "09:30")
function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 특정 날짜가 영업일인지 확인
export function isBusinessDay(
  date: string,
  businessHours: BusinessHour[],
  holidays: Holiday[],
  specialHours: SpecialHour[]
): boolean {
  const businessHour = getBusinessHoursForDate(date, businessHours, holidays, specialHours);
  return businessHour !== null && !businessHour.is_closed;
}

// 특정 시간이 영업시간 내인지 확인
export function isTimeAvailable(
  date: string,
  time: string,
  businessHours: BusinessHour[],
  holidays: Holiday[],
  specialHours: SpecialHour[]
): boolean {
  const businessHour = getBusinessHoursForDate(date, businessHours, holidays, specialHours);
  
  if (!businessHour || businessHour.is_closed || !businessHour.open_time || !businessHour.close_time) {
    return false;
  }

  const timeInMinutes = timeStringToMinutes(time);
  const openTime = timeStringToMinutes(businessHour.open_time);
  const closeTime = timeStringToMinutes(businessHour.close_time);
  
  // 영업시간 내인지 확인
  if (timeInMinutes < openTime || timeInMinutes >= closeTime) {
    return false;
  }

  // 휴게시간인지 확인
  if (businessHour.break_start && businessHour.break_end) {
    const breakStart = timeStringToMinutes(businessHour.break_start);
    const breakEnd = timeStringToMinutes(businessHour.break_end);
    
    if (timeInMinutes >= breakStart && timeInMinutes < breakEnd) {
      return false;
    }
  }

  return true;
}

// 영업시간 정보를 가져오는 API 함수
export async function fetchBusinessHoursData() {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const [hoursRes, holidaysRes, specialRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/business-hours`, { headers }),
      fetch(`${API_BASE_URL}/api/business-hours/holidays`, { headers }),
      fetch(`${API_BASE_URL}/api/business-hours/special`, { headers })
    ]);

    const [businessHours, holidays, specialHours] = await Promise.all([
      hoursRes.json(),
      holidaysRes.json(),
      specialRes.json()
    ]);

    return { businessHours, holidays, specialHours };
  } catch (error) {
    console.error('Failed to fetch business hours data:', error);
    return { businessHours: [], holidays: [], specialHours: [] };
  }
}