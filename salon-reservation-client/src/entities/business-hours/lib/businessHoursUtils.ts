import { BusinessHours, SpecialBusinessHours, DayOfWeek } from '../model/types';

export const businessHoursUtils = {
  getDayOfWeekName(dayOfWeek: DayOfWeek): string {
    const dayNames = {
      monday: '월요일',
      tuesday: '화요일',
      wednesday: '수요일',
      thursday: '목요일',
      friday: '금요일',
      saturday: '토요일',
      sunday: '일요일'
    };
    return dayNames[dayOfWeek];
  },

  getDayOfWeekFromDate(date: string): DayOfWeek {
    const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dateObj = new Date(date);
    return dayNames[dateObj.getDay()];
  },

  isOpenOnDate(
    date: string,
    businessHours: BusinessHours[],
    specialHours: SpecialBusinessHours[]
  ): boolean {
    // 먼저 특별 영업시간 확인
    const special = specialHours.find(sh => sh.date === date);
    if (special) {
      return special.isOpen;
    }

    // 일반 영업시간 확인
    const dayOfWeek = this.getDayOfWeekFromDate(date);
    const regularHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    
    return regularHours ? regularHours.isOpen : false;
  },

  getOpeningHours(
    date: string,
    businessHours: BusinessHours[],
    specialHours: SpecialBusinessHours[]
  ): { openTime?: string; closeTime?: string } | null {
    // 먼저 특별 영업시간 확인
    const special = specialHours.find(sh => sh.date === date);
    if (special) {
      return special.isOpen ? {
        openTime: special.openTime,
        closeTime: special.closeTime
      } : null;
    }

    // 일반 영업시간 확인
    const dayOfWeek = this.getDayOfWeekFromDate(date);
    const regularHours = businessHours.find(bh => bh.dayOfWeek === dayOfWeek);
    
    if (!regularHours || !regularHours.isOpen) {
      return null;
    }

    return {
      openTime: regularHours.openTime,
      closeTime: regularHours.closeTime
    };
  },

  generateTimeSlots(
    date: string,
    businessHours: BusinessHours[],
    specialHours: SpecialBusinessHours[],
    slotDuration: number = 30
  ): string[] {
    const hours = this.getOpeningHours(date, businessHours, specialHours);
    if (!hours || !hours.openTime || !hours.closeTime) {
      return [];
    }

    const slots: string[] = [];
    const openMinutes = this.timeToMinutes(hours.openTime);
    const closeMinutes = this.timeToMinutes(hours.closeTime);

    for (let time = openMinutes; time < closeMinutes; time += slotDuration) {
      slots.push(this.minutesToTime(time));
    }

    return slots;
  },

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  isValidTimeSlot(time: string, openTime: string, closeTime: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const openMinutes = this.timeToMinutes(openTime);
    const closeMinutes = this.timeToMinutes(closeTime);
    
    return timeMinutes >= openMinutes && timeMinutes < closeMinutes;
  }
};