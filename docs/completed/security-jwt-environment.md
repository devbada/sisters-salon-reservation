# 🔐 JWT 보안 강화 - 환경 변수 기반 시크릿 관리

**Priority**: 🚨 Critical  
**Phase**: 1 (즉시 개선)  
**Estimated Time**: 2-4 hours  

## 📋 현재 문제점

### 하드코딩된 JWT 시크릿
```javascript
// ❌ 현재 코드 (취약점)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
```

**위치**:
- `salon-reservation-server/routes/auth.js:9`
- `salon-reservation-server/middleware/auth.js:3`

**보안 위험**:
- 하드코딩된 fallback 시크릿으로 토큰 위조 가능
- 소스코드 노출 시 전체 인증 시스템 무력화
- Production/Development 환경 구분 없음

## ✅ 해결 방안

### 1. 환경 변수 파일 생성

```bash
# .env (루트 디렉토리)
NODE_ENV=development
JWT_SECRET=super-secure-random-256-bit-key-here-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# .env.example (템플릿)
NODE_ENV=development
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### 2. dotenv 패키지 설치
```bash
cd salon-reservation-server
npm install dotenv
```

### 3. 환경 변수 로딩 설정

```javascript
// salon-reservation-server/app.js (맨 위에 추가)
require('dotenv').config();

// 또는 bin/www에서
require('dotenv').config();
```

### 4. 보안 강화된 JWT 설정

```javascript
// routes/auth.js, middleware/auth.js 수정
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 환경 변수 검증
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

// 개발 환경에서만 경고
if (process.env.NODE_ENV !== 'production' && JWT_SECRET.includes('change-in-production')) {
  console.warn('WARNING: Using default JWT secret in development');
}
```

### 5. 강력한 시크릿 생성

```javascript
// utils/generateSecret.js (개발 도구)
const crypto = require('crypto');

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

console.log('New JWT Secret:', generateJWTSecret());
```

## 🔧 구현 단계

### Step 1: 패키지 설치 및 설정
- [ ] dotenv 패키지 설치
- [ ] .env 파일 생성
- [ ] .env.example 템플릿 생성
- [ ] .gitignore에 .env 추가

### Step 2: 코드 수정
- [ ] app.js에 dotenv 로딩 추가
- [ ] auth.js JWT_SECRET 하드코딩 제거
- [ ] middleware/auth.js JWT_SECRET 하드코딩 제거
- [ ] 환경 변수 검증 로직 추가

### Step 3: 보안 강화
- [ ] 강력한 JWT 시크릿 생성
- [ ] 토큰 만료 시간 단축 (24h → 15m)
- [ ] 환경별 설정 분리

### Step 4: 테스트
- [ ] 환경 변수 없이 실행 시 에러 확인
- [ ] 약한 시크릿 사용 시 에러 확인
- [ ] JWT 토큰 생성/검증 정상 작동 확인

## 📁 파일 구조
```
salon-reservation-server/
├── .env                    # 환경 변수 (git 제외)
├── .env.example           # 환경 변수 템플릿
├── .gitignore            # .env 추가
├── app.js                # dotenv 로딩
├── routes/auth.js        # JWT_SECRET 사용
├── middleware/auth.js    # JWT_SECRET 사용
└── utils/
    └── generateSecret.js # 시크릿 생성 도구
```

## 🧪 테스트 케이스

```javascript
// tests/security/jwt-secret.test.js
describe('JWT Secret Security', () => {
  test('should fail to start without JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    expect(() => require('../app')).toThrow();
  });

  test('should reject weak JWT secrets', () => {
    process.env.JWT_SECRET = 'weak';
    expect(() => require('../app')).toThrow();
  });

  test('should accept strong JWT secrets', () => {
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    expect(() => require('../app')).not.toThrow();
  });
});
```

## 📊 완료 기준

### 필수 요구사항
- ✅ 하드코딩된 JWT 시크릿 완전 제거
- ✅ 환경 변수 없이 서버 시작 불가
- ✅ 약한 시크릿 사용 시 경고/오류
- ✅ 개발/운영 환경 분리

### 보안 체크리스트
- [ ] .env 파일이 .gitignore에 포함됨
- [ ] JWT 시크릿 길이 32자 이상
- [ ] 환경 변수 검증 로직 존재
- [ ] 개발 환경 경고 메시지 출력

## 🔄 후속 작업

1. **Refresh Token 구현** → `todo/security-refresh-token.md`
2. **토큰 만료 시간 단축** → `todo/security-token-expiry.md`
3. **Rate Limiting 추가** → `todo/security-rate-limiting.md`

---

**Created**: 2025-09-06  
**Status**: 📋 Ready to Start  
**Assignee**: TBD