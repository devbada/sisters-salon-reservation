const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to format date for SQL queries
const formatDateForSQL = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to get date range
const getDateRange = (period) => {
  const today = new Date();
  const endDate = formatDateForSQL(today);
  let startDate;
  
  switch (period) {
    case '7days':
      startDate = formatDateForSQL(new Date(today - 7 * 24 * 60 * 60 * 1000));
      break;
    case '30days':
      startDate = formatDateForSQL(new Date(today - 30 * 24 * 60 * 60 * 1000));
      break;
    case '90days':
      startDate = formatDateForSQL(new Date(today - 90 * 24 * 60 * 60 * 1000));
      break;
    default:
      startDate = formatDateForSQL(new Date(today - 30 * 24 * 60 * 60 * 1000));
  }
  
  return { startDate, endDate };
};

// GET /api/statistics/summary - 종합 통계 요약
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // 총 예약 수
    const totalReservations = db.prepare(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
    `).get(startDate, endDate);
    
    // 일평균 예약 수
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const averagePerDay = Math.round(totalReservations.count / daysDiff);
    
    // 가장 바쁜 날
    const busiestDay = db.prepare(`
      SELECT date, COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY date 
      ORDER BY count DESC 
      LIMIT 1
    `).get(startDate, endDate);
    
    // 가장 바쁜 시간
    const busiestHour = db.prepare(`
      SELECT time, COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY time 
      ORDER BY count DESC 
      LIMIT 1
    `).get(startDate, endDate);
    
    // 최고 실적 스타일리스트
    const topStyler = db.prepare(`
      SELECT stylist, COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY stylist 
      ORDER BY count DESC 
      LIMIT 1
    `).get(startDate, endDate);
    
    // 가장 인기있는 서비스
    const topService = db.prepare(`
      SELECT serviceType, COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY serviceType 
      ORDER BY count DESC 
      LIMIT 1
    `).get(startDate, endDate);
    
    // 성장률 계산 (이전 기간 대비)
    const previousStartDate = formatDateForSQL(new Date(new Date(startDate) - daysDiff * 24 * 60 * 60 * 1000));
    const previousEndDate = formatDateForSQL(new Date(new Date(startDate) - 24 * 60 * 60 * 1000));
    
    const previousReservations = db.prepare(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE date BETWEEN ? AND ?
    `).get(previousStartDate, previousEndDate);
    
    const growthRate = previousReservations.count > 0 
      ? Math.round(((totalReservations.count - previousReservations.count) / previousReservations.count) * 100)
      : 0;
    
    res.json({
      totalReservations: totalReservations.count,
      averagePerDay,
      busiestDay: busiestDay?.date || null,
      busiestDayCount: busiestDay?.count || 0,
      busiestHour: busiestHour?.time || null,
      busiestHourCount: busiestHour?.count || 0,
      topStyler: topStyler?.stylist || null,
      topStylerCount: topStyler?.count || 0,
      topService: topService?.serviceType || null,
      topServiceCount: topService?.count || 0,
      growthRate,
      period,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching summary statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/statistics/daily - 일별 통계
router.get('/daily', authenticateToken, (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const dailyStats = db.prepare(`
      SELECT 
        date,
        COUNT(*) as totalReservations,
        GROUP_CONCAT(stylist) as stylists,
        GROUP_CONCAT(serviceType) as services,
        GROUP_CONCAT(time) as times
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY date 
      ORDER BY date ASC
    `).all(startDate, endDate);
    
    // Process data to create proper structure
    const processedStats = dailyStats.map(day => {
      const stylists = day.stylists ? day.stylists.split(',') : [];
      const services = day.services ? day.services.split(',') : [];
      const times = day.times ? day.times.split(',') : [];
      
      // Count by stylist
      const byStyler = {};
      stylists.forEach(stylist => {
        byStyler[stylist] = (byStyler[stylist] || 0) + 1;
      });
      
      // Count by service
      const byService = {};
      services.forEach(service => {
        byService[service] = (byService[service] || 0) + 1;
      });
      
      // Count by hour
      const byHour = {};
      times.forEach(time => {
        const hour = time.split(':')[0] + ':00';
        byHour[hour] = (byHour[hour] || 0) + 1;
      });
      
      return {
        date: day.date,
        totalReservations: day.totalReservations,
        byStyler,
        byService,
        byHour
      };
    });
    
    res.json({
      data: processedStats,
      period,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching daily statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/statistics/weekly - 주별 통계
router.get('/weekly', authenticateToken, (req, res) => {
  try {
    const { period = '90days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const weeklyStats = db.prepare(`
      SELECT 
        strftime('%Y-W%W', date) as week,
        MIN(date) as week_start,
        MAX(date) as week_end,
        COUNT(*) as totalReservations,
        GROUP_CONCAT(stylist) as stylists,
        GROUP_CONCAT(serviceType) as services
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY strftime('%Y-W%W', date)
      ORDER BY week ASC
    `).all(startDate, endDate);
    
    const processedStats = weeklyStats.map(week => {
      const stylists = week.stylists ? week.stylists.split(',') : [];
      const services = week.services ? week.services.split(',') : [];
      
      const byStyler = {};
      stylists.forEach(stylist => {
        byStyler[stylist] = (byStyler[stylist] || 0) + 1;
      });
      
      const byService = {};
      services.forEach(service => {
        byService[service] = (byService[service] || 0) + 1;
      });
      
      return {
        week: week.week,
        weekStart: week.week_start,
        weekEnd: week.week_end,
        totalReservations: week.totalReservations,
        byStyler,
        byService
      };
    });
    
    res.json({
      data: processedStats,
      period,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching weekly statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/statistics/monthly - 월별 통계
router.get('/monthly', authenticateToken, (req, res) => {
  try {
    const { period = '90days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const monthlyStats = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        COUNT(*) as totalReservations,
        GROUP_CONCAT(stylist) as stylists,
        GROUP_CONCAT(serviceType) as services
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `).all(startDate, endDate);
    
    const processedStats = monthlyStats.map(month => {
      const stylists = month.stylists ? month.stylists.split(',') : [];
      const services = month.services ? month.services.split(',') : [];
      
      const byStyler = {};
      stylists.forEach(stylist => {
        byStyler[stylist] = (byStyler[stylist] || 0) + 1;
      });
      
      const byService = {};
      services.forEach(service => {
        byService[service] = (byService[service] || 0) + 1;
      });
      
      return {
        month: month.month,
        totalReservations: month.totalReservations,
        byStyler,
        byService
      };
    });
    
    res.json({
      data: processedStats,
      period,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching monthly statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/statistics/heatmap - 시간대별 히트맵 데이터
router.get('/heatmap', authenticateToken, (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    const heatmapData = db.prepare(`
      SELECT 
        CASE strftime('%w', date)
          WHEN '0' THEN '일요일'
          WHEN '1' THEN '월요일'
          WHEN '2' THEN '화요일'
          WHEN '3' THEN '수요일'
          WHEN '4' THEN '목요일'
          WHEN '5' THEN '금요일'
          WHEN '6' THEN '토요일'
        END as dayOfWeek,
        strftime('%w', date) as dayIndex,
        substr(time, 1, 2) as hour,
        COUNT(*) as count
      FROM reservations 
      WHERE date BETWEEN ? AND ?
      GROUP BY strftime('%w', date), substr(time, 1, 2)
      ORDER BY dayIndex ASC, hour ASC
    `).all(startDate, endDate);
    
    res.json({
      data: heatmapData,
      period,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;