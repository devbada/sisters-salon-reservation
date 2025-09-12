import type { BusinessHour, BusinessHoliday, SpecialHour } from '../types/businessHours';

// 특정 날짜의 영업시간 확인
export function getBusinessHoursForDate(
  date: string,
  businessHours: BusinessHour[],
  holidays: BusinessHoliday[],
  specialHours: SpecialHour[]
): BusinessHour | SpecialHour | null {
  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  
  // 1. 휴일 확인
  const isHoliday = holidays.some(holiday => {
    if (holiday.isRecurring) {
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
  const defaultHour = businessHours.find(hour => hour.dayOfWeek === dayOfWeek);
  return defaultHour || null;
}

// 예약 가능한 시간대 생성 (30분 간격)
// 타입 가드 함수들
function isSpecialHour(hour: BusinessHour | SpecialHour): hour is SpecialHour {
  return 'type' in hour;
}

function isBusinessHour(hour: BusinessHour | SpecialHour): hour is BusinessHour {
  return 'isOpen' in hour;
}

export function generateAvailableTimeSlots(
  businessHour: BusinessHour | SpecialHour | null
): string[] {
  if (!businessHour) {
    return [];
  }

  // SpecialHour가 closed인 경우
  if (isSpecialHour(businessHour) && businessHour.type === 'closed') {
    return [];
  }

  // BusinessHour가 닫힌 경우
  if (isBusinessHour(businessHour) && !businessHour.isOpen) {
    return [];
  }

  // 영업시간 정보가 없는 경우
  if (!businessHour.openTime || !businessHour.closeTime) {
    return [];
  }

  const slots: string[] = [];
  const openTime = timeStringToMinutes(businessHour.openTime);
  const closeTime = timeStringToMinutes(businessHour.closeTime);
  const breakStart = businessHour.breakStart ? timeStringToMinutes(businessHour.breakStart) : null;
  const breakEnd = businessHour.breakEnd ? timeStringToMinutes(businessHour.breakEnd) : null;

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
  holidays: BusinessHoliday[],
  specialHours: SpecialHour[]
): boolean {
  const businessHour = getBusinessHoursForDate(date, businessHours, holidays, specialHours);
  
  if (!businessHour) {
    return false;
  }

  // SpecialHour인 경우 - closed가 아니면 영업일
  if (isSpecialHour(businessHour)) {
    return businessHour.type !== 'closed';
  }

  // BusinessHour인 경우 - isOpen이 true면 영업일
  if (isBusinessHour(businessHour)) {
    return businessHour.isOpen;
  }

  return false;
}

// 특정 시간이 영업시간 내인지 확인
export function isTimeAvailable(
  date: string,
  time: string,
  businessHours: BusinessHour[],
  holidays: BusinessHoliday[],
  specialHours: SpecialHour[]
): boolean {
  const businessHour = getBusinessHoursForDate(date, businessHours, holidays, specialHours);
  
  if (!businessHour) {
    return false;
  }

  // SpecialHour가 closed인 경우
  if (isSpecialHour(businessHour) && businessHour.type === 'closed') {
    return false;
  }

  // BusinessHour가 닫힌 경우
  if (isBusinessHour(businessHour) && !businessHour.isOpen) {
    return false;
  }

  // 영업시간 정보가 없는 경우
  if (!businessHour.openTime || !businessHour.closeTime) {
    return false;
  }

  const timeInMinutes = timeStringToMinutes(time);
  const openTime = timeStringToMinutes(businessHour.openTime);
  const closeTime = timeStringToMinutes(businessHour.closeTime);
  
  // 영업시간 내인지 확인
  if (timeInMinutes < openTime || timeInMinutes >= closeTime) {
    return false;
  }

  // 휴게시간인지 확인
  if (businessHour.breakStart && businessHour.breakEnd) {
    const breakStart = timeStringToMinutes(businessHour.breakStart);
    const breakEnd = timeStringToMinutes(businessHour.breakEnd);
    
    if (timeInMinutes >= breakStart && timeInMinutes < breakEnd) {
      return false;
    }
  }

  return true;
}