# Hair Salon Reservation Client

React와 TypeScript로 구현된 헤어 살롱 예약 시스템의 프론트엔드입니다.

## 📋 개요

이 클라이언트 애플리케이션은 헤어 살롱 고객들이 온라인으로 예약을 하고 관리할 수 있는 웹 인터페이스를 제공합니다. 직관적인 사용자 인터페이스와 반응형 디자인으로 데스크탑과 모바일 모든 환경에서 사용 가능합니다.

## 🛠 기술 스택

- **React 19.1.0** - UI 프레임워크
- **TypeScript 4.9.5** - 정적 타입 체크
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Axios 1.6.2** - HTTP 클라이언트
- **Create React App 5.0.1** - React 개발 환경
- **Testing Library** - 테스트 유틸리티

## ✨ 주요 기능

### 🔐 인증 시스템
- **관리자 로그인**: JWT 토큰 기반 인증
- **관리자 등록**: 최초 관리자 계정 생성
- **세션 관리**: 자동 로그인 유지 및 보안 로그아웃

### 📅 예약 관리
- **예약 생성**: 고객 정보, 날짜, 시간, 스타일리스트, 서비스 선택
- **예약 조회**: 날짜별 필터링 및 테이블 표시
- **예약 수정**: 실시간 정보 업데이트
- **예약 삭제**: 안전한 예약 제거
- **상태 관리**: 5단계 예약 상태 (대기/확정/완료/취소/노쇼)
- **중복 예약 표시**: 동일 디자이너 시간대 중복 시각화
- **달력 뷰**: 월별 예약 현황 및 밀도 표시

### 👥 고객 관리
- **고객 등록**: 상세 정보 및 선호도 관리
- **고객 검색**: 실시간 자동완성 검색
- **방문 이력**: 고객별 예약 히스토리
- **VIP 관리**: VIP 등급 및 혜택 관리

### 👨‍🎨 디자이너 관리
- **디자이너 등록**: 프로필 및 전문분야 관리
- **활성 상태 관리**: 디자이너 근무 상태 제어
- **성과 분석**: 디자이너별 예약 통계

### 🕐 영업시간 관리
- **기본 영업시간**: 요일별 영업시간 설정
- **특별 영업시간**: 특정 날짜 임시 변경
- **공휴일 관리**: 자동 공휴일 동기화
- **휴무일 설정**: 개별 휴무일 관리

### 📊 통계 대시보드
- **종합 통계**: 실시간 비즈니스 지표
- **시각화 차트**: 다양한 형태의 데이터 차트
- **성장률 분석**: 기간별 성장 추이
- **히트맵**: 시간대별 예약 패턴

### 🎨 사용자 경험
- **글라스모피즘 디자인**: 현대적 유리 효과 UI
- **반응형 디자인**: 모바일 우선 설계
- **다크 모드**: 시스템 설정 연동 테마
- **해시 라우팅**: 브라우저 히스토리 지원
- **키보드 접근성**: 완전한 키보드 네비게이션
- **실시간 검증**: 폼 입력 데이터 즉시 검증

## 📁 프로젝트 구조

```
salon-reservation-client/
├── public/                 # 정적 파일들
│   ├── index.html
│   └── ...
├── src/
│   ├── components/         # React 컴포넌트 (25개)
│   │   ├── AdminRegister.tsx       # 관리자 등록
│   │   ├── AppLayout.tsx           # 앱 레이아웃
│   │   ├── AppointmentForm.tsx     # 예약 폼
│   │   ├── BusinessHours.tsx       # 영업시간 관리
│   │   ├── Calendar.tsx            # 달력 컴포넌트
│   │   ├── ConflictBadge.tsx       # 중복 예약 표시
│   │   ├── CustomerManagement.tsx  # 고객 관리
│   │   ├── DesignerManagement.tsx  # 디자이너 관리
│   │   ├── Header.tsx              # 헤더 네비게이션
│   │   ├── LoginForm.tsx           # 로그인 폼
│   │   ├── ReservationTable.tsx    # 예약 테이블
│   │   ├── StatisticsDashboard.tsx # 통계 대시보드
│   │   └── ...
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── ReservationsPage.tsx    # 예약 관리 페이지
│   │   ├── CustomersPage.tsx       # 고객 관리 페이지
│   │   ├── DesignersPage.tsx       # 디자이너 관리 페이지
│   │   ├── BusinessHoursPage.tsx   # 영업시간 관리 페이지
│   │   └── StatisticsPage.tsx      # 통계 페이지
│   ├── shared/             # 공통 코드
│   │   ├── api/            # API 클라이언트
│   │   ├── ui/             # 공통 UI 컴포넌트
│   │   └── lib/            # 유틸리티 라이브러리
│   ├── types/              # TypeScript 타입 정의
│   │   └── customer.ts     # 고객 관련 타입
│   ├── utils/              # 유틸리티 함수
│   ├── contexts/           # React 컨텍스트
│   ├── hooks/              # 커스텀 훅
│   ├── services/           # 비즈니스 로직
│   ├── mocks/              # 테스트용 목 데이터
│   ├── styles/             # 글로벌 스타일
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── AppContent.tsx     # 앱 콘텐츠 관리
│   ├── AppRouter.tsx      # 라우팅 설정
│   ├── index.tsx          # 앱 진입점
│   └── index.css          # 글로벌 CSS
├── tailwind.config.js     # Tailwind CSS 설정
├── postcss.config.js      # PostCSS 설정
└── package.json
```

## 🚀 시작하기

### 전제조건

- Node.js 16.x 이상
- npm 또는 yarn

### 설치

```bash
cd salon-reservation-client
npm install
```

### Tailwind CSS 설정

Tailwind CSS는 이미 설정되어 있지만, 필요한 경우 다시 설치:

```bash
npm install -D tailwindcss postcss autoprefixer
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

**중요**: 서버가 `http://localhost:4000`에서 실행되고 있는지 확인하세요 (프록시 설정됨).

## 📡 API 연동

이 클라이언트는 다음 서버 엔드포인트와 통신합니다:

- `GET http://localhost:4000/api/reservations` - 예약 목록 조회
- `POST http://localhost:4000/api/reservations` - 새 예약 생성
- `DELETE http://localhost:4000/api/reservations/:id` - 예약 삭제

### 프록시 설정

`package.json`에 프록시가 설정되어 있습니다:
```json
"proxy": "http://localhost:4000"
```

## 🧪 테스트

### 테스트 실행

```bash
npm test
```

### 테스트 파일

- `src/App.test.tsx` - 메인 앱 컴포넌트 테스트

## 🏗 빌드

### 프로덕션 빌드

```bash
npm run build
```

빌드 파일은 `build/` 폴더에 생성됩니다.

### 빌드 파일 서빙

```bash
# 정적 서버로 빌드 파일 서빙
npx serve -s build
```

## 📱 핵심 컴포넌트

### 🔑 인증 컴포넌트
- **LoginForm**: JWT 기반 관리자 로그인
- **AdminRegister**: 최초 관리자 계정 생성
- **ProtectedRoute**: 인증된 사용자만 접근 가능

### 📅 예약 관리 컴포넌트
- **AppointmentForm**: 예약 생성/수정 폼 (유효성 검증 포함)
- **ReservationTable**: 예약 목록 테이블 (상태별 필터링)
- **Calendar**: 월별 예약 현황 달력 뷰
- **ConflictBadge**: 중복 예약 시각적 표시
- **ReservationStatusBadge**: 예약 상태 표시 및 변경
- **SearchFilter**: 실시간 예약 검색 및 필터링

### 👥 고객 관리 컴포넌트
- **CustomerManagement**: 고객 정보 CRUD 관리
- **CustomerForm**: 고객 등록/수정 폼
- **CustomerList**: 고객 목록 및 검색
- **CustomerProfile**: 고객 상세 정보 및 히스토리
- **CustomerSearchInput**: 자동완성 고객 검색

### 👨‍🎨 디자이너 관리 컴포넌트
- **DesignerManagement**: 디자이너 정보 관리
- **DesignerForm**: 디자이너 등록/수정 폼
- **DesignerTable**: 디자이너 목록 테이블

### 🕐 영업시간 관리 컴포넌트
- **BusinessHours**: 영업시간 설정 및 관리

### 📊 통계 컴포넌트
- **StatisticsDashboard**: 종합 통계 대시보드
- **StatCard**: 개별 통계 카드

### 🎨 레이아웃 컴포넌트
- **AppLayout**: 전체 앱 레이아웃
- **Header**: 상단 네비게이션 헤더
- **NavigationTabs**: 탭 기반 페이지 네비게이션
- **AppWrapper**: 앱 전체 래퍼

## ✅ 해결된 주요 이슈

1. **✅ API 경로 통일**: 모든 API가 `/api/` 접두사로 통일됨
2. **✅ 데이터 필드 통일**: UUID 기반 `_id` 시스템으로 표준화
3. **✅ CRUD 기능 완성**: 모든 생성/수정/삭제 작업이 서버와 동기화
4. **✅ 인증 시스템**: JWT 기반 완전한 인증 시스템 구현
5. **✅ 상태 관리**: 예약 상태 관리 시스템 완성
6. **✅ 실시간 검증**: 폼 입력 데이터 즉시 유효성 검사
7. **✅ 반응형 디자인**: 모바일/태블릿/데스크탑 완벽 지원

## 🔧 현재 개선 영역

### 🚀 성능 최적화
- **캘린더 컴포넌트**: 깜빡임 현상 최적화 진행 중
- **메모이제이션**: React.memo 및 useMemo 활용 개선

### 🧪 테스트 확장
- **E2E 테스트**: Playwright 기반 자동화 테스트
- **단위 테스트**: 핵심 컴포넌트 테스트 커버리지 확장
- **통합 테스트**: API 연동 테스트 보완

### 🏗️ 아키텍처 개선
- **FSD 마이그레이션**: Feature-Sliced Design 아키텍처 적용 계획
- **타입 안전성**: TypeScript 엄격 모드 적용
- **코드 분할**: 페이지별 동적 임포트 최적화

## 🎨 스타일링

이 프로젝트는 Tailwind CSS를 사용하여 스타일링되었습니다:

- **색상**: Blue (primary), Gray (neutral), Red (danger)
- **글꼴**: 기본 시스템 폰트
- **레이아웃**: 반응형 그리드 및 플렉스박스
- **컴포넌트**: 카드 스타일, 버튼, 폼 입력 요소

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 생성해주세요.
