const request = require('supertest');
const app = require('../../app');
const db = require('../../db/database');

describe('Customers API', () => {
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

  describe('POST /api/customers', () => {
    test('should create customer with valid data', async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        email: 'test@example.com',
        birthdate: '1990-01-01',
        gender: 'female',
        preferredStylist: '김민주',
        preferredService: '헤어컷',
        allergies: '없음'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('김테스트');
      expect(response.body.phone).toBe('010-1234-5678');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.vipStatus).toBe(false);
      expect(response.body.totalVisits).toBe(0);
    });

    test('should create customer with minimal required data', async () => {
      const customerData = {
        name: '김최소',
        phone: '010-9999-9999'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body.name).toBe('김최소');
      expect(response.body.phone).toBe('010-9999-9999');
    });

    test('should reject customer with missing required fields', async () => {
      const incompleteData = {
        name: '김테스트'
        // 전화번호 누락
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toContain('필수');
    });

    test('should reject duplicate phone numbers', async () => {
      const customerData = {
        name: '김테스트1',
        phone: '010-1234-5678'
      };

      // 첫 번째 고객 생성
      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      // 동일한 전화번호로 두 번째 고객 생성 시도
      const duplicateData = {
        name: '김테스트2',
        phone: '010-1234-5678'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body.error).toContain('이미 존재');
    });

    test('should reject invalid phone number format', async () => {
      const customerData = {
        name: '김테스트',
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);

      expect(response.body.error).toContain('전화번호');
    });

    test('should reject invalid gender value', async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        gender: 'invalid-gender'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);

      expect(response.body.error).toContain('성별');
    });

    test('should require authentication', async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('GET /api/customers', () => {
    beforeEach(async () => {
      // 테스트용 고객 데이터 생성
      const customers = [
        {
          name: '김테스트1',
          phone: '010-1111-1111',
          email: 'test1@example.com',
          vipStatus: true
        },
        {
          name: '박테스트2',
          phone: '010-2222-2222',
          email: 'test2@example.com',
          vipStatus: false
        },
        {
          name: '이테스트3',
          phone: '010-3333-3333',
          email: 'test3@example.com',
          vipStatus: false
        }
      ];

      for (const customer of customers) {
        await request(app)
          .post('/api/customers')
          .set('Authorization', `Bearer ${authToken}`)
          .send(customer)
          .expect(201);
      }
    });

    test('should return paginated customer list', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('customers');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.customers)).toBeTruthy();
      expect(response.body.customers.length).toBeGreaterThanOrEqual(3);
    });

    test('should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(response.body.customers.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.offset).toBe(0);
    });

    test('should filter customers by search term', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: '김테스트' })
        .expect(200);

      expect(response.body.customers.length).toBeGreaterThanOrEqual(1);
      response.body.customers.forEach(customer => {
        expect(customer.name.includes('김테스트') || customer.phone.includes('김테스트')).toBeTruthy();
      });
    });

    test('should filter customers by VIP status', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ vip: 'true' })
        .expect(200);

      response.body.customers.forEach(customer => {
        expect(customer.vipStatus).toBe(true);
      });
    });

    test('should sort customers by name', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sortBy: 'name', order: 'ASC' })
        .expect(200);

      const names = response.body.customers.map(c => c.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('GET /api/customers/:id', () => {
    let customerId;

    beforeEach(async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      customerId = response.body.id;
    });

    test('should return customer by ID', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(customerId);
      expect(response.body.name).toBe('김테스트');
      expect(response.body.phone).toBe('010-1234-5678');
    });

    test('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('PUT /api/customers/:id', () => {
    let customerId;

    beforeEach(async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      customerId = response.body.id;
    });

    test('should update customer with valid data', async () => {
      const updateData = {
        name: '김수정',
        email: 'updated@example.com',
        preferredStylist: '박지은',
        vipStatus: true,
        notes: '업데이트된 메모'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('김수정');
      expect(response.body.email).toBe('updated@example.com');
      expect(response.body.preferredStylist).toBe('박지은');
      expect(response.body.vipStatus).toBe(true);
      expect(response.body.notes).toBe('업데이트된 메모');
    });

    test('should prevent phone number conflicts', async () => {
      // 다른 고객 생성
      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '다른고객', phone: '010-9999-9999' })
        .expect(201);

      // 첫 번째 고객의 전화번호를 다른 고객과 동일하게 변경 시도
      const updateData = {
        phone: '010-9999-9999'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toContain('이미 존재');
    });

    test('should return 404 for non-existent customer', async () => {
      const updateData = { name: '김수정' };

      const response = await request(app)
        .put('/api/customers/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });

    test('should require authentication', async () => {
      const updateData = { name: '김수정' };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    let customerId;

    beforeEach(async () => {
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      customerId = response.body.id;
    });

    test('should delete customer with valid ID', async () => {
      await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 삭제 확인
      await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .delete('/api/customers/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('GET /api/customers/:id/history', () => {
    let customerId;

    beforeEach(async () => {
      // 고객 생성
      const customerData = {
        name: '김테스트',
        phone: '010-1234-5678',
        email: 'test@example.com'
      };

      const customerResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      customerId = customerResponse.body.id;

      // 예약 생성 (방문 이력)
      const reservationData = {
        customerName: '김테스트',
        customerPhone: '010-1234-5678',
        customerId: customerId,
        date: '2025-09-10',
        time: '10:00',
        stylist: '김민주',
        serviceType: '헤어컷',
        status: 'completed'
      };

      await request(app)
        .post('/api/reservations')
        .send(reservationData)
        .expect(201);
    });

    test('should return customer visit history', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('serviceType');
        expect(response.body[0]).toHaveProperty('stylist');
      }
    });

    test('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/999999/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('찾을 수 없습니다');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/customers/${customerId}/history`)
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });
});