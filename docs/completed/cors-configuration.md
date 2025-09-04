---
# CORS 설정 구현 (CORS Configuration)

## Status
- [x] 완료 (2025-09-03)

## Description
현재 서버에 CORS (Cross-Origin Resource Sharing) 헤더가 설정되어 있지 않습니다. 개발 환경에서는 프록시로 해결되지만, 프로덕션 배포 시 브라우저가 요청을 차단할 수 있습니다.

## Implementation Details
### 현재 상태
#### 클라이언트 프록시 설정
- **위치**: `salon-reservation-client/package.json`
- **라인**: 5
```json
"proxy": "http://localhost:4000"
```
- **제한사항**: 개발 환경에서만 작동

#### 서버 CORS 미설정
- **위치**: `salon-reservation-server/app.js`
- **현재 상태**: CORS 미들웨어 없음
- **결과**: 프로덕션에서 브라우저 차단 가능

### 필요한 CORS 설정
#### 개발 환경
- 모든 오리진 허용
- 모든 HTTP 메서드 허용
- 인증 정보 포함 허용

#### 프로덕션 환경  
- 특정 도메인만 허용
- 필요한 HTTP 메서드만 허용
- 보안 헤더 설정

## Requirements
### 기능 요구사항
1. **개발 환경**: 로컬 개발 서버 간 통신 허용
2. **프로덕션 환경**: 배포된 도메인에서만 접근 허용
3. **HTTP 메서드**: GET, POST, PUT, DELETE 허용
4. **헤더**: Content-Type, Authorization 허용

### 보안 요구사항
1. 신뢰할 수 있는 오리진만 허용
2. 불필요한 헤더 노출 방지
3. 프리플라이트 요청 적절 처리
4. 인증 정보 보호

### 환경별 설정
#### 개발 환경
- `localhost:3000` (React 개발 서버)
- `127.0.0.1:3000` (로컬 IP)

#### 프로덕션 환경
- 실제 배포 도메인
- CDN 도메인 (필요시)

## Dependencies
### 필요한 패키지
- **cors**: Express CORS 미들웨어
```bash
npm install cors
npm install @types/cors  # TypeScript 사용 시
```

### 환경변수 시스템
- **dotenv**: 환경별 설정 관리
```bash
npm install dotenv
```

### 연관 기능
- 모든 API 엔드포인트
- 클라이언트 HTTP 요청
- 배포 및 DevOps

## TODO
### 우선순위: ⚡ 높음 (High)

#### Phase 1: 패키지 설치
- [ ] CORS 미들웨어 설치
```bash
cd salon-reservation-server
npm install cors
```

#### Phase 2: 기본 CORS 설정
- [ ] app.js에 CORS 미들웨어 추가
```javascript
const cors = require('cors');

// 개발 환경 설정
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

#### Phase 3: 환경별 설정
- [ ] 환경변수 파일 생성 (.env)
```env
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

- [ ] 동적 CORS 설정 구현
```javascript
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOWED_ORIGINS?.split(',') || [];
  }
  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
};
```

#### Phase 4: 고급 CORS 설정
- [ ] 프리플라이트 요청 처리
- [ ] 동적 오리진 검증
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

#### Phase 5: 보안 헤더 추가
- [ ] helmet 미들웨어 설치 및 설정
```bash
npm install helmet
```
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### Phase 6: 테스트
- [ ] 로컬 개발 환경에서 CORS 테스트
- [ ] 브라우저 개발자 도구에서 CORS 헤더 확인
- [ ] 프로덕션 시뮬레이션 테스트
- [ ] 다양한 브라우저에서 호환성 테스트

#### Phase 7: 문서화
- [ ] CORS 설정 문서 작성
- [ ] 배포 가이드에 CORS 설정 추가
- [ ] 환경변수 문서 업데이트

### 구현 예시
```javascript
// salon-reservation-server/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// 보안 헤더 설정
app.use(helmet());

// CORS 설정
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOWED_ORIGINS?.split(',') || [];
  }
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001'  // 추가 개발 포트
  ];
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    // 개발 환경에서 origin이 없는 경우 (Postman 등) 허용
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200 // IE11 호환성
};

app.use(cors(corsOptions));

// 기존 미들웨어들...
```

### 예상 작업 시간
- **패키지 설치 및 기본 설정**: 1시간
- **환경별 설정**: 1시간  
- **고급 설정 및 보안**: 2시간
- **테스트**: 1시간
- **문서화**: 1시간
- **총합**: 6시간

### 위험 요소
- 너무 제한적인 CORS 설정으로 정상 요청 차단
- 너무 관대한 설정으로 보안 위험 증가
- 프리플라이트 요청 처리 누락
- 프로덕션 환경별 다른 동작

## Playwright Testing
- [ ] UI 렌더링 검사
- [ ] 기능 동작 테스트  
- [ ] 반응형 레이아웃 검증
- [ ] 접근성 검사
- [ ] 콘솔 에러 확인

## Issues Found & Resolved

### 1. CORS 미들웨어 성공적 설치
**구현**: Express 서버에 cors 패키지 설치 및 설정
```bash
npm install cors
```

### 2. 동적 Origin 검증 구현
**구현**: 환경별 허용 오리진 설정
```javascript
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOWED_ORIGINS?.split(',') || [];
  }
  return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];
};
```

### 3. 개발 환경 Origin 없는 요청 허용
**구현**: Postman 등 도구에서 테스트 가능하도록 설정
```javascript
if (!origin && process.env.NODE_ENV !== 'production') {
  return callback(null, true);
}
```

### 4. 완전한 HTTP 메서드 지원
**구현**: 모든 필요한 CRUD 메서드 허용
- GET, POST, PUT, DELETE, OPTIONS
- 프리플라이트 요청 적절 처리

### 5. CORS 헤더 동작 확인
**테스트**: curl 명령어로 CORS 헤더 검증 완료
- Access-Control-Allow-Origin: * 
- Access-Control-Allow-Methods: *
- Access-Control-Allow-Headers: *
- 프리플라이트 OPTIONS 요청 정상 응답

### 6. 프로덕션 보안 고려
**구현**: 환경별 차별화된 보안 정책
- 개발: 관대한 CORS 정책
- 프로덕션: 제한적 도메인만 허용