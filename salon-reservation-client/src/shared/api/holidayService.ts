import { apiClient } from './apiClient';
import { BusinessHoliday, LegacyBusinessHoliday } from '~/shared/lib/types';

// Response types matching the backup implementation
export interface HolidayResponse {
  success: boolean;
  count: number;
  holidays: LegacyBusinessHoliday[];
  year?: number;
  error?: string;
}

class HolidayService {
  /**
   * 전체 공휴일 목록 조회
   */
  async getHolidays(year?: number, limit?: number): Promise<HolidayResponse> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get(`/holidays?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      return {
        success: false,
        count: 0,
        holidays: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 특정 연도의 공휴일 조회
   */
  async getHolidaysByYear(year: number): Promise<HolidayResponse> {
    try {
      const response = await apiClient.get(`/holidays/${year}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching holidays for ${year}:`, error);
      return {
        success: false,
        count: 0,
        holidays: [],
        year,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 특정 날짜의 공휴일 확인
   */
  async getHolidayByDate(date: string): Promise<{ 
    success: boolean; 
    isHoliday: boolean; 
    holiday: LegacyBusinessHoliday | null; 
    error?: string 
  }> {
    try {
      const response = await apiClient.get(`/holidays/date/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking holiday for ${date}:`, error);
      return {
        success: false,
        isHoliday: false,
        holiday: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 오늘이 공휴일인지 확인
   */
  async getTodaysHoliday(): Promise<{
    success: boolean;
    isHoliday: boolean;
    today: string;
    holiday: LegacyBusinessHoliday | null;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/holidays/today');
      return response.data;
    } catch (error) {
      console.error('Error checking today holiday:', error);
      return {
        success: false,
        isHoliday: false,
        today: new Date().toISOString().split('T')[0],
        holiday: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 날짜가 공휴일인지 빠르게 확인 (캐시된 데이터 사용)
   */
  isHolidayFromCache(date: string, holidays: LegacyBusinessHoliday[]): { 
    isHoliday: boolean; 
    holiday?: LegacyBusinessHoliday 
  } {
    const holiday = holidays.find(h => h.date === date);
    return {
      isHoliday: !!holiday,
      holiday
    };
  }

  /**
   * 공휴일 목록을 날짜별 Map으로 변환 (빠른 조회용)
   */
  createHolidayMap(holidays: LegacyBusinessHoliday[]): Map<string, LegacyBusinessHoliday> {
    return new Map(holidays.map(holiday => [holiday.date, holiday]));
  }

  /**
   * Legacy 타입을 현재 타입으로 변환
   */
  convertLegacyToModern(legacy: LegacyBusinessHoliday): BusinessHoliday {
    return {
      id: legacy.id?.toString() || '',
      date: legacy.date,
      name: legacy.name,
      type: legacy.type === 'public' ? 'public' : 'custom',
      isRecurring: legacy.is_recurring,
      isClosed: legacy.is_closed,
      isSubstitute: legacy.is_substitute,
      notes: legacy.description
    };
  }

  /**
   * 현재 타입을 Legacy 타입으로 변환
   */
  convertModernToLegacy(modern: BusinessHoliday): LegacyBusinessHoliday {
    return {
      id: parseInt(modern.id) || undefined,
      date: modern.date,
      name: modern.name,
      type: modern.type,
      is_recurring: modern.isRecurring || false,
      is_closed: modern.isClosed,
      is_substitute: modern.isSubstitute,
      description: modern.notes
    };
  }
}

// 싱글톤 인스턴스 생성
export const holidayService = new HolidayService();
export default holidayService;