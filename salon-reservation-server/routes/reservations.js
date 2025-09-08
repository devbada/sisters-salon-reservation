var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const {
  generateId,
  RESERVATION_STATUS,
  validateStatusTransition,
  isValidStatus,
  getStatusName,
  requiresReason
} = require('../utils/reservationStatus');

// Prepared statements for better performance
const getAllReservations = db.prepare('SELECT * FROM reservations ORDER BY date, time');
const getReservationsByDate = db.prepare('SELECT * FROM reservations WHERE date = ? ORDER BY time');
const getReservationById = db.prepare('SELECT * FROM reservations WHERE _id = ?');
const insertReservation = db.prepare(`
  INSERT INTO reservations (_id, customerName, date, time, stylist, serviceType, status, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateReservation = db.prepare(`
  UPDATE reservations 
  SET customerName = ?, date = ?, time = ?, stylist = ?, serviceType = ?, updatedAt = ?
  WHERE _id = ?
`);
const deleteReservation = db.prepare('DELETE FROM reservations WHERE _id = ?');
const checkConflict = db.prepare(`
  SELECT COUNT(*) as count 
  FROM reservations 
  WHERE date = ? AND time = ? AND stylist = ? AND _id != ?
`);

// Status management prepared statements
const updateReservationStatus = db.prepare(`
  UPDATE reservations 
  SET status = ?, status_updated_at = CURRENT_TIMESTAMP, status_updated_by = ?, notes = ?
  WHERE _id = ?
`);
const insertStatusHistory = db.prepare(`
  INSERT INTO reservation_status_history (id, reservation_id, old_status, new_status, changed_by, reason)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const getStatusHistory = db.prepare(`
  SELECT * FROM reservation_status_history 
  WHERE reservation_id = ? 
  ORDER BY changed_at DESC
`);
const getReservationsByStatus = db.prepare('SELECT * FROM reservations WHERE status = ? ORDER BY date, time');
const getReservationsWithStatusFilter = db.prepare(`
  SELECT * FROM reservations 
  WHERE (? IS NULL OR status = ?) AND (? IS NULL OR date = ?)
  ORDER BY date, time
`);
const getActiveDesigners = db.prepare('SELECT name FROM hair_designers WHERE is_active = 1');

// Validation helper functions
function validateReservationData(data) {
  const errors = [];
  
  // Customer name validation
  if (!data.customerName || typeof data.customerName !== 'string') {
    errors.push('고객 이름이 필요합니다.');
  } else if (data.customerName.trim().length < 2) {
    errors.push('고객 이름은 2글자 이상이어야 합니다.');
  } else if (data.customerName.trim().length > 50) {
    errors.push('고객 이름은 50글자 이하여야 합니다.');
  }
  
  // Date validation
  if (!data.date || typeof data.date !== 'string') {
    errors.push('예약 날짜가 필요합니다.');
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(selectedDate.getTime())) {
      errors.push('올바른 날짜 형식이 아닙니다.');
    } else if (selectedDate < today) {
      errors.push('과거 날짜는 예약할 수 없습니다.');
    } else {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (selectedDate > maxDate) {
        errors.push('3개월 이후 예약은 불가능합니다.');
      }
    }
  }
  
  // Time validation
  if (!data.time || typeof data.time !== 'string') {
    errors.push('예약 시간이 필요합니다.');
  } else {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.push('올바른 시간 형식이 아닙니다 (HH:MM).');
    } else {
      const [hours, minutes] = data.time.split(':').map(Number);
      if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
        errors.push('영업시간은 09:00-18:00입니다.');
      }
    }
  }
  
  // Stylist validation - 데이터베이스에서 활성화된 디자이너 목록 가져오기
  if (!data.stylist || typeof data.stylist !== 'string') {
    errors.push('스타일리스트를 선택해주세요.');
  } else {
    const activeDesigners = getActiveDesigners.all();
    const validStylists = activeDesigners.map(designer => designer.name);
    
    if (!validStylists.includes(data.stylist)) {
      errors.push('유효하지 않은 스타일리스트입니다.');
    }
  }
  
  // Service type validation
  const validServices = ['Haircut', 'Coloring', 'Styling', 'Treatment'];
  if (!data.serviceType || typeof data.serviceType !== 'string') {
    errors.push('서비스 유형을 선택해주세요.');
  } else if (!validServices.includes(data.serviceType)) {
    errors.push('유효하지 않은 서비스 유형입니다.');
  }
  
  return errors;
}

// GET all reservations or filter by date/status
router.get('/', authenticateToken, function(req, res) {
  try {
    const { date, status } = req.query;
    
    let reservations;
    if (status || date) {
      // Filter by status and/or date
      reservations = getReservationsWithStatusFilter.all(status, status, date, date);
    } else {
      // Get all reservations
      reservations = getAllReservations.all();
    }
    
    res.json(reservations);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// GET a specific reservation by ID
router.get('/:id', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    const reservation = getReservationById.get(id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// POST a new reservation
router.post('/', authenticateToken, function(req, res) {
  const { customerName, date, time, stylist, serviceType } = req.body;
  
  // Validate required fields first
  if (!customerName || !date || !time || !stylist || !serviceType) {
    return res.status(400).json({ error: 'All fields are required: customerName, date, time, stylist, serviceType' });
  }
  
  // Advanced validation
  const validationErrors = validateReservationData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validationErrors 
    });
  }
  
  try {
    // Check for conflicting reservations (same stylist, date, and time)
    const conflict = checkConflict.get(date, time, stylist, '');
    
    if (conflict && conflict.count > 0) {
      return res.status(409).json({ 
        error: `${stylist}는 ${date} ${time}에 이미 예약이 있습니다.` 
      });
    }
    
    const _id = uuidv4();
    const createdAt = new Date().toISOString();
    
    insertReservation.run(_id, customerName.trim(), date, time, stylist, serviceType, RESERVATION_STATUS.PENDING, createdAt);
    
    const newReservation = getReservationById.get(_id);
    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// PUT (update) an existing reservation
router.put('/:id', authenticateToken, function(req, res) {
  const id = req.params.id;
  
  try {
    // Check if reservation exists
    const existingReservation = getReservationById.get(id);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    const { customerName, date, time, stylist, serviceType } = req.body;
    
    // Validate required fields first
    if (!customerName || !date || !time || !stylist || !serviceType) {
      return res.status(400).json({ error: 'All fields are required: customerName, date, time, stylist, serviceType' });
    }
    
    // Advanced validation
    const validationErrors = validateReservationData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Check for conflicting reservations (excluding current reservation)
    const conflict = checkConflict.get(date, time, stylist, id);
    
    if (conflict && conflict.count > 0) {
      return res.status(409).json({ 
        error: `${stylist}는 ${date} ${time}에 이미 다른 예약이 있습니다.` 
      });
    }
    
    const updatedAt = new Date().toISOString();
    updateReservation.run(customerName.trim(), date, time, stylist, serviceType, updatedAt, id);
    
    const updatedReservation = getReservationById.get(id);
    res.json(updatedReservation);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// DELETE a reservation
router.delete('/:id', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    
    // Check if reservation exists
    const reservation = getReservationById.get(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    deleteReservation.run(id);
    res.json(reservation);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// PATCH - Change reservation status
router.patch('/:id/status', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    const { status, reason, notes } = req.body;
    
    // Debug logging
    console.log('req.admin:', req.admin);
    console.log('req.user:', req.user);
    
    const adminId = req.admin ? req.admin.id : (req.user ? (req.user.adminId || req.user.id || req.user.username) : 'admin');
    
    // Validate status
    if (!status || !isValidStatus(status)) {
      return res.status(400).json({ 
        error: '유효하지 않은 상태입니다.',
        validStatuses: Object.values(RESERVATION_STATUS)
      });
    }
    
    // Check if reason is required for this status
    if (requiresReason(status) && !reason) {
      return res.status(400).json({ 
        error: `${getStatusName(status)} 상태로 변경할 때는 이유가 필요합니다.` 
      });
    }
    
    // Find existing reservation
    const reservation = getReservationById.get(id);
    if (!reservation) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    const currentStatus = reservation.status || RESERVATION_STATUS.PENDING;
    
    // Validate status transition
    if (!validateStatusTransition(currentStatus, status)) {
      return res.status(400).json({ 
        error: `${getStatusName(currentStatus)}에서 ${getStatusName(status)}로 변경할 수 없습니다.` 
      });
    }
    
    // Use transaction for atomic operations
    const transaction = db.transaction(() => {
      // Update reservation status
      updateReservationStatus.run(status, adminId, notes || null, id);
      
      // Record status change history
      const historyId = generateId();
      insertStatusHistory.run(
        historyId,
        id,
        currentStatus,
        status,
        adminId,
        reason || null
      );
    });
    
    transaction();
    
    // Return updated reservation
    const updatedReservation = getReservationById.get(id);
    res.json({
      message: `예약 상태가 ${getStatusName(status)}로 변경되었습니다.`,
      reservation: updatedReservation
    });
    
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET reservation status history
router.get('/:id/history', authenticateToken, function(req, res) {
  try {
    const id = req.params.id;
    
    // Check if reservation exists
    const reservation = getReservationById.get(id);
    if (!reservation) {
      return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    }
    
    // Get status change history
    const history = getStatusHistory.all(id);
    
    // Format history with Korean status names
    const formattedHistory = history.map(entry => ({
      ...entry,
      old_status_name: getStatusName(entry.old_status),
      new_status_name: getStatusName(entry.new_status)
    }));
    
    res.json({
      reservation: {
        id: reservation._id,
        customerName: reservation.customerName,
        date: reservation.date,
        time: reservation.time,
        currentStatus: reservation.status,
        currentStatusName: getStatusName(reservation.status)
      },
      history: formattedHistory
    });
    
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;