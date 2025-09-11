import { apiClient } from './base';

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD format
  name: string;
  type: string;
  is_substitute: boolean;
  is_closed: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface HolidayResponse {
  success: boolean;
  count: number;
  holidays: Holiday[];
  year?: number;
  error?: string;
}

export interface TodayHolidayResponse {
  success: boolean;
  isHoliday: boolean;
  today: string;
  holiday: Holiday | null;
  error?: string;
}

export interface SyncStatusResponse {
  success: boolean;
  sync: {
    database: {
      currentYear: {
        year: number;
        count: number;
        holidays: Holiday[];
      };
      nextYear: {
        year: number;
        count: number;
        holidays: Holiday[];
      };
      lastUpdate: string | null;
    };
    realTime?: {
      currentYear: {
        year: number;
        count: number;
        holidays: any[];
      };
      nextYear: {
        year: number;
        count: number;
        holidays: any[];
      };
    };
    libraryVersion?: string;
    dataSource?: string;
  };
  scheduler: {
    enabled: boolean;
    running: boolean;
    schedule: string;
    timezone: string;
    nextRun: string | null;
    lastSync: any;
    uptime: number;
  };
  error?: string;
}

class HolidayService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/api/holidays';
  }

  /**
   * 전체 공휴일 목록 조회
   * @param year 특정 연도 (선택사항)
   * @param limit 제한 개수 (선택사항)
   * @returns 공휴일 목록
   */
  async getHolidays(year?: number, limit?: number): Promise<HolidayResponse> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get(`${this.baseURL}?${params.toString()}`);
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
   * @param year 연도
   * @returns 해당 연도 공휴일 목록
   */
  async getHolidaysByYear(year: number): Promise<HolidayResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${year}`);
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
   * @param date YYYY-MM-DD 형식 날짜
   * @returns 공휴일 정보
   */
  async getHolidayByDate(date: string): Promise<{ success: boolean; isHoliday: boolean; holiday: Holiday | null; error?: string }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/date/${date}`);
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
   * @returns 오늘 공휴일 정보
   */
  async getTodaysHoliday(): Promise<TodayHolidayResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL}/today`);
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
   * 다가오는 공휴일 조회
   * @param limit 조회할 공휴일 수 (기본값: 5)
   * @returns 다가오는 공휴일 목록
   */
  async getUpcomingHolidays(limit: number = 5): Promise<HolidayResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL}/upcoming?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming holidays:', error);
      return {
        success: false,
        count: 0,
        holidays: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 날짜가 공휴일인지 빠르게 확인 (캐시된 데이터 사용)
   * @param date YYYY-MM-DD 형식 날짜
   * @param holidays 캐시된 공휴일 목록
   * @returns 공휴일 여부 및 정보
   */
  isHolidayFromCache(date: string, holidays: Holiday[]): { isHoliday: boolean; holiday?: Holiday } {
    const holiday = holidays.find(h => h.date === date);
    return {
      isHoliday: !!holiday,
      holiday
    };
  }

  /**
   * 공휴일 목록을 날짜별 Map으로 변환 (빠른 조회용)
   * @param holidays 공휴일 목록
   * @returns 날짜별 공휴일 Map
   */
  createHolidayMap(holidays: Holiday[]): Map<string, Holiday> {
    return new Map(holidays.map(holiday => [holiday.date, holiday]));
  }
}

// 싱글톤 인스턴스 생성
export const holidayApi = new HolidayService();

export default holidayApi;