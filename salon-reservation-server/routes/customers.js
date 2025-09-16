const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// 고객 목록 조회 (검색 및 필터링 지원)
router.get('/', (req, res) => {
  try {
    const { search, vip, sortBy = 'name', order = 'ASC', limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, name, phone, email, birthdate, gender, preferred_stylist, 
             preferred_service, allergies, vip_status, vip_level, total_visits, 
             last_visit_date, created_at, updated_at
      FROM customers 
      WHERE 1=1
    `;
    const params = [];
    
    // 검색 조건
    if (search) {
      query += ` AND (name LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // VIP 필터
    if (vip !== undefined) {
      query += ` AND vip_status = ?`;
      params.push(vip === 'true' ? 1 : 0);
    }
    
    // 정렬
    const validSortFields = ['name', 'created_at', 'last_visit_date', 'total_visits'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    
    query += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // 페이지네이션
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const customers = db.prepare(query).all(...params);
    
    // 총 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (name LIKE ? OR phone LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (vip !== undefined) {
      countQuery += ` AND vip_status = ?`;
      countParams.push(vip === 'true' ? 1 : 0);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams);
    
    res.json({
      customers,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + customers.length) < total
      }
    });
  } catch (error) {
    console.error('고객 목록 조회 오류:', error);
    res.status(500).json({ error: '고객 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 고객 상세 조회
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = db.prepare(`
      SELECT id, name, phone, email, birthdate, gender, preferred_stylist, 
             preferred_service, allergies, vip_status, vip_level, total_visits, 
             last_visit_date, notes, created_at, updated_at
      FROM customers 
      WHERE id = ?
    `).get(id);
    
    if (!customer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    
    // 고객 메모 조회
    const customerNotes = db.prepare(`
      SELECT id, note, is_important, created_by, created_at
      FROM customer_notes 
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `).all(id);
    
    customer.notes = customerNotes;
    
    res.json(customer);
  } catch (error) {
    console.error('고객 조회 오류:', error);
    res.status(500).json({ error: '고객 조회 중 오류가 발생했습니다.' });
  }
});

// 고객 등록
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      birthdate,
      gender,
      preferredStylist,
      preferredService,
      allergies,
      vipStatus = false,
      vipLevel = 0,
      notes
    } = req.body;
    
    // 필수 필드 검증
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수 입력 항목입니다.' });
    }
    
    // 전화번호 중복 체크
    const existingCustomer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
    if (existingCustomer) {
      return res.status(409).json({ error: '이미 등록된 전화번호입니다.' });
    }
    
    const insertCustomer = db.prepare(`
      INSERT INTO customers (
        name, phone, email, birthdate, gender, preferred_stylist, preferred_service,
        allergies, vip_status, vip_level, total_visits, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const result = insertCustomer.run(
      name,
      phone,
      email || null,
      birthdate || null,
      gender || null,
      preferredStylist || null,
      preferredService || null,
      allergies || null,
      vipStatus ? 1 : 0,
      vipLevel || 0
    );
    
    // 노트가 있으면 추가
    if (notes && notes.trim()) {
      const insertNote = db.prepare(`
        INSERT INTO customer_notes (customer_id, note, created_by, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      insertNote.run(result.lastInsertRowid, notes.trim(), req.user.username);
    }
    
    // 생성된 고객 정보 반환
    const newCustomer = db.prepare(`
      SELECT id, name, phone, email, birthdate, gender, preferred_stylist, 
             preferred_service, allergies, vip_status, vip_level, total_visits, 
             last_visit_date, created_at, updated_at
      FROM customers 
      WHERE id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: '고객이 성공적으로 등록되었습니다.',
      customer: newCustomer
    });
  } catch (error) {
    console.error('고객 등록 오류:', error);
    res.status(500).json({ error: '고객 등록 중 오류가 발생했습니다.' });
  }
});

// 고객 정보 수정
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      birthdate,
      gender,
      preferredStylist,
      preferredService,
      allergies,
      vipStatus,
      vipLevel
    } = req.body;
    
    // 필수 필드 검증
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수 입력 항목입니다.' });
    }
    
    // 고객 존재 확인
    const existingCustomer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
    if (!existingCustomer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    
    // 전화번호 중복 체크 (본인 제외)
    const duplicateCustomer = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone, id);
    if (duplicateCustomer) {
      return res.status(409).json({ error: '이미 등록된 전화번호입니다.' });
    }
    
    const updateCustomer = db.prepare(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, birthdate = ?, gender = ?, 
          preferred_stylist = ?, preferred_service = ?, allergies = ?, 
          vip_status = ?, vip_level = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateCustomer.run(
      name,
      phone,
      email || null,
      birthdate || null,
      gender || null,
      preferredStylist || null,
      preferredService || null,
      allergies || null,
      vipStatus ? 1 : 0,
      vipLevel || 0,
      id
    );
    
    // 업데이트된 고객 정보 반환
    const updatedCustomer = db.prepare(`
      SELECT id, name, phone, email, birthdate, gender, preferred_stylist, 
             preferred_service, allergies, vip_status, vip_level, total_visits, 
             last_visit_date, created_at, updated_at
      FROM customers 
      WHERE id = ?
    `).get(id);
    
    res.json({
      message: '고객 정보가 성공적으로 수정되었습니다.',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('고객 수정 오류:', error);
    res.status(500).json({ error: '고객 수정 중 오류가 발생했습니다.' });
  }
});

// 고객 삭제
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // 고객 존재 확인
    const existingCustomer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
    if (!existingCustomer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    
    // 트랜잭션으로 고객과 관련 데이터 삭제
    const transaction = db.transaction(() => {
      // 고객 메모 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
      db.prepare('DELETE FROM customer_notes WHERE customer_id = ?').run(id);
      
      // 고객 삭제
      db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    });
    
    transaction();
    
    res.json({ message: '고객이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('고객 삭제 오류:', error);
    res.status(500).json({ error: '고객 삭제 중 오류가 발생했습니다.' });
  }
});

// 고객 방문 이력 조회
router.get('/:id/history', (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    // 고객 존재 확인
    const customer = db.prepare('SELECT id, name FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    
    // 예약 기록을 방문 이력으로 조회 (customer_id로 직접 매칭, completed 상태만)
    const history = db.prepare(`
      SELECT _id, date, time, stylist, serviceType, status, createdAt
      FROM reservations
      WHERE customer_id = ? AND status = 'completed'
      ORDER BY date DESC, time DESC
      LIMIT ? OFFSET ?
    `).all(id, parseInt(limit), parseInt(offset));
    
    // 총 방문 횟수 조회 (completed 상태만)
    const { total } = db.prepare(`
      SELECT COUNT(*) as total FROM reservations WHERE customer_id = ? AND status = 'completed'
    `).get(id);
    
    res.json({
      customer: {
        id: customer.id,
        name: customer.name
      },
      history,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + history.length) < total
      }
    });
  } catch (error) {
    console.error('방문 이력 조회 오류:', error);
    res.status(500).json({ error: '방문 이력 조회 중 오류가 발생했습니다.' });
  }
});

// 고객 메모 추가
router.post('/:id/notes', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { note, isImportant = false } = req.body;
    
    if (!note || !note.trim()) {
      return res.status(400).json({ error: '메모 내용은 필수 입력 항목입니다.' });
    }
    
    // 고객 존재 확인
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ error: '고객을 찾을 수 없습니다.' });
    }
    
    const insertNote = db.prepare(`
      INSERT INTO customer_notes (customer_id, note, is_important, created_by, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const result = insertNote.run(id, note.trim(), isImportant ? 1 : 0, req.user.username);
    
    // 생성된 메모 반환
    const newNote = db.prepare(`
      SELECT id, note, is_important, created_by, created_at
      FROM customer_notes 
      WHERE id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({
      message: '메모가 성공적으로 추가되었습니다.',
      note: newNote
    });
  } catch (error) {
    console.error('메모 추가 오류:', error);
    res.status(500).json({ error: '메모 추가 중 오류가 발생했습니다.' });
  }
});

// 고객 메모 삭제
router.delete('/:id/notes/:noteId', authenticateToken, (req, res) => {
  try {
    const { id, noteId } = req.params;
    
    // 메모 존재 확인 및 고객 소속 확인
    const note = db.prepare(`
      SELECT id FROM customer_notes 
      WHERE id = ? AND customer_id = ?
    `).get(noteId, id);
    
    if (!note) {
      return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
    }
    
    db.prepare('DELETE FROM customer_notes WHERE id = ?').run(noteId);
    
    res.json({ message: '메모가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('메모 삭제 오류:', error);
    res.status(500).json({ error: '메모 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;