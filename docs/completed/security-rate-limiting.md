# 🛡️ API Rate Limiting - 무차별 대입 공격 방지

**Priority**: 🚨 Critical  
**Phase**: 1 (즉시 개선)  
**Estimated Time**: 1-2 hours  

## 📋 현재 문제점

### Rate Limiting 부재
- 로그인 엔드포인트에 요청 제한 없음
- 무차별 대입 공격(Brute Force) 취약
- API 남용 방지 메커니즘 없음

## ✅ 해결 방안

### 1. express-rate-limit 패키지 설치
```bash
cd salon-reservation-server
npm install express-rate-limit
```

### 2. Rate Limiting 미들웨어 구현

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// 로그인 전용 Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 5회 시도
  message: {
    error: '로그인 시도 횟수가 초과되었습니다. 15분 후 다시 시도해주세요.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Rate limit 정보를 `RateLimit-*` 헤더로 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
  skipSuccessfulRequests: true, // 성공한 요청은 카운터에서 제외
  keyGenerator: (req) => {
    // IP + User-Agent로 더 정확한 식별
    return req.ip + ':' + (req.get('User-Agent') || '');
  }
});

// 일반 API 전용 Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // IP당 100회 요청
  message: {
    error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 회원가입 전용 Rate Limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // IP당 3회 회원가입
  message: {
    error: '회원가입 시도 횟수가 초과되었습니다. 1시간 후 다시 시도해주세요.',
    retryAfter: '1 hour'
  }
});

module.exports = {
  loginLimiter,
  apiLimiter, 
  registerLimiter
};
```

### 3. 라우터에 적용

```javascript
// routes/auth.js
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// 로그인 엔드포인트에 적용
router.post('/login', loginLimiter, async (req, res) => {
  // ... 기존 로그인 로직
});

// 회원가입 엔드포인트에 적용  
router.post('/register', registerLimiter, async (req, res) => {
  // ... 기존 회원가입 로직
});
```

### 4. 전역 API Rate Limiting

```javascript
// app.js
const { apiLimiter } = require('./middleware/rateLimiter');

// 모든 API 요청에 기본 제한 적용
app.use('/api/', apiLimiter);
```

## 🔧 고급 설정

### 1. Redis 기반 Rate Limiting (선택사항)
```javascript
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'login_limit:'
  }),
  // ... 기타 설정
});
```

### 2. 동적 Rate Limiting
```javascript
const dynamicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // 인증된 사용자는 더 많은 요청 허용
    if (req.user) return 20;
    return 5;
  }
});
```

### 3. 화이트리스트 설정
```javascript
const trustedIPs = ['127.0.0.1', '::1']; // localhost

const limiter = rateLimit({
  skip: (req) => trustedIPs.includes(req.ip),
  // ... 기타 설정
});
```

## 🔧 구현 단계

### Step 1: 패키지 설치 및 기본 설정
- [ ] express-rate-limit 패키지 설치
- [ ] rateLimiter.js 미들웨어 파일 생성
- [ ] 기본 Rate Limiter 구현

### Step 2: 로그인 보안 강화
- [ ] 로그인 엔드포인트에 loginLimiter 적용
- [ ] 실패한 로그인만 카운트하도록 설정
- [ ] 에러 메시지 한국어화

### Step 3: API 전반 보호
- [ ] 전역 API Rate Limiter 적용
- [ ] 회원가입 Rate Limiter 적용
- [ ] 헤더 정보 표준화

### Step 4: 모니터링 및 로깅
- [ ] Rate Limiting 이벤트 로깅
- [ ] 관리자 대시보드에 차단 통계 추가
- [ ] 의심스러운 IP 자동 신고

## 📊 Rate Limiting 정책

| 엔드포인트 | 시간 창 | 최대 요청 | 대상 |
|-----------|---------|----------|------|
| `/api/auth/login` | 15분 | 5회 | IP |
| `/api/auth/register` | 1시간 | 3회 | IP |
| `/api/*` | 1분 | 100회 | IP |
| 인증된 API | 1분 | 200회 | 사용자 |

## 🧪 테스트 케이스

```javascript
// tests/security/rate-limiting.test.js
describe('Rate Limiting', () => {
  test('should block after 5 failed login attempts', async () => {
    // 5번 실패한 로그인 시도
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'wrong' })
        .expect(401);
    }
    
    // 6번째 시도는 차단되어야 함
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'wrong' })
      .expect(429);
  });

  test('should reset after window expires', async () => {
    // Rate limit 윈도우 만료 후 다시 허용
    jest.advanceTimersByTime(15 * 60 * 1000); // 15분 후
    
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'wrong' })
      .expect(401); // 차단이 아닌 일반 실패
  });
});
```

## 📊 완료 기준

### 필수 요구사항
- ✅ 로그인 엔드포인트 Rate Limiting 적용
- ✅ 무차별 대입 공격 차단 확인
- ✅ 정상 사용자 접근 방해 없음
- ✅ 적절한 에러 메시지 제공

### 보안 체크리스트
- [ ] 5회 실패 로그인 후 15분 차단
- [ ] 성공한 로그인은 카운터에서 제외
- [ ] Rate limit 정보 헤더 제공
- [ ] IP별 정확한 추적

## 🔄 후속 작업

1. **고급 보안 로깅** → `todo/security-logging.md`
2. **IP 화이트리스트 관리** → `todo/security-ip-management.md`
3. **Redis 캐시 도입** → `todo/performance-redis.md`

---

**Created**: 2025-09-06  
**Status**: 📋 Ready to Start  
**Assignee**: TBD