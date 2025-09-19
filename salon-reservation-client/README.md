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

### 🎯 예약 관리
- **예약 생성**: 고객 정보, 날짜, 시간, 스타일리스트, 서비스 유형 입력
- **예약 조회**: 모든 예약을 테이블 형태로 표시, 필터링 및 검색
- **예약 수정**: 기존 예약 정보 업데이트
- **예약 삭제**: 예약 제거
- **달력 뷰**: 월별 예약 현황 시각화
- **충돌 감지**: 중복 예약 방지 및 알림

### 👥 고객 관리
- **고객 등록**: 새 고객 정보 입력
- **고객 검색**: 이름/전화번호로 빠른 검색
- **고객 프로필**: 방문 이력 및 상세 정보 관리
- **고객 목록**: 전체 고객 데이터 조회

### 💇‍♀️ 스타일리스트 관리
- **스타일리스트 등록**: 새 스타일리스트 추가
- **스타일리스트 관리**: 정보 수정 및 삭제
- **성과 통계**: 스타일리스트별 예약 현황

### 📊 비즈니스 관리
- **영업시간 설정**: 요일별 영업시간 및 휴무일 관리
- **통계 대시보드**: 예약 현황, 매출 분석, 인기 서비스
- **관리자 기능**: 시스템 설정 및 사용자 관리

### 🛡️ 보안 및 인증
- **JWT 토큰 인증**: 안전한 로그인 시스템
- **보호된 라우트**: 인증이 필요한 페이지 접근 제어
- **세션 관리**: 자동 로그아웃 및 토큰 갱신

### 📱 사용자 경험
- **반응형 디자인**: 모바일 및 데스크탑 최적화
- **실시간 폼 검증**: 입력 데이터 유효성 검사
- **로딩 상태**: 비동기 작업 진행 상황 표시
- **에러 처리**: 사용자 친화적 오류 메시지

## 📁 프로젝트 구조

```
salon-reservation-client/
├── public/                 # 정적 파일들
│   ├── index.html
│   └── ...
├── src/
│   ├── components/         # React 컴포넌트 (25개)
│   │   ├── AdminRegister.tsx      # 관리자 등록
│   │   ├── AppLayout.tsx          # 앱 레이아웃
│   │   ├── AppointmentForm.tsx    # 예약 폼
│   │   ├── BusinessHours.tsx      # 영업시간 관리
│   │   ├── Calendar.tsx           # 예약 달력
│   │   ├── CustomerForm.tsx       # 고객 등록/수정
│   │   ├── CustomerList.tsx       # 고객 목록
│   │   ├── CustomerManagement.tsx # 고객 관리
│   │   ├── DesignerForm.tsx       # 스타일리스트 등록/수정
│   │   ├── DesignerManagement.tsx # 스타일리스트 관리
│   │   ├── LoginForm.tsx          # 로그인 폼
│   │   ├── ReservationTable.tsx   # 예약 테이블
│   │   ├── StatisticsDashboard.tsx # 통계 대시보드
│   │   └── ...
│   ├── pages/              # 페이지 컴포넌트
│   ├── shared/             # 공유 리소스
│   │   ├── api/            # API 클라이언트
│   │   ├── ui/             # 공통 UI 컴포넌트
│   │   └── lib/            # 유틸리티
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 비즈니스 로직 유틸리티
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── index.tsx           # 앱 진입점
├── tailwind.config.js      # Tailwind CSS 설정
├── postcss.config.js       # PostCSS 설정
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

## 📱 컴포넌트 상세

### AppointmentForm 컴포넌트

예약 생성 및 수정을 위한 폼 컴포넌트입니다.

**Props:**
- `onSubmit`: 폼 제출 핸들러
- `initialData?`: 수정 시 초기 데이터
- `onCancelEdit?`: 수정 취소 핸들러

**폼 필드:**
- 고객 이름 (필수)
- 날짜 (필수)
- 시간 (필수)
- 스타일리스트 선택 (필수)
- 서비스 유형 선택 (필수)

### ReservationTable 컴포넌트

예약 목록을 테이블 형태로 표시하는 컴포넌트입니다.

**Props:**
- `reservations`: 예약 데이터 배열
- `onEdit`: 수정 버튼 클릭 핸들러
- `onDelete`: 삭제 버튼 클릭 핸들러

## ⚠️ 알려진 문제점

1. **API 경로 불일치**: 클라이언트는 `/api/reservations`를 호출하지만 서버는 `/reservations`로 설정됨
2. **데이터 필드 불일치**: 클라이언트는 `_id`를, 서버는 `id`를 사용
3. **수정 기능**: 서버 API를 호출하지 않고 로컬에서만 업데이트
4. **테스트**: 실제 앱과 맞지 않는 기본 테스트 코드

## 🔧 개선 계획

- [ ] API 경로 및 데이터 필드 통일
- [ ] 수정 기능 서버 연동 완성
- [ ] 폼 검증 강화
- [ ] 로딩 상태 표시
- [ ] 에러 처리 개선
- [ ] 테스트 코드 보완
- [ ] 접근성 개선

## 🎨 스타일링

이 프로젝트는 Tailwind CSS를 사용하여 스타일링되었습니다:

- **색상**: Blue (primary), Gray (neutral), Red (danger)
- **글꼴**: 기본 시스템 폰트
- **레이아웃**: 반응형 그리드 및 플렉스박스
- **컴포넌트**: 카드 스타일, 버튼, 폼 입력 요소

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 생성해주세요.
