const request = require('supertest');
const app = require('../../app');
const db = require('../../db/database');

describe('Business Hours API', () => {
  let authToken;

  beforeEach(async () => {
    // 데이터베이스 초기화 확인
    const db = require('../../db/database');

    // Clean up previous test data
    try {
      db.prepare('DELETE FROM administrators WHERE username = ?').run('testadmin');
    } catch (error) {
      // Ignore error if table doesn't exist or record doesn't exist
    }

    // 기본 business_hours 데이터가 없으면 삽입
    const businessHoursCount = db.prepare('SELECT COUNT(*) as count FROM business_hours').get();
    if (businessHoursCount.count === 0) {
      const insertDefaultHours = db.prepare(`
        INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed, break_start, break_end)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Default business hours for all 7 days
      const defaultHours = [
        [0, '09:00', '18:00', 0, '12:00', '13:00'], // Sunday
        [1, '09:00', '18:00', 0, '12:00', '13:00'], // Monday
        [2, '09:00', '18:00', 0, '12:00', '13:00'], // Tuesday
        [3, '09:00', '18:00', 0, '12:00', '13:00'], // Wednesday
        [4, '09:00', '18:00', 0, '12:00', '13:00'], // Thursday
        [5, '09:00', '18:00', 0, '12:00', '13:00'], // Friday
        [6, '09:00', '18:00', 0, '12:00', '13:00']  // Saturday
      ];

      defaultHours.forEach(hours => {
        insertDefaultHours.run(...hours);
      });
    }

    // 관리자 생성 및 로그인
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testadmin', password: 'TestPass123!' });

    // Registration should succeed
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'TestPass123!' });

    // Login should succeed
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();

    authToken = loginResponse.body.token;
  });

  describe('GET /api/business-hours', () => {
    test('should return business hours for all days', async () => {
      const response = await request(app)
        .get('/api/business-hours')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(7); // 7 days of the week

      response.body.forEach((day, index) => {
        expect(day).toHaveProperty('day_of_week', index);
        expect(day).toHaveProperty('dayName');
        expect(day).toHaveProperty('is_closed');
        expect(typeof day.is_closed).toBe('boolean');
      });
    });

    test('should include day names in Korean', async () => {
      const response = await request(app)
        .get('/api/business-hours')
        .expect(200);

      const expectedDayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      
      response.body.forEach((day, index) => {
        expect(day.dayName).toBe(expectedDayNames[index]);
      });
    });
  });

  describe('PUT /api/business-hours', () => {
    test('should update business hours with valid data', async () => {
      const businessHours = [
        { openTime: null, closeTime: null, isClosed: true, breakStart: null, breakEnd: null }, // 일요일 휴무
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '12:00', breakEnd: '13:00' }, // 월요일
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '12:00', breakEnd: '13:00' }, // 화요일
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '12:00', breakEnd: '13:00' }, // 수요일
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '12:00', breakEnd: '13:00' }, // 목요일
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '12:00', breakEnd: '13:00' }, // 금요일
        { openTime: '10:00', closeTime: '17:00', isClosed: false, breakStart: null, breakEnd: null } // 토요일
      ];

      const response = await request(app)
        .put('/api/business-hours')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ businessHours })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    test('should require authentication', async () => {
      const businessHours = [
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null },
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: null, breakEnd: null }
      ];

      const response = await request(app)
        .put('/api/business-hours')
        .send({ businessHours })
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should reject invalid business hours array length', async () => {
      const businessHours = [
        { openTime: '09:00', closeTime: '18:00', isClosed: false }
        // 7개가 아닌 1개만 제공
      ];

      const response = await request(app)
        .put('/api/business-hours')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ businessHours })
        .expect(400);

      expect(response.body.error).toContain('Invalid business hours data');
    });

    test('should reject invalid time ranges', async () => {
      const businessHours = [
        { openTime: '18:00', closeTime: '09:00', isClosed: false }, // 잘못된 시간 범위
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false }
      ];

      const response = await request(app)
        .put('/api/business-hours')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ businessHours })
        .expect(400);

      expect(response.body.error).toContain('Close time must be after open time');
    });

    test('should reject invalid break time ranges', async () => {
      const businessHours = [
        { openTime: '09:00', closeTime: '18:00', isClosed: false, breakStart: '13:00', breakEnd: '12:00' }, // 잘못된 휴게시간
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false },
        { openTime: '09:00', closeTime: '18:00', isClosed: false }
      ];

      const response = await request(app)
        .put('/api/business-hours')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ businessHours })
        .expect(400);

      expect(response.body.error).toContain('Break end time must be after break start time');
    });
  });

  describe('GET /api/business-hours/holidays', () => {
    test('should return list of holidays', async () => {
      const response = await request(app)
        .get('/api/business-hours/holidays')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('POST /api/business-hours/holidays', () => {
    test('should add holiday with valid data', async () => {
      const holidayData = {
        date: '2025-12-25',
        reason: '크리스마스',
        isRecurring: false
      };

      const response = await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send(holidayData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
    });

    test('should require authentication', async () => {
      const holidayData = {
        date: '2025-12-25',
        reason: '크리스마스'
      };

      const response = await request(app)
        .post('/api/business-hours/holidays')
        .send(holidayData)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should reject invalid date format', async () => {
      const holidayData = {
        date: 'invalid-date',
        reason: '테스트'
      };

      const response = await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send(holidayData)
        .expect(400);

      expect(response.body.error).toContain('Date must be in YYYY-MM-DD format');
    });

    test('should reject duplicate holidays', async () => {
      const holidayData = {
        date: '2025-12-31',
        reason: '신정'
      };

      // 첫 번째 휴무일 추가
      await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send(holidayData)
        .expect(201);

      // 같은 날짜로 두 번째 휴무일 추가 시도
      const response = await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send(holidayData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('DELETE /api/business-hours/holidays/:id', () => {
    let holidayId;

    beforeEach(async () => {
      const holidayData = {
        date: '2025-01-01',
        reason: '신정'
      };

      const response = await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send(holidayData)
        .expect(201);

      holidayId = response.body.id;
    });

    test('should delete holiday with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/business-hours/holidays/${holidayId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');
    });

    test('should return 404 for non-existent holiday', async () => {
      const response = await request(app)
        .delete('/api/business-hours/holidays/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Holiday not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/business-hours/holidays/${holidayId}`)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('GET /api/business-hours/available-slots/:date', () => {
    test('should return available time slots for valid date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/business-hours/available-slots/${date}`)
        .expect(200);

      expect(response.body).toHaveProperty('date', date);
      expect(response.body).toHaveProperty('dayOfWeek');
      expect(response.body).toHaveProperty('availableSlots');
      expect(Array.isArray(response.body.availableSlots)).toBeTruthy();
    });

    test('should reject invalid date format', async () => {
      const response = await request(app)
        .get('/api/business-hours/available-slots/invalid-date')
        .expect(400);

      expect(response.body.error).toContain('Date must be in YYYY-MM-DD format');
    });

    test('should return empty slots for holidays', async () => {
      const holidayDate = '2025-12-25';

      // 휴무일 추가
      await request(app)
        .post('/api/business-hours/holidays')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: holidayDate, reason: '크리스마스' })
        .expect(201);

      const response = await request(app)
        .get(`/api/business-hours/available-slots/${holidayDate}`)
        .expect(200);

      expect(response.body.isHoliday).toBe(true);
      expect(response.body.availableSlots).toHaveLength(0);
    });
  });

  describe('GET /api/business-hours/special', () => {
    test('should return list of special hours', async () => {
      const response = await request(app)
        .get('/api/business-hours/special')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('POST /api/business-hours/special', () => {
    test('should add special hours with valid data', async () => {
      const specialHoursData = {
        date: '2025-12-24',
        openTime: '10:00',
        closeTime: '15:00',
        reason: '크리스마스 이브 단축 운영'
      };

      const response = await request(app)
        .post('/api/business-hours/special')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialHoursData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
    });

    test('should require authentication', async () => {
      const specialHoursData = {
        date: '2025-12-24',
        openTime: '10:00',
        closeTime: '15:00'
      };

      const response = await request(app)
        .post('/api/business-hours/special')
        .send(specialHoursData)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should require all required fields', async () => {
      const incompleteData = {
        date: '2025-12-24'
        // openTime, closeTime 누락
      };

      const response = await request(app)
        .post('/api/business-hours/special')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    test('should reject invalid date format', async () => {
      const specialHoursData = {
        date: 'invalid-date',
        openTime: '10:00',
        closeTime: '15:00'
      };

      const response = await request(app)
        .post('/api/business-hours/special')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialHoursData)
        .expect(400);

      expect(response.body.error).toContain('Date must be in YYYY-MM-DD format');
    });

    test('should reject invalid time ranges', async () => {
      const specialHoursData = {
        date: '2025-12-24',
        openTime: '15:00',
        closeTime: '10:00' // 잘못된 시간 범위
      };

      const response = await request(app)
        .post('/api/business-hours/special')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialHoursData)
        .expect(400);

      expect(response.body.error).toContain('Close time must be after open time');
    });
  });

  describe('Special Hours Integration with Available Slots', () => {
    test('should use special hours for available slots calculation', async () => {
      const specialDate = '2025-12-24';
      
      // 특별 영업시간 추가
      await request(app)
        .post('/api/business-hours/special')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: specialDate,
          openTime: '10:00',
          closeTime: '15:00',
          reason: '크리스마스 이브 단축 운영'
        })
        .expect(201);

      // 해당 날짜의 예약 가능 시간 조회
      const response = await request(app)
        .get(`/api/business-hours/available-slots/${specialDate}`)
        .expect(200);

      expect(response.body.specialHours).toBe(true);
      expect(response.body.openTime).toBe('10:00');
      expect(response.body.closeTime).toBe('15:00');
      
      // 10:00-15:00 범위 내의 30분 단위 슬롯만 있어야 함
      expect(response.body.availableSlots.length).toBeGreaterThan(0);
      response.body.availableSlots.forEach(slot => {
        const time = slot.time;
        expect(time >= '10:00' && time < '15:00').toBeTruthy();
      });
    });
  });
});