import { Designer, DaySchedule, WorkSchedule } from '../model/types';

export const designerUtils = {
  isWorkingToday(designer: Designer, dayOfWeek: number): boolean {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek] as keyof WorkSchedule;
    const schedule = designer.workSchedule[dayName];
    return !!schedule && !!schedule.start && !!schedule.end;
  },

  getWorkingHours(designer: Designer, dayOfWeek: number): DaySchedule | null {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek] as keyof WorkSchedule;
    return designer.workSchedule[dayName] || null;
  },

  isAvailableAtTime(designer: Designer, dayOfWeek: number, time: string): boolean {
    const schedule = this.getWorkingHours(designer, dayOfWeek);
    if (!schedule) return false;

    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(schedule.start);
    const endMinutes = this.timeToMinutes(schedule.end);

    // 기본 근무시간 체크
    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
      return false;
    }

    // 휴게시간 체크
    if (schedule.breaks) {
      for (const breakTime of schedule.breaks) {
        const breakStart = this.timeToMinutes(breakTime.start);
        const breakEnd = this.timeToMinutes(breakTime.end);
        if (timeMinutes >= breakStart && timeMinutes < breakEnd) {
          return false;
        }
      }
    }

    return true;
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

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  },

  getExperienceYears(hireDate: string): number {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  }
};