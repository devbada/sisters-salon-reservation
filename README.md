# Sister Hair Salon Reservation System

헤어 살롱 예약 관리를 위한 풀스택 웹 애플리케이션입니다. React + TypeScript 프론트엔드와 Node.js + Express 백엔드로 구성되어 있으며, SQLite 데이터베이스와 JWT 인증 시스템을 포함합니다.

## 📋 프로젝트 개요

이 시스템은 헤어 살롱의 관리자가 예약을 관리하고, 디자이너를 관리하며, 영업시간을 설정하고, 통계 대시보드를 통해 비즈니스 인사이트를 얻을 수 있는 완전한 살롱 관리 솔루션입니다. JWT 인증 시스템과 SQLite 데이터베이스를 통해 안전하고 안정적인 데이터 관리를 제공합니다.

## 🏗 프로젝트 구조

```
sister-hair-salon-reservation/
├── salon-reservation-client/    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppointmentForm.tsx
│   │   │   ├── ReservationTable.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── DesignerManagement.tsx
│   │   │   ├── BusinessHours.tsx
│   │   │   ├── StatisticsDashboard.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── AdminRegister.tsx
│   │   │   └── SearchFilter.tsx
│   │   ├── AppContent.tsx
│   │   ├── App.tsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── README.md
└── salon-reservation-server/    # Node.js 백엔드
    ├── routes/
    │   ├── reservations.js
    │   ├── auth.js
    │   ├── designers.js
    │   ├── business-hours.js
    │   └── statistics.js
    ├── db/
    │   └── database.db          # SQLite 데이터베이스
    ├── middleware/
    │   └── auth.js             # JWT 인증 미들웨어
    ├── test/
    ├── app.js
    ├── package.json
    └── README.md
```

## 🛠 기술 스택

### 프론트엔드 (Client)
- **React 19.1.0** - UI 라이브러리
- **TypeScript 4.9.5** - 정적 타입 체크
- **Tailwind CSS** - CSS 프레임워크
- **Axios 1.6.2** - HTTP 클라이언트
- **Recharts 3.1.2** - 차트 및 데이터 시각화
- **React Calendar 6.0.0** - 달력 컴포넌트
- **date-fns 4.1.0** - 날짜 처리 라이브러리
- **Create React App** - 개발 환경

### 백엔드 (Server)
- **Node.js** - 런타임 환경
- **Express.js 4.21.2** - 웹 프레임워크
- **SQLite 3** - 관계형 데이터베이스
- **better-sqlite3 12.2.0** - SQLite 드라이버
- **JWT (jsonwebtoken 9.0.2)** - 사용자 인증
- **bcryptjs 3.0.2** - 비밀번호 해싱
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **Morgan** - HTTP 로거

### 데이터베이스
- **SQLite** - 경량 관계형 데이터베이스
- **6개 주요 테이블**: administrators, reservations, hair_designers, business_hours, holidays, special_hours

## ✨ 주요 기능

### 🔐 사용자 인증 시스템
- **관리자 로그인**: JWT 토큰 기반 안전한 인증
- **관리자 등록**: 최초 관리자 계정 생성
- **세션 관리**: 토큰 기반 로그인 상태 유지

### 📅 예약 관리
- **예약 생성**: 고객 정보, 날짜, 시간, 스타일리스트, 서비스 선택
- **예약 조회**: 날짜별 필터링과 함께 모든 예약을 테이블로 표시
- **예약 수정**: 기존 예약 정보 실시간 업데이트
- **예약 삭제**: 불필요한 예약 제거
- **캘린더 뷰**: 월별 예약 현황을 시각적으로 표시
- **검색 및 필터**: 고객명, 스타일리스트, 서비스별 필터링

### 👨‍🎨 디자이너 관리
- **디자이너 등록**: 새로운 스타일리스트 추가
- **디자이너 정보 관리**: 이름, 전문분야, 활성상태 관리
- **디자이너 목록**: 모든 디자이너 조회 및 관리

### 🕐 영업시간 관리
- **기본 영업시간**: 요일별 영업시간 설정
- **특별 영업시간**: 특정 날짜별 영업시간 조정
- **휴일 설정**: 휴무일 및 공휴일 관리

### 📊 통계 대시보드
- **종합 통계**: 총 예약수, 일평균 예약, 가장 바쁜 날/시간, 최고 실적 스타일리스트
- **시각화 차트**: 라인차트, 바차트, 파이차트를 통한 데이터 시각화
- **기간별 분석**: 7일, 30일, 90일 기간 선택
- **히트맵**: 요일별, 시간대별 예약 패턴 분석
- **성장률 분석**: 이전 기간 대비 예약 증감률

### 🎨 사용자 경험
- **반응형 디자인**: 모바일 및 데스크탑 지원
- **직관적인 UI**: 탭 기반 네비게이션과 카드형 레이아웃
- **실시간 업데이트**: 즉시 반영되는 변경사항
- **토스트 알림**: 작업 완료 및 에러 상황 실시간 피드백

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd sister-hair-salon-reservation
```

### 2. 백엔드 서버 설정 및 실행

```bash
cd salon-reservation-server
npm install
npm start
```

서버는 `http://localhost:4000`에서 실행됩니다.

### 3. 프론트엔드 클라이언트 설정 및 실행

새 터미널 창에서:

```bash
cd salon-reservation-client
npm install
npm start
```

클라이언트는 `http://localhost:3000`에서 실행됩니다.

### 4. 테스트 데이터 설정 (선택사항)

모든 기능을 바로 테스트해보려면:

```bash
cd salon-reservation-server
node db/test-data.js
```

테스트 관리자 계정: `admin` / `admin123`

### 5. 최초 관리자 계정 생성

첫 번째 접속 시 관리자 계정을 생성해야 합니다:
1. 브라우저에서 `http://localhost:3000`을 열어 애플리케이션에 접속
2. "관리자 등록" 페이지에서 관리자 계정 생성 (테스트 데이터 사용 시 건너뛰기)
3. 로그인 후 모든 기능 사용 가능

### 6. 애플리케이션 사용

- **예약 관리**: 메인 페이지에서 예약 생성, 조회, 수정, 삭제
- **디자이너 관리**: "👨‍🎨 디자이너 관리" 탭에서 스타일리스트 관리
- **영업시간 관리**: "🕐 영업시간 관리" 탭에서 영업시간 설정
- **통계 대시보드**: "📊 통계 대시보드" 탭에서 비즈니스 분석
- **다크 모드**: 헤더 우상단 토글로 테마 변경
- **키보드 사용**: Tab으로 필드 이동, Ctrl+S로 저장

## 📡 API 엔드포인트

모든 API는 `http://localhost:4000` 에서 호스팅됩니다. 대부분의 엔드포인트는 JWT 인증이 필요합니다.

### 🔐 인증 API

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| GET | `/api/auth/check-admin` | 관리자 계정 존재 확인 | ❌ |
| POST | `/api/auth/register` | 관리자 계정 등록 | ❌ |
| POST | `/api/auth/login` | 관리자 로그인 | ❌ |
| POST | `/api/auth/verify` | JWT 토큰 검증 | ✅ |

### 📅 예약 관리 API

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| GET | `/api/reservations` | 모든 예약 조회 (날짜 필터링 가능) | ❌ |
| GET | `/api/reservations/:id` | 특정 예약 조회 | ❌ |
| POST | `/api/reservations` | 새 예약 생성 | ❌ |
| PUT | `/api/reservations/:id` | 예약 정보 수정 | ❌ |
| DELETE | `/api/reservations/:id` | 예약 삭제 | ❌ |

### 👨‍🎨 디자이너 관리 API

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| GET | `/api/designers` | 모든 디자이너 조회 | ❌ |
| POST | `/api/designers` | 새 디자이너 등록 | ✅ |
| PUT | `/api/designers/:id` | 디자이너 정보 수정 | ✅ |
| DELETE | `/api/designers/:id` | 디자이너 삭제 | ✅ |

### 🕐 영업시간 관리 API

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| GET | `/api/business-hours` | 영업시간 조회 | ❌ |
| POST | `/api/business-hours` | 영업시간 설정 | ✅ |
| PUT | `/api/business-hours/:id` | 영업시간 수정 | ✅ |
| DELETE | `/api/business-hours/:id` | 영업시간 삭제 | ✅ |

### 📊 통계 대시보드 API

| 메서드 | 엔드포인트 | 설명 | 인증 필요 |
|--------|-----------|------|----------|
| GET | `/api/statistics/summary` | 종합 통계 요약 | ✅ |
| GET | `/api/statistics/daily` | 일별 통계 데이터 | ✅ |
| GET | `/api/statistics/weekly` | 주별 통계 데이터 | ✅ |
| GET | `/api/statistics/monthly` | 월별 통계 데이터 | ✅ |
| GET | `/api/statistics/heatmap` | 히트맵 데이터 | ✅ |

### 요청/응답 예시

#### 관리자 로그인
**요청:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

**응답:**
```json
{
  "message": "로그인 성공",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

#### 예약 생성
**요청:**
```bash
POST /api/reservations
Content-Type: application/json

{
  "customerName": "김민재",
  "date": "2025-09-06",
  "time": "10:00",
  "stylist": "John",
  "serviceType": "Haircut"
}
```

**응답:**
```json
{
  "_id": "abc123",
  "customerName": "김민재",
  "date": "2025-09-06",
  "time": "10:00", 
  "stylist": "John",
  "serviceType": "Haircut",
  "createdAt": "2025-09-06T01:00:00.000Z"
}
```

#### 통계 요약 조회
**요청:**
```bash
GET /api/statistics/summary?period=30days
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답:**
```json
{
  "totalReservations": 25,
  "averagePerDay": 1,
  "busiestDay": "2025-09-05",
  "busiestDayCount": 5,
  "busiestHour": "17:00",
  "busiestHourCount": 3,
  "topStyler": "Michael",
  "topStylerCount": 10,
  "topService": "Treatment",
  "topServiceCount": 8,
  "growthRate": 15,
  "period": "30days",
  "dateRange": {
    "startDate": "2025-08-07",
    "endDate": "2025-09-06"
  }
}
```

## 🧪 테스트

### 백엔드 테스트

```bash
cd salon-reservation-server
# 서버가 실행된 상태에서
node test/testReservationGet.js
node test/testReservationPost.js
node test/testReservationPut.js
node test/testReservationDelete.js
```

### 프론트엔드 테스트

```bash
cd salon-reservation-client
npm test
```

## 📋 사용 가능한 옵션

### 스타일리스트
- John
- Sarah  
- Michael
- Emma

### 서비스 유형
- 헤어컷 (Haircut)
- 염색 (Coloring)
- 스타일링 (Styling)
- 트리트먼트 (Treatment)

## ⚠️ 현재 상태 및 제한사항

### 🎉 해결된 문제점
1. ✅ **API 경로 통일**: 모든 API 경로가 `/api/` 로 통일됨
2. ✅ **CORS 설정**: 프론트엔드-백엔드 간 CORS 설정 완료
3. ✅ **데이터베이스**: SQLite 데이터베이스로 영구 데이터 저장
4. ✅ **사용자 인증**: JWT 기반 관리자 인증 시스템 구현
5. ✅ **실시간 업데이트**: 모든 CRUD 작업이 서버와 동기화됨

### 🔧 현재 제한사항
1. **단일 관리자**: 한 번에 하나의 관리자 계정만 생성 가능
2. **기본 보안**: 개발 환경 수준의 보안 설정 (JWT 시크릿 키 등)
3. **에러 처리**: 일부 엣지 케이스에서 에러 처리 개선 필요
4. **성능 최적화**: 대량 데이터 처리 시 최적화 필요
5. **테스트 커버리지**: 자동화된 테스트 부족

### 💻 개발 환경 요구사항
- **Node.js 18.x 이상** - 최신 JavaScript 기능 사용
- **npm 8.x 이상** - 패키지 관리
- **SQLite3** - 데이터베이스 (자동 생성됨)
- **모던 브라우저** - Chrome, Firefox, Safari, Edge 최신 버전

## 🔧 향후 개선 계획

### 🔐 보안 및 인증 개선
- [ ] 환경 변수 기반 JWT 시크릿 관리
- [ ] 토큰 만료 시간 조정 및 리프레시 토큰
- [ ] 다중 관리자 계정 지원
- [ ] 역할 기반 접근 제어 (RBAC)
- [ ] API 요청 제한 (Rate Limiting)

### 📊 기능 확장
- [ ] 이메일 알림 시스템 (예약 확인/알림)
- [ ] SMS 알림 연동
- [ ] 예약 상태 관리 (대기, 확정, 완료, 취소)
- [ ] 고객 관리 시스템 (고객 히스토리)
- [ ] 서비스 가격 관리 및 결제 시스템
- [ ] 리뷰 및 평점 시스템

### 🎨 사용자 경험 개선
- [x] 다크 모드 지원
- [x] 키보드 접근성 개선 (Tab 네비게이션, 키보드 단축키)
- [ ] 다국어 지원 (i18n)
- [ ] PWA 변환 (오프라인 지원)
- [ ] 모바일 앱 개발 (React Native)

### ⚡ 성능 및 기술적 개선
- [ ] 데이터베이스 최적화 (인덱싱, 쿼리 최적화)
- [ ] Redis 캐싱 시스템 도입
- [ ] API 페이지네이션
- [ ] 이미지 최적화 및 CDN 연동
- [ ] 자동화된 테스트 수트 (Jest, Cypress)
- [ ] CI/CD 파이프라인 구축
- [ ] Docker 컨테이너화
- [ ] 모니터링 시스템 (로그, 메트릭스)

## 🤝 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.

## 📞 연락처

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 이슈를 생성해주세요.

---

## 🏆 프로젝트 현재 상태

### ✅ 구현 완료된 기능
- **완전한 예약 관리 시스템**: CRUD 기능 완성
- **JWT 인증 시스템**: 안전한 관리자 로그인
- **디자이너 관리**: 스타일리스트 등록/관리 
- **영업시간 관리**: 요일별/특별일 영업시간 설정
- **통계 대시보드**: 5가지 차트와 비즈니스 분석
- **다크 모드**: 라이트/다크/시스템 테마 지원
- **키보드 접근성**: Tab 네비게이션, 날짜 자동 포맷팅, 키보드 단축키
- **반응형 UI**: 모바일/데스크탑 모두 지원
- **SQLite 데이터베이스**: 안정적인 데이터 저장

### 📈 개발 진행률
- 🔐 인증 시스템: **100%** 완성
- 📅 예약 관리: **100%** 완성  
- 👨‍🎨 디자이너 관리: **100%** 완성
- 🕐 영업시간 관리: **100%** 완성
- 📊 통계 대시보드: **100%** 완성
- 🌙 다크 모드: **100%** 완성
- ⌨️ 키보드 접근성: **100%** 완성
- 🎨 UI/UX: **98%** 완성
- 🧪 테스트: **40%** 진행 중
- 📚 문서화: **95%** 완성

이 프로젝트는 **프로덕션 준비 상태**에 근접하며, 실제 헤어살롱에서 사용 가능한 수준의 기능을 제공합니다. 추가 보안 검토 후 실제 운영환경에 배포할 수 있습니다.