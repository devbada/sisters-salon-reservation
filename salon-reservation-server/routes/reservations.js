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
  INSERT INTO reservations (_id, customerName, date, time, stylist, serviceType, status, customer_id, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateReservation = db.prepare(`
  UPDATE reservations 
  SET customerName = ?, date = ?, time = ?, stylist = ?, serviceType = ?, customer_id = ?, updatedAt = ?
  WHERE _id = ?
`);
const deleteReservation = db.prepare('DELETE FROM reservations WHERE _id = ?');
const checkConflict = db.prepare(`
  SELECT COUNT(*) as count 
  FROM reservations 
  WHERE date = ? AND time = ? AND stylist = ? AND _id != ?
`);

// New prepared statements for conflict detection
const getAllConflicts = db.prepare(`
  SELECT date, time, stylist, COUNT(*) as conflictCount,
         GROUP_CONCAT(_id) as reservationIds,
         GROUP_CONCAT(customerName) as customerNames
  FROM reservations 
  WHERE status IN ('pending', 'confirmed')
  GROUP BY date, time, stylist 
  HAVING COUNT(*) > 1
  ORDER BY date, time
`);

const getConflictsByDate = db.prepare(`
  SELECT date, time, stylist, COUNT(*) as conflictCount,
         GROUP_CONCAT(_id) as reservationIds,
         GROUP_CONCAT(customerName) as customerNames
  FROM reservations 
  WHERE date = ? AND status IN ('pending', 'confirmed')
  GROUP BY date, time, stylist 
  HAVING COUNT(*) > 1
  ORDER BY time
`);

const getDesignerConflicts = db.prepare(`
  SELECT date, time, stylist, COUNT(*) as conflictCount,
         GROUP_CONCAT(_id) as reservationIds,
         GROUP_CONCAT(customerName) as customerNames
  FROM reservations 
  WHERE stylist = ? AND status IN ('pending', 'confirmed')
  GROUP BY date, time, stylist 
  HAVING COUNT(*) > 1
  ORDER BY date, time
`);

const getReservationsWithConflicts = db.prepare(`
  SELECT r.*,
         CASE WHEN c.conflictCount > 1 THEN 1 ELSE 0 END as hasConflict,
         COALESCE(c.conflictCount, 1) as conflictCount
  FROM reservations r
  LEFT JOIN (
    SELECT date, time, stylist, COUNT(*) as conflictCount
    FROM reservations 
    WHERE status IN ('pending', 'confirmed')
    GROUP BY date, time, stylist
  ) c ON r.date = c.date AND r.time = c.time AND r.stylist = c.stylist
  WHERE r.status IN ('pending', 'confirmed')
  ORDER BY r.date, r.time
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
const getBusinessHours = db.prepare('SELECT * FROM business_hours WHERE day_of_week = ?');
const getHolidays = db.prepare('SELECT * FROM holidays WHERE date = ?');
const getSpecialHours = db.prepare('SELECT * FROM special_hours WHERE date = ?');

// Customer management prepared statements
const findCustomerByName = db.prepare('SELECT id, name FROM customers WHERE name = ? LIMIT 1');
const findCustomerByPhone = db.prepare('SELECT id, name FROM customers WHERE phone = ? LIMIT 1');
const insertNewCustomer = db.prepare(`
  INSERT INTO customers (name, phone, total_visits, created_at, updated_at)
  VALUES (?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`);
const updateCustomerVisits = db.prepare(`
  UPDATE customers 
  SET total_visits = total_visits + 1, last_visit_date = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

// Customer helper function
function findOrCreateCustomer(customerName, customerPhone = null) {
  try {
    // 먼저 이름으로 고객을 찾아보기
    let customer = findCustomerByName.get(customerName);
    
    // 고객을 찾지 못했고 전화번호가 있다면 전화번호로 찾아보기
    if (!customer && customerPhone) {
      customer = findCustomerByPhone.get(customerPhone);
      
      // 전화번호로 찾았지만 이름이 다른 경우 이름 업데이트
      if (customer && customer.name !== customerName) {
        const updateCustomerName = db.prepare('UPDATE customers SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        updateCustomerName.run(customerName, customer.id);
        customer.name = customerName;
        console.log(`Updated customer name: ${customer.name} (ID: ${customer.id})`);
      }
    }
    
    // 고객을 찾지 못했다면 새로 생성
    if (!customer) {
      const phone = customerPhone || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const result = insertNewCustomer.run(customerName, phone);
      customer = {
        id: result.lastInsertRowid,
        name: customerName
      };
      console.log(`Created new customer: ${customerName} (ID: ${customer.id}) with phone: ${phone}`);
    } else {
      console.log(`Found existing customer: ${customerName} (ID: ${customer.id})`);
    }
    
    return customer;
  } catch (error) {
    console.error('Error in findOrCreateCustomer:', error);
    throw error;
  }
}

// Business hours helper function
function getBusinessHoursForDate(date) {
  try {
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Check for holidays first
    const holiday = getHolidays.get(date);
    if (holiday) {
      return { isClosed: true, reason: 'holiday' };
    }
    
    // Check for special hours
    const specialHours = getSpecialHours.get(date);
    if (specialHours) {
      // If both open_time and close_time are null, it means closed
      if (!specialHours.open_time || !specialHours.close_time) {
        return { isClosed: true, reason: 'special' };
      }
      return {
        isClosed: false,
        openTime: specialHours.open_time,
        closeTime: specialHours.close_time
      };
    }
    
    // Get regular business hours
    const businessHours = getBusinessHours.get(dayOfWeek);
    if (!businessHours || businessHours.is_closed) {
      return { isClosed: true, reason: 'regular' };
    }
    
    return {
      isClosed: false,
      openTime: businessHours.open_time,
      closeTime: businessHours.close_time
    };
  } catch (error) {
    console.error('Error getting business hours for date:', date, error);
    // Fallback to default hours
    return {
      isClosed: false,
      openTime: '09:00',
      closeTime: '18:00'
    };
  }
}

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
    } else if (data.date) {
      // Check business hours for the specific date
      const businessHours = getBusinessHoursForDate(data.date);
      
      if (businessHours.isClosed) {
        switch (businessHours.reason) {
          case 'holiday':
            errors.push('선택하신 날짜는 공휴일입니다.');
            break;
          case 'special':
            errors.push('선택하신 날짜는 특별 휴무일입니다.');
            break;
          default:
            errors.push('선택하신 날짜는 휴무일입니다.');
        }
      } else {
        const [hours, minutes] = data.time.split(':').map(Number);
        const requestTime = hours * 60 + minutes; // Convert to minutes
        
        const [openHours, openMinutes] = businessHours.openTime.split(':').map(Number);
        const [closeHours, closeMinutes] = businessHours.closeTime.split(':').map(Number);
        const openTime = openHours * 60 + openMinutes;
        const closeTime = closeHours * 60 + closeMinutes;
        
        if (requestTime < openTime || requestTime >= closeTime) {
          errors.push(`영업시간은 ${businessHours.openTime}-${businessHours.closeTime}입니다.`);
        }
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
  const { customerName, customerPhone, date, time, stylist, serviceType } = req.body;
  
  // Debug logging
  console.log('POST /api/reservations - Request body:', req.body);
  console.log('Extracted values:', { customerName, customerPhone, date, time, stylist, serviceType });
  
  // Validate required fields first
  if (!customerName || !date || !time || !stylist || !serviceType) {
    console.log('Missing required fields:', {
      customerName: !!customerName,
      date: !!date,
      time: !!time,
      stylist: !!stylist,
      serviceType: !!serviceType
    });
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
    // 중복 예약 허용 - 차단하지 않고 로그만 기록
    const conflict = checkConflict.get(date, time, stylist, '');
    if (conflict && conflict.count > 0) {
      console.log(`Warning: Duplicate reservation detected for ${stylist} on ${date} at ${time}, but allowing it as per requirements`);
    }
    
    // Find or create customer
    const customer = findOrCreateCustomer(customerName.trim(), customerPhone);
    
    const _id = uuidv4();
    const createdAt = new Date().toISOString();
    
    // Insert reservation with customer_id
    insertReservation.run(_id, customerName.trim(), date, time, stylist, serviceType, RESERVATION_STATUS.PENDING, customer.id, createdAt);
    
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
    
    const { customerName, customerPhone, date, time, stylist, serviceType } = req.body;
    
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
    
    // 중복 예약 허용 - 차단하지 않고 로그만 기록 (수정 시에도 허용)
    const conflict = checkConflict.get(date, time, stylist, id);
    if (conflict && conflict.count > 0) {
      console.log(`Warning: Duplicate reservation detected during update for ${stylist} on ${date} at ${time}, but allowing it as per requirements`);
    }
    
    // Find or create customer if name changed
    let customerId = existingReservation.customer_id;
    if (customerName.trim() !== existingReservation.customerName) {
      const customer = findOrCreateCustomer(customerName.trim(), customerPhone);
      customerId = customer.id;
    }
    
    const updatedAt = new Date().toISOString();
    updateReservation.run(customerName.trim(), date, time, stylist, serviceType, customerId, updatedAt, id);
    
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
      
      // If status changed to completed, update customer visit count
      if (status === RESERVATION_STATUS.COMPLETED && reservation.customer_id) {
        console.log(`Updating visit count for customer ID: ${reservation.customer_id}`);
        updateCustomerVisits.run(reservation.date, reservation.customer_id);
      }
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

// GET all conflicts
router.get('/conflicts', authenticateToken, function(req, res) {
  try {
    const { date, designer } = req.query;
    
    let conflicts;
    if (date) {
      // Get conflicts for specific date
      conflicts = getConflictsByDate.all(date);
    } else if (designer) {
      // Get conflicts for specific designer
      conflicts = getDesignerConflicts.all(designer);
    } else {
      // Get all conflicts
      conflicts = getAllConflicts.all();
    }
    
    // Format conflicts data
    const formattedConflicts = conflicts.map(conflict => ({
      date: conflict.date,
      time: conflict.time,
      stylist: conflict.stylist,
      conflictCount: conflict.conflictCount,
      reservationIds: conflict.reservationIds ? conflict.reservationIds.split(',') : [],
      customerNames: conflict.customerNames ? conflict.customerNames.split(',') : []
    }));
    
    res.json(formattedConflicts);
  } catch (error) {
    console.error('Conflicts fetch error:', error);
    res.status(500).json({ error: '중복 예약 조회 중 오류가 발생했습니다.' });
  }
});

// GET reservations with conflict information
router.get('/with-conflicts', authenticateToken, function(req, res) {
  try {
    const reservations = getReservationsWithConflicts.all();
    res.json(reservations);
  } catch (error) {
    console.error('Reservations with conflicts fetch error:', error);
    res.status(500).json({ error: '예약 목록 조회 중 오류가 발생했습니다.' });
  }
});

// POST check for potential conflicts (for real-time validation)
router.post('/check-conflict', authenticateToken, function(req, res) {
  try {
    const { date, time, stylist, excludeId } = req.body;
    
    if (!date || !time || !stylist) {
      return res.status(400).json({ 
        error: '날짜, 시간, 스타일리스트 정보가 필요합니다.' 
      });
    }
    
    const conflict = checkConflict.get(date, time, stylist, excludeId || '');
    const hasConflict = conflict && conflict.count > 0;
    
    if (hasConflict) {
      // Get conflicting reservations details
      const conflictingReservations = db.prepare(`
        SELECT _id, customerName, date, time, stylist
        FROM reservations 
        WHERE date = ? AND time = ? AND stylist = ? AND _id != ?
      `).all(date, time, stylist, excludeId || '');
      
      return res.json({
        hasConflict: true,
        conflictCount: conflict.count,
        message: `${stylist}는 ${date} ${time}에 이미 ${conflict.count}개의 예약이 있습니다.`,
        conflictingReservations
      });
    }
    
    res.json({
      hasConflict: false,
      conflictCount: 0,
      message: '중복되는 예약이 없습니다.'
    });
    
  } catch (error) {
    console.error('Conflict check error:', error);
    res.status(500).json({ error: '중복 확인 중 오류가 발생했습니다.' });
  }
});

// GET conflicts statistics (optional feature)
router.get('/conflicts/stats', authenticateToken, function(req, res) {
  try {
    // Designer-wise conflict frequency
    const designerConflicts = db.prepare(`
      SELECT stylist, COUNT(*) as conflictCount,
             MIN(date) as firstConflict,
             MAX(date) as lastConflict
      FROM (
        SELECT date, time, stylist
        FROM reservations 
        WHERE status IN ('pending', 'confirmed')
        GROUP BY date, time, stylist 
        HAVING COUNT(*) > 1
      )
      GROUP BY stylist
      ORDER BY conflictCount DESC
    `).all();
    
    // Time slot conflict patterns
    const timeSlotConflicts = db.prepare(`
      SELECT time, COUNT(*) as conflictCount
      FROM (
        SELECT date, time, stylist
        FROM reservations 
        WHERE status IN ('pending', 'confirmed')
        GROUP BY date, time, stylist 
        HAVING COUNT(*) > 1
      )
      GROUP BY time
      ORDER BY conflictCount DESC
    `).all();
    
    // Monthly conflict trends
    const monthlyConflicts = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COUNT(*) as conflictCount
      FROM (
        SELECT date, time, stylist
        FROM reservations 
        WHERE status IN ('pending', 'confirmed')
        GROUP BY date, time, stylist 
        HAVING COUNT(*) > 1
      )
      GROUP BY month
      ORDER BY month DESC
    `).all();
    
    res.json({
      designerConflicts,
      timeSlotConflicts,
      monthlyConflicts,
      summary: {
        totalConflicts: getAllConflicts.all().length,
        mostConflictedDesigner: designerConflicts[0]?.stylist || null,
        mostConflictedTime: timeSlotConflicts[0]?.time || null
      }
    });
    
  } catch (error) {
    console.error('Conflict stats error:', error);
    res.status(500).json({ error: '중복 예약 통계 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;