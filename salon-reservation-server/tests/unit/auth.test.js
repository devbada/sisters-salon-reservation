const request = require('supertest');
const app = require('../../app');
const db = require('../../db/database');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should create new admin with valid data', async () => {
      const adminData = {
        username: 'testadmin',
        password: 'TestPass123!'  // 대소문자, 숫자, 특수문자 포함
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('생성되었습니다');
    });

    test('should reject weak passwords', async () => {
      const adminData = {
        username: 'testadmin',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(400);

      expect(response.body.error).toContain('8자 이상');
    });

    test('should prevent duplicate usernames', async () => {
      const adminData = {
        username: 'testadmin',
        password: 'TestPass123!'
      };

      // 첫 번째 등록
      await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      // 중복 등록 시도
      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(409);

      expect(response.body.error).toContain('이미 존재');
    });

    test('should require username and password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should reject empty username', async () => {
      const adminData = {
        username: '',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 테스트용 관리자 생성
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testadmin', password: 'TestPass123!' });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'TestPass123!' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin).toHaveProperty('username', 'testadmin');
      expect(response.body.admin).not.toHaveProperty('password');
    });

    test('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'wrongpass' })
        .expect(401);

      expect(response.body.error).toContain('잘못된');
    });

    test('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'TestPass123!' })
        .expect(401);

      expect(response.body.error).toContain('잘못된');
    });

    test('should require username and password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'TestPass123!' })
        .expect(200);

      expect(response.body.token).toBeTruthy();
      
      // JWT 토큰 형식 검증
      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('GET /api/auth/admin-check', () => {
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

    test('should return admin info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin).toHaveProperty('username', 'testadmin');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/admin-check')
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.error).toContain('유효하지 않은');
    });

    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/admin-check')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error).toContain('토큰');
    });
  });

  describe('Rate Limiting', () => {
    test('should block after 5 failed login attempts', async () => {
      // 테스트용 관리자 생성
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testadmin', password: 'TestPass123!' });

      // 5번의 실패한 로그인 시도
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ username: 'testadmin', password: 'wrongpass' })
          .expect(401);
      }
      
      // 6번째 시도는 차단되어야 함
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'wrongpass' })
        .expect(429);

      expect(response.body.error).toContain('시도 횟수가 초과');
    });

    test('should block after 3 registration attempts', async () => {
      // 3번의 회원가입 시도
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({ username: `testuser${i}`, password: 'TestPass123!' })
          .expect(201);
      }
      
      // 4번째 시도는 차단되어야 함
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser4', password: 'TestPass123!' })
        .expect(429);

      expect(response.body.error).toContain('시도 횟수가 초과');
    });
  });
});