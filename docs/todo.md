# 📋 Sister Hair Salon - 향후 개선 계획 및 TODO

> 헤어 살롱 예약 시스템의 향후 개선 계획과 할 일 목록

## 🚨 현재 제한사항 (우선순위 높음)

### 🔐 보안 취약점 해결
- [ ] **JWT 시크릿 하드코딩 제거** (Critical)
  - `routes/auth.js:9`, `middleware/auth.js:3`에서 하드코딩된 시크릿 수정
  - 환경 변수 기반으로 변경: `process.env.JWT_SECRET`
  - fallback 시크릿 제거하고 필수 환경 변수로 설정

- [ ] **CORS 설정 강화** (High)
  - 개발 환경에서도 정확한 origin 지정
  - `origin: true` → 구체적인 URL 지정

- [ ] **Token Storage 보안** (High)
  - localStorage → httpOnly 쿠키로 변경
  - XSS 공격 방지

- [ ] **Rate Limiting 추가** (High)
  - 로그인 엔드포인트 brute force 방지
  - 5회 시도 후 15분 제한

### 🧪 품질 보장
- [ ] **자동화된 테스트 부족** (Medium)
  - 현재 커버리지: ~30%
  - 목표: 80% 이상
  - Jest + Cypress 도입

- [ ] **에러 처리 개선** (Medium)
  - 일관된 에러 핸들링 시스템
  - 중앙화된 에러 처리기

## 🔧 향후 개선 계획

### 🔐 보안 및 인증 개선

#### Phase 1 (즉시 개선)
- [ ] **환경 변수 기반 JWT 시크릿 관리**
  ```bash
  # .env 파일 생성
  JWT_SECRET=your-super-secure-jwt-secret-key-here
  JWT_EXPIRES_IN=24h
  ```

- [ ] **토큰 만료 시간 조정 및 리프레시 토큰**
  - Access Token: 15분
  - Refresh Token: 7일
  - 자동 갱신 메커니즘

- [ ] **API 요청 제한 (Rate Limiting)**
  ```javascript
  const rateLimit = require('express-rate-limit');
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 5, // IP당 5회 시도
    skipSuccessfulRequests: true
  });
  ```

#### Phase 2 (중기 개선)
- [ ] **다중 관리자 계정 지원**
  - 관리자 역할 구분 (Super Admin, Admin, Staff)
  - 계정 관리 UI

- [ ] **역할 기반 접근 제어 (RBAC)**
  - 권한 매트릭스 설계
  - 미들웨어 기반 권한 검증

### 📊 기능 확장

#### Phase 1 (핵심 비즈니스 로직)
- [ ] **예약 상태 관리 시스템**
  ```sql
  -- 예약 상태 추가
  ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT 'pending';
  -- 상태: pending, confirmed, completed, cancelled, no_show
  ```
  - 상태 변경 UI
  - 상태별 필터링
  - 상태 변경 히스토리

- [ ] **고객 관리 시스템**
  ```sql
  -- 고객 테이블
  CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
  - 고객 히스토리 조회
  - 고객 선호도 관리
  - VIP 고객 관리

- [ ] **서비스 가격 관리**
  ```sql
  CREATE TABLE services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration INTEGER, -- 소요 시간 (분)
    description TEXT,
    is_active BOOLEAN DEFAULT 1
  );
  ```

#### Phase 2 (부가 기능)
- [ ] **알림 시스템**
  - 이메일 알림 (예약 확인/알림)
  - SMS 알림 연동 (Twilio/AWS SNS)
  - 푸시 알림 (웹 푸시)

- [ ] **결제 시스템 연동**
  - 토스페이먼츠/아임포트 연동
  - 선결제/후결제 옵션
  - 결제 내역 관리

- [ ] **리뷰 및 평점 시스템**
  - 5점 평점 시스템
  - 리뷰 작성/조회
  - 평점 통계

### 🎨 사용자 경험 개선

#### Phase 1 (접근성)
- [x] ~~다크 모드 지원~~ ✅ 완료
- [x] ~~키보드 접근성 개선~~ ✅ 완료

#### Phase 2 (글로벌화)
- [ ] **다국어 지원 (i18n)**
  ```javascript
  // react-i18next 도입
  const languages = ['ko', 'en', 'ja', 'zh'];
  ```
  - 한국어, 영어, 일본어, 중국어
  - 언어 변경 UI
  - 날짜/시간 현지화

- [ ] **PWA 변환 (오프라인 지원)**
  - Service Worker 등록
  - 오프라인 캐싱
  - 앱 설치 유도

#### Phase 3 (모바일)
- [ ] **모바일 앱 개발 (React Native)**
  - 코드 공유 최대화
  - 네이티브 알림
  - 앱스토어 배포

### ⚡ 성능 및 기술적 개선

#### Phase 1 (기본 최적화)
- [ ] **데이터베이스 최적화**
  ```sql
  -- 복합 인덱스 추가
  CREATE INDEX idx_reservation_date_stylist ON reservations(date, stylist);
  CREATE INDEX idx_reservation_status_date ON reservations(status, date);
  ```
  - 쿼리 성능 분석
  - 인덱싱 전략 수립

- [ ] **API 페이지네이션**
  ```javascript
  // 페이지네이션 구현
  GET /api/reservations?page=1&limit=20
  ```

- [ ] **자동화된 테스트 수트**
  - Unit Tests (Jest)
  - Integration Tests (Supertest)
  - E2E Tests (Cypress)

#### Phase 2 (고급 최적화)
- [ ] **Redis 캐싱 시스템**
  - 세션 캐시
  - API 응답 캐시
  - 통계 데이터 캐시

- [ ] **이미지 최적화 및 CDN**
  - 프로필 이미지 업로드
  - 이미지 리사이징
  - CloudFlare CDN 연동

#### Phase 3 (인프라)
- [ ] **CI/CD 파이프라인**
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  on:
    push:
      branches: [main]
  ```
  - GitHub Actions
  - 자동 테스트 + 배포
  - 롤백 시스템

- [ ] **Docker 컨테이너화**
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY . .
  RUN npm ci --only=production
  EXPOSE 4000
  CMD ["npm", "start"]
  ```

- [ ] **모니터링 시스템**
  - 로그 수집 (Winston + ELK)
  - 성능 메트릭 (Prometheus + Grafana)
  - 에러 트래킹 (Sentry)

## 📅 로드맵

### Q1 2025 (보안 & 안정성)
- [x] ~~다크모드 & 접근성~~ ✅ 완료
- [ ] JWT 보안 강화
- [ ] Rate Limiting
- [ ] 기본 테스트 수트

### Q2 2025 (비즈니스 로직)
- [ ] 예약 상태 관리
- [ ] 고객 관리 시스템
- [ ] 서비스 가격 관리
- [ ] 알림 시스템

### Q3 2025 (UX & 성능)
- [ ] 다국어 지원
- [ ] PWA 변환
- [ ] 성능 최적화
- [ ] 결제 시스템

### Q4 2025 (고도화)
- [ ] 모바일 앱
- [ ] AI 기반 추천
- [ ] 고급 분석
- [ ] 멀티 매장 지원

## 🎯 우선순위별 분류

### 🚨 Critical (보안 취약점)
1. JWT 시크릿 환경변수화
2. Rate Limiting 추가
3. CORS 설정 강화

### 🔥 High (비즈니스 핵심)
1. 예약 상태 관리
2. 고객 관리 시스템
3. 자동화된 테스트

### 📈 Medium (사용성 개선)
1. 다국어 지원
2. PWA 변환
3. 성능 최적화

### 💫 Low (부가 기능)
1. 모바일 앱
2. 결제 시스템
3. 고급 분석

## 📋 체크리스트

### 개발 전 준비사항
- [ ] 환경 변수 설정 (`.env` 파일)
- [ ] 개발/스테이징/프로덕션 환경 분리
- [ ] Git 브랜치 전략 수립
- [ ] 코드 리뷰 프로세스

### 배포 전 체크리스트
- [ ] 보안 감사 완료
- [ ] 성능 테스트 통과
- [ ] 접근성 테스트 통과
- [ ] 모든 테스트 케이스 통과
- [ ] 데이터베이스 백업 완료

---

📝 **업데이트**: 2025-09-06  
🔄 **마지막 수정**: 영업시간 API 인증 문제 해결 완료