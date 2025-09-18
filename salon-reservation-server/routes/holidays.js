const express = require('express');
const router = express.Router();
const db = require('../db/database');
const HolidayService = require('../services/holidayService');
const holidayScheduler = require('../schedulers/holidayScheduler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Holiday service instance
const holidayService = new HolidayService();

/**
 * GET /api/holidays
 * 전체 공휴일 목록 조회
 */
router.get('/', (req, res) => {
  try {
    const { year, limit } = req.query;
    
    if (year) {
      // 특정 연도의 공휴일 조회
      const holidays = holidayService.getHolidaysByYear(parseInt(year));
      res.json({
        success: true,
        year: parseInt(year),
        count: holidays.length,
        holidays
      });
    } else {
      // 모든 공휴일 조회 (제한적)
      const currentYear = new Date().getFullYear();
      const holidays = holidayService.getHolidaysByYear(currentYear);
      const nextYearHolidays = holidayService.getHolidaysByYear(currentYear + 1);
      
      const allHolidays = [...holidays, ...nextYearHolidays];
      const limitedHolidays = limit ? allHolidays.slice(0, parseInt(limit)) : allHolidays;
      
      res.json({
        success: true,
        count: limitedHolidays.length,
        holidays: limitedHolidays
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting holidays:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/today
 * 오늘이 공휴일인지 확인
 */
router.get('/today', (req, res) => {
  try {
    const holiday = holidayService.getTodaysHoliday();
    
    if (holiday) {
      res.json({
        success: true,
        isHoliday: true,
        today: new Date().toISOString().split('T')[0],
        holiday
      });
    } else {
      res.json({
        success: true,
        isHoliday: false,
        today: new Date().toISOString().split('T')[0],
        holiday: null
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking today holiday:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/:year
 * 특정 연도의 공휴일 조회
 */
router.get('/:year', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year parameter'
      });
    }
    
    const holidays = holidayService.getHolidaysByYear(year);
    
    res.json({
      success: true,
      year,
      count: holidays.length,
      holidays
    });
    
  } catch (error) {
    console.error('❌ Error getting holidays by year:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/date/:date
 * 특정 날짜의 공휴일 조회
 */
router.get('/date/:date', (req, res) => {
  try {
    const date = req.params.date;
    
    // 날짜 형식 검증 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format'
      });
    }
    
    const holiday = holidayService.getHolidayByDate(date);
    
    if (holiday) {
      res.json({
        success: true,
        isHoliday: true,
        holiday
      });
    } else {
      res.json({
        success: true,
        isHoliday: false,
        holiday: null
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting holiday by date:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/upcoming
 * 다가오는 공휴일 조회
 */
router.get('/upcoming', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const upcomingHolidays = holidayService.getUpcomingHolidays(limit);
    
    res.json({
      success: true,
      count: upcomingHolidays.length,
      holidays: upcomingHolidays
    });
    
  } catch (error) {
    console.error('❌ Error getting upcoming holidays:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/status
 * 공휴일 동기화 상태 조회
 */
router.get('/sync/status', async (req, res) => {
  try {
    const syncStatus = await holidayService.getSyncStatus();
    const schedulerStatus = holidayScheduler.getStatus();
    
    res.json({
      success: true,
      sync: syncStatus,
      scheduler: schedulerStatus
    });
    
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/holidays/sync
 * 수동 공휴일 동기화 실행
 */
router.post('/sync', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { year } = req.body;
    
    console.log('🔄 Manual holiday sync requested via API');
    
    const result = await holidayScheduler.manualSync(year);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Holiday sync completed successfully',
        result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Holiday sync failed',
        error: result.error || result.message
      });
    }
    
  } catch (error) {
    console.error('❌ Manual sync API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/holidays/:id/close
 * 특정 공휴일의 휴무 설정 변경
 */
router.put('/:id/close', authenticateToken, requireAdmin, (req, res) => {
  try {
    const holidayId = parseInt(req.params.id);
    const { isClosed } = req.body;
    
    if (isNaN(holidayId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid holiday ID'
      });
    }
    
    if (typeof isClosed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isClosed must be a boolean value'
      });
    }
    
    const updateQuery = db.prepare(`
      UPDATE holidays 
      SET is_closed = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = updateQuery.run(isClosed ? 1 : 0, holidayId);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Holiday not found'
      });
    }
    
    res.json({
      success: true,
      message: `Holiday ${isClosed ? 'closed' : 'opened'} successfully`
    });
    
  } catch (error) {
    console.error('❌ Error updating holiday close status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/holidays/calendar/:year/:month
 * 특정 년월의 달력용 공휴일 데이터 조회
 */
router.get('/calendar/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year or month parameter'
      });
    }
    
    const monthStr = month.toString().padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;
    
    const query = db.prepare(`
      SELECT * FROM holidays 
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `);
    
    const holidays = query.all(startDate, endDate);
    
    // 달력용 데이터로 변환
    const calendarData = holidays.reduce((acc, holiday) => {
      const day = parseInt(holiday.date.split('-')[2]);
      acc[day] = {
        isHoliday: true,
        name: holiday.name,
        type: holiday.type,
        isClosed: Boolean(holiday.is_closed)
      };
      return acc;
    }, {});
    
    res.json({
      success: true,
      year,
      month,
      holidays: calendarData,
      count: holidays.length
    });
    
  } catch (error) {
    console.error('❌ Error getting calendar holidays:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;