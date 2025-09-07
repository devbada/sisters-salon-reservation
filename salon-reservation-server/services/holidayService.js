const holidaysKr = require('holidays-kr');
const db = require('../db/database');

/**
 * Korean Holiday Service using holidays-kr library
 * A more reliable and comprehensive Korean holiday data source
 */
class HolidayService {
  constructor() {
    // holidays-kr 라이브러리 설정
    this.holidaysApi = holidaysKr.default;
    // 데이터베이스 prepared statements
    this.insertHoliday = db.prepare(`
      INSERT OR REPLACE INTO holidays 
      (date, name, type, is_substitute, is_closed, description, api_response, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    this.getHolidaysByYearQuery = db.prepare(`
      SELECT * FROM holidays 
      WHERE date LIKE ? 
      ORDER BY date ASC
    `);
    
    this.getHolidayByDateQuery = db.prepare(`
      SELECT * FROM holidays 
      WHERE date = ?
    `);
    
    this.getUpcomingHolidaysQuery = db.prepare(`
      SELECT * FROM holidays 
      WHERE date >= date('now') 
      ORDER BY date ASC 
      LIMIT ?
    `);
  }

  /**
   * 특정 연도의 한국 공휴일 데이터를 holidays-kr에서 가져오기
   * @param {number} year - 조회할 연도
   * @returns {Promise<Array>} 공휴일 데이터 배열
   */
  async fetchHolidaysFromLibrary(year = new Date().getFullYear()) {
    try {
      console.log(`🔄 Fetching Korean holidays for year ${year} using holidays-kr...`);
      
      // holidays-kr에서 해당 연도의 공휴일 가져오기
      const holidays = await this.holidaysApi.getHolidays(year);
      
      return holidays.map(holiday => {
        const date = this.formatDate(holiday.date);
        const type = this.getHolidayType(holiday.type || holiday.name);
        
        return {
          date,
          name: holiday.name,
          type,
          isSubstitute: holiday.type === 'substitute' || holiday.name.includes('대체'),
          isClosed: true, // 기본적으로 공휴일은 휴무
          description: `${type} - ${holiday.name}`,
          apiResponse: JSON.stringify({
            originalData: holiday,
            source: 'holidays-kr',
            version: require('holidays-kr/package.json').version
          })
        };
      });
      
    } catch (error) {
      console.error(`❌ Failed to fetch holidays for ${year}:`, error.message);
      return [];
    }
  }

  /**
   * 날짜 객체를 YYYY-MM-DD 형식으로 변환
   * @param {Date|string} date - 날짜 객체 또는 문자열
   * @returns {string} YYYY-MM-DD 형식 날짜
   */
  formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // 이미 문자열인 경우 그대로 반환
    if (typeof date === 'string') {
      return date;
    }
    
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * 공휴일 타입 분류
   * @param {string} holidayName - 공휴일명
   * @returns {string} 한국어 공휴일 타입
   */
  getHolidayType(holidayName) {
    // 대표적인 공휴일 타입 분류
    const typeMap = {
      '신정': '국경일',
      '설날': '국경일',
      '삼일절': '국경일',
      '어린이날': '국경일',
      '부처님오신날': '국경일',
      '현충일': '국경일',
      '광복절': '국경일',
      '개천절': '국경일',
      '한글날': '국경일',
      '성탄절': '국경일',
      '기독탄신일': '국경일',
      '추석': '국경일',
      '대체공휴일': '대체공휴일',
      '임시공휴일': '임시공휴일'
    };
    
    // 정확히 일치하는 이름이 있는지 확인
    for (const [name, type] of Object.entries(typeMap)) {
      if (holidayName.includes(name)) {
        return type;
      }
    }
    
    // 대체공휴일 패턴 확인
    if (holidayName.includes('대체') || holidayName.includes('substitute')) {
      return '대체공휴일';
    }
    
    // 임시공휴일 패턴 확인
    if (holidayName.includes('임시')) {
      return '임시공휴일';
    }
    
    return '공휴일';
  }

  /**
   * 공휴일 데이터를 데이터베이스에 저장
   * @param {Array} holidays - 공휴일 데이터 배열
   * @returns {number} 저장된 공휴일 수
   */
  async saveHolidays(holidays) {
    try {
      let savedCount = 0;
      
      const transaction = db.transaction((holidays) => {
        for (const holiday of holidays) {
          this.insertHoliday.run(
            holiday.date,
            holiday.name,
            holiday.type,
            holiday.isSubstitute ? 1 : 0,
            holiday.isClosed ? 1 : 0,
            holiday.description,
            holiday.apiResponse
          );
          savedCount++;
        }
      });
      
      transaction(holidays);
      
      console.log(`✅ Saved ${savedCount} holidays to database`);
      return savedCount;
      
    } catch (error) {
      console.error('❌ Error saving holidays to database:', error);
      throw error;
    }
  }

  /**
   * 특정 연도의 공휴일 동기화
   * @param {number} year - 동기화할 연도
   * @returns {Promise<Object>} 동기화 결과
   */
  async syncHolidays(year = new Date().getFullYear()) {
    try {
      console.log(`🚀 Starting holiday sync for year ${year} using holidays-kr`);
      
      const holidays = await this.fetchHolidaysFromLibrary(year);
      
      if (holidays.length === 0) {
        console.log(`ℹ️ No holidays found for year ${year}`);
        return { success: true, year, count: 0, message: 'No holidays to sync' };
      }
      
      const savedCount = await this.saveHolidays(holidays);
      
      console.log(`✅ Holiday sync completed for ${year}: ${savedCount} holidays`);
      
      return {
        success: true,
        year,
        count: savedCount,
        message: `Successfully synced ${savedCount} holidays using holidays-kr`
      };
      
    } catch (error) {
      console.error(`❌ Holiday sync failed for ${year}:`, error.message);
      
      return {
        success: false,
        year,
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * 특정 연도의 공휴일 조회
   * @param {number} year - 조회할 연도
   * @returns {Array} 공휴일 목록
   */
  getHolidaysByYear(year) {
    try {
      return this.getHolidaysByYearQuery.all(`${year}%`);
    } catch (error) {
      console.error('❌ Error getting holidays by year:', error);
      return [];
    }
  }

  /**
   * 특정 날짜의 공휴일 여부 확인
   * @param {string} date - YYYY-MM-DD 형식 날짜
   * @returns {Object|null} 공휴일 정보 또는 null
   */
  getHolidayByDate(date) {
    try {
      return this.getHolidayByDateQuery.get(date);
    } catch (error) {
      console.error('❌ Error getting holiday by date:', error);
      return null;
    }
  }

  /**
   * 오늘이 공휴일인지 확인
   * @returns {Object|null} 공휴일 정보 또는 null
   */
  getTodaysHoliday() {
    const today = new Date().toISOString().split('T')[0];
    return this.getHolidayByDate(today);
  }

  /**
   * 다가오는 공휴일 조회
   * @param {number} limit - 조회할 공휴일 수 (기본값: 5)
   * @returns {Array} 다가오는 공휴일 목록
   */
  getUpcomingHolidays(limit = 5) {
    try {
      return this.getUpcomingHolidaysQuery.all(limit);
    } catch (error) {
      console.error('❌ Error getting upcoming holidays:', error);
      return [];
    }
  }

  /**
   * holidays-kr 라이브러리를 사용하여 실시간으로 공휴일 확인
   * @param {string} date - YYYY-MM-DD 형식 날짜 (선택사항)
   * @returns {boolean} 공휴일 여부
   */
  async isHolidayRealTime(date = null) {
    try {
      const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
      const holidays = await this.holidaysApi.getHolidays(year);
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      return holidays.some(holiday => {
        const holidayDate = this.formatDate(holiday.date);
        return holidayDate === targetDate;
      });
    } catch (error) {
      console.error('❌ Error checking holiday in real-time:', error);
      return false;
    }
  }

  /**
   * holidays-kr 라이브러리에서 직접 공휴일 정보 조회
   * @param {number} year - 조회할 연도
   * @returns {Array} 원본 공휴일 데이터
   */
  async getHolidaysRealTime(year = new Date().getFullYear()) {
    try {
      return await this.holidaysApi.getHolidays(year);
    } catch (error) {
      console.error('❌ Error getting holidays in real-time:', error);
      return [];
    }
  }

  /**
   * 동기화 상태 확인
   * @returns {Object} 동기화 상태 정보
   */
  async getSyncStatus() {
    try {
      const currentYear = new Date().getFullYear();
      const currentYearHolidays = this.getHolidaysByYear(currentYear);
      const nextYearHolidays = this.getHolidaysByYear(currentYear + 1);
      
      const lastUpdate = db.prepare(`
        SELECT MAX(updated_at) as last_update 
        FROM holidays 
        WHERE date >= ?
      `).get(`${currentYear}-01-01`);
      
      // holidays-kr 라이브러리에서 실시간으로 가져온 데이터
      const realTimeCurrentYear = await this.getHolidaysRealTime(currentYear);
      const realTimeNextYear = await this.getHolidaysRealTime(currentYear + 1);
      
      return {
        database: {
          currentYear: {
            year: currentYear,
            count: currentYearHolidays.length,
            holidays: currentYearHolidays
          },
          nextYear: {
            year: currentYear + 1,
            count: nextYearHolidays.length,
            holidays: nextYearHolidays
          },
          lastUpdate: lastUpdate?.last_update
        },
        realTime: {
          currentYear: {
            year: currentYear,
            count: realTimeCurrentYear.length,
            holidays: realTimeCurrentYear
          },
          nextYear: {
            year: currentYear + 1,
            count: realTimeNextYear.length,
            holidays: realTimeNextYear
          }
        },
        libraryVersion: require('holidays-kr/package.json').version,
        dataSource: 'holidays-kr (https://github.com/hyunbinseo/holidays-kr)'
      };
      
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * 데이터베이스와 실시간 데이터 동기화 필요성 확인
   * @param {number} year - 확인할 연도
   * @returns {Object} 동기화 필요성 분석 결과
   */
  async checkSyncNeeded(year = new Date().getFullYear()) {
    try {
      const dbHolidays = this.getHolidaysByYear(year);
      const realTimeHolidays = await this.getHolidaysRealTime(year);
      
      const syncNeeded = dbHolidays.length !== realTimeHolidays.length;
      
      return {
        year,
        syncNeeded,
        database: {
          count: dbHolidays.length,
          holidays: dbHolidays.map(h => ({ date: h.date, name: h.name }))
        },
        realTime: {
          count: realTimeHolidays.length,
          holidays: realTimeHolidays.map(h => ({ date: this.formatDate(h.date), name: h.name }))
        },
        recommendation: syncNeeded ? 'Database sync recommended' : 'Database is up to date'
      };
      
    } catch (error) {
      console.error('❌ Error checking sync status:', error);
      return {
        error: error.message
      };
    }
  }
}

module.exports = HolidayService;