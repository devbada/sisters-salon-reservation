const request = require('supertest');
const app = require('../../app');
const db = require('../../db/database');

describe('Reservations API', () => {
  let authToken;

  beforeEach(async () => {
    // 관리자 생성 및 로그인
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testadmin', password: 'TestPass123!' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testadmin', password: 'TestPass123!' });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/reservations', () => {
    test('should create reservation with valid data', async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷',
        notes: '테스트 예약입니다'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.customerName).toBe('김테스트');
      expect(response.body.date).toBe('2025-09-10');
      expect(response.body.status).toBe('pending');
    });

    test('should reject reservation with missing required fields', async () => {
      const incompleteData = {
        customerName: '김테스트'
        // 필수 필드들 누락
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should reject reservation with invalid date format', async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: 'invalid-date',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(400);

      expect(response.body.error).toContain('날짜');
    });

    test('should reject reservation with invalid time format', async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '25:00', // 유효하지 않은 시간
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(400);

      expect(response.body.error).toContain('시간');
    });

    test('should reject reservation in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: yesterday.toISOString().split('T')[0],
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(400);

      expect(response.body.error).toContain('과거');
    });
  });

  describe('GET /api/reservations', () => {
    beforeEach(async () => {
      // 테스트용 예약 데이터 생성
      const reservations = [
        {
          customerName: '김테스트1',
          customerPhone: '010-1111-1111',
          date: '2025-09-10',
          time: '10:00',
          stylist: '김민주',
          serviceType: '헤어컷'
        },
        {
          customerName: '김테스트2',
          customerPhone: '010-2222-2222',
          date: '2025-09-11',
          time: '14:00',
          stylist: '박지은',
          serviceType: '펌'
        }
      ];

      for (const reservation of reservations) {
        await request(app)
          .post('/api/reservations')
          .send(reservation)
          .expect(201);
      }
    });

    test('should return all reservations', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter reservations by date', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .query({ date: '2025-09-10' })
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      response.body.forEach(reservation => {
        expect(reservation.date).toBe('2025-09-10');
      });
    });

    test('should filter reservations by stylist', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .query({ stylist: '김민주' })
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      response.body.forEach(reservation => {
        expect(reservation.stylist).toBe('김민주');
      });
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/reservations')
        .query({ page: 1, limit: 1 })
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/reservations/:id', () => {
    let reservationId;

    beforeEach(async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);

      reservationId = response.body._id;
    });

    test('should return reservation by ID', async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .expect(200);

      expect(response.body._id).toBe(reservationId);
      expect(response.body.customerName).toBe('김테스트');
    });

    test('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .get('/api/reservations/nonexistent-id')
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });
  });

  describe('PUT /api/reservations/:id', () => {
    let reservationId;

    beforeEach(async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);

      reservationId = response.body._id;
    });

    test('should update reservation with valid data', async () => {
      const updateData = {
        customerName: '김수정',
        time: '15:00',
        notes: '시간 변경 요청'
      };

      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.customerName).toBe('김수정');
      expect(response.body.time).toBe('15:00');
      expect(response.body.notes).toBe('시간 변경 요청');
    });

    test('should require authentication for updates', async () => {
      const updateData = { customerName: '김수정' };

      const response = await request(app)
        .put(`/api/reservations/${reservationId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should return 404 for non-existent reservation', async () => {
      const updateData = { customerName: '김수정' };

      const response = await request(app)
        .put('/api/reservations/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    let reservationId;

    beforeEach(async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);

      reservationId = response.body._id;
    });

    test('should delete reservation with valid ID', async () => {
      await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 삭제 확인
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .expect(404);
    });

    test('should require authentication for deletion', async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should return 404 for non-existent reservation', async () => {
      const response = await request(app)
        .delete('/api/reservations/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });
  });

  describe('POST /api/reservations/:id/status', () => {
    let reservationId;

    beforeEach(async () => {
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷'
      };

      const response = await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);

      reservationId = response.body._id;
    });

    test('should update reservation status to confirmed', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    test('should update reservation status to completed', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    test('should update reservation status to cancelled', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });

    test('should reject invalid status', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.error).toContain('유효하지 않은');
    });

    test('should require authentication for status updates', async () => {
      const response = await request(app)
        .post(`/api/reservations/${reservationId}/status`)
        .send({ status: 'confirmed' })
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });
});