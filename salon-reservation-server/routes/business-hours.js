const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Prepared statements for better performance
const getBusinessHours = db.prepare('SELECT * FROM business_hours ORDER BY day_of_week');
const getBusinessHoursByDay = db.prepare('SELECT * FROM business_hours WHERE day_of_week = ?');
const updateBusinessHours = db.prepare(`
  UPDATE business_hours 
  SET open_time = ?, close_time = ?, is_closed = ?, break_start = ?, break_end = ?, updated_at = CURRENT_TIMESTAMP 
  WHERE day_of_week = ?
`);

const getHolidays = db.prepare('SELECT * FROM holidays ORDER BY date');
const addHoliday = db.prepare(`
  INSERT INTO holidays (date, reason, is_recurring) 
  VALUES (?, ?, ?)
`);
const deleteHoliday = db.prepare('DELETE FROM holidays WHERE id = ?');

const getSpecialHours = db.prepare('SELECT * FROM special_hours WHERE date = ?');
const addSpecialHours = db.prepare(`
  INSERT OR REPLACE INTO special_hours (date, open_time, close_time, reason) 
  VALUES (?, ?, ?, ?)
`);
const deleteSpecialHours = db.prepare('DELETE FROM special_hours WHERE id = ?');

// GET /api/business-hours - 전체 영업 시간 조회
router.get('/', authenticateToken, (req, res) => {
  try {
    const businessHours = getBusinessHours.all();
    
    // 요일 이름 매핑
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    
    const formattedHours = businessHours.map(hour => ({
      ...hour,
      dayName: dayNames[hour.day_of_week],
      is_closed: Boolean(hour.is_closed)
    }));
    
    res.json(formattedHours);
  } catch (error) {
    console.error('Business hours fetch error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// PUT /api/business-hours - 영업 시간 수정 (관리자만)
router.put('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { businessHours } = req.body;
    
    if (!Array.isArray(businessHours) || businessHours.length !== 7) {
      return res.status(400).json({ error: 'Invalid business hours data' });
    }
    
    // Transaction으로 모든 변경사항을 한 번에 처리
    const transaction = db.transaction(() => {
      businessHours.forEach((hour, index) => {
        const { openTime, closeTime, isClosed, breakStart, breakEnd } = hour;
        
        // 유효성 검사
        if (!isClosed && (!openTime || !closeTime)) {
          throw new Error(`Day ${index}: Open and close times are required when not closed`);
        }
        
        if (!isClosed && openTime >= closeTime) {
          throw new Error(`Day ${index}: Close time must be after open time`);
        }
        
        if (breakStart && breakEnd && breakStart >= breakEnd) {
          throw new Error(`Day ${index}: Break end time must be after break start time`);
        }
        
        updateBusinessHours.run(
          isClosed ? null : openTime,
          isClosed ? null : closeTime,
          isClosed ? 1 : 0,
          breakStart || null,
          breakEnd || null,
          index
        );
      });
    });
    
    transaction();
    
    // 업데이트된 데이터 반환
    const updatedHours = getBusinessHours.all();
    res.json({ 
      message: 'Business hours updated successfully',
      data: updatedHours 
    });
    
  } catch (error) {
    console.error('Business hours update error:', error);
    if (error.message.includes('Day')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Database error occurred' });
    }
  }
});

// GET /api/business-hours/holidays - 휴무일 목록 조회
router.get('/holidays', authenticateToken, (req, res) => {
  try {
    const holidays = getHolidays.all();
    res.json(holidays);
  } catch (error) {
    console.error('Holidays fetch error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// POST /api/business-hours/holidays - 휴무일 추가 (관리자만)
router.post('/holidays', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { date, reason, isRecurring } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // 날짜 형식 검증 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    const result = addHoliday.run(
      date,
      reason || null,
      isRecurring ? 1 : 0
    );
    
    res.status(201).json({
      message: 'Holiday added successfully',
      id: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Holiday creation error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Holiday already exists for this date' });
    } else {
      res.status(500).json({ error: 'Database error occurred' });
    }
  }
});

// DELETE /api/business-hours/holidays/:id - 휴무일 삭제 (관리자만)
router.delete('/holidays/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid holiday ID is required' });
    }
    
    const result = deleteHoliday.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    res.json({ message: 'Holiday deleted successfully' });
    
  } catch (error) {
    console.error('Holiday deletion error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// GET /api/business-hours/available-slots/:date - 특정 날짜의 예약 가능 시간
router.get('/available-slots/:date', authenticateToken, (req, res) => {
  try {
    const { date } = req.params;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    // 해당 날짜가 휴무일인지 확인
    const holiday = db.prepare('SELECT * FROM holidays WHERE date = ?').get(date);
    if (holiday) {
      return res.json({
        date,
        dayOfWeek,
        isHoliday: true,
        holidayReason: holiday.reason,
        availableSlots: []
      });
    }
    
    // 특별 영업 시간 확인
    const specialHour = getSpecialHours.get(date);
    let businessHour;
    
    if (specialHour) {
      businessHour = {
        open_time: specialHour.open_time,
        close_time: specialHour.close_time,
        is_closed: 0,
        break_start: null,
        break_end: null
      };
    } else {
      businessHour = getBusinessHoursByDay.get(dayOfWeek);
    }
    
    if (!businessHour || businessHour.is_closed) {
      return res.json({
        date,
        dayOfWeek,
        isClosed: true,
        availableSlots: []
      });
    }
    
    // 30분 단위 시간 슬롯 생성
    const slots = generateTimeSlots(
      businessHour.open_time,
      businessHour.close_time,
      businessHour.break_start,
      businessHour.break_end
    );
    
    // 이미 예약된 시간 확인
    const existingReservations = db.prepare(
      'SELECT time FROM reservations WHERE date = ?'
    ).all(date);
    
    const bookedTimes = new Set(existingReservations.map(r => r.time));
    
    // 가용성 정보와 함께 시간 슬롯 반환
    const availableSlots = slots.map(slot => ({
      time: slot,
      isAvailable: !bookedTimes.has(slot),
      reason: bookedTimes.has(slot) ? '이미 예약됨' : null
    }));
    
    res.json({
      date,
      dayOfWeek,
      isHoliday: false,
      isClosed: false,
      specialHours: specialHour ? true : false,
      openTime: businessHour.open_time,
      closeTime: businessHour.close_time,
      breakStart: businessHour.break_start,
      breakEnd: businessHour.break_end,
      availableSlots
    });
    
  } catch (error) {
    console.error('Available slots fetch error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// 30분 단위 시간 슬롯 생성 헬퍼 함수
function generateTimeSlots(openTime, closeTime, breakStart, breakEnd) {
  const slots = [];
  const start = timeToMinutes(openTime);
  const end = timeToMinutes(closeTime);
  const breakStartMinutes = breakStart ? timeToMinutes(breakStart) : null;
  const breakEndMinutes = breakEnd ? timeToMinutes(breakEnd) : null;
  
  for (let minutes = start; minutes < end; minutes += 30) {
    // 점심시간 제외
    if (breakStartMinutes && breakEndMinutes && 
        minutes >= breakStartMinutes && minutes < breakEndMinutes) {
      continue;
    }
    
    slots.push(minutesToTime(minutes));
  }
  
  return slots;
}

// 시간 문자열을 분으로 변환
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// 분을 시간 문자열로 변환
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// POST /api/business-hours/special-hours - 특별 영업일 추가 (관리자만)
router.post('/special-hours', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { date, openTime, closeTime, reason } = req.body;
    
    if (!date || !openTime || !closeTime) {
      return res.status(400).json({ error: 'Date, open time, and close time are required' });
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    if (openTime >= closeTime) {
      return res.status(400).json({ error: 'Close time must be after open time' });
    }
    
    const result = addSpecialHours.run(date, openTime, closeTime, reason || null);
    
    res.status(201).json({
      message: 'Special hours added successfully',
      id: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Special hours creation error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

module.exports = router;