# Sister Hair Salon Reservation - 문서 개요

이 문서는 Sister Hair Salon Reservation 프로젝트의 문서 구조와 아키텍처 개요를 제공합니다.

> 📚 **상세 개발 가이드**: 코딩 컨벤션, 테스트 가이드라인, 배포 프로세스 등은 [`development-guide.md`](development-guide-for-human.md)를 참조하세요.

## 📁 문서 구조

- **`completed/`** - 완료된 개발 문서 및 명세서
- **`in-progress/`** - 진행 중인 개발 작업 문서
- **`todo/`** - 향후 개발 계획 및 할 일 목록

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: Sister Hair Salon Reservation System
- **타입**: 풀스택 웹 애플리케이션
- **목적**: 헤어 살롱 예약 관리 시스템
- **아키텍처**: 클라이언트-서버 분리형 구조

### 프로젝트 구조
```
sister-hair-salon-reservation/
├── salon-reservation-client/    # React 클라이언트
├── salon-reservation-server/    # Node.js 서버
└── docs/                        # 개발 문서
```

## 🛠 기술 스택 개요

### 핵심 기술
- **Frontend**: React 19.1.0 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + SQLite
- **인증**: JWT 토큰 기반 관리자 인증
- **테스트**: Jest, Testing Library, Playwright

> 📋 상세한 기술 스택 정보는 [`development-guide.md`](development-guide-for-human.md#기술-스택-분석)를 참조하세요.

## 🏗 아키텍처 구조

### 시스템 아키텍처
```
┌─────────────────┐    HTTP/API     ┌─────────────────┐
│  React Client   │ ──────────────► │  Express Server │
│  (Port: 3000)   │                 │  (Port: 3000)   │
│                 │ ◄────────────── │                 │
└─────────────────┘    JSON Data    └─────────────────┘
```

### 클라이언트 아키텍처
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── AppointmentForm.tsx   # 예약 폼 컴포넌트
│   └── ReservationTable.tsx  # 예약 테이블 컴포넌트
├── App.tsx             # 메인 애플리케이션 컴포넌트
├── index.tsx           # 애플리케이션 진입점
└── App.css             # 글로벌 스타일
```

### 서버 아키텍처
```
salon-reservation-server/
├── routes/             # API 라우터
│   ├── index.js       # 메인 라우터
│   ├── reservations.js # 예약 관리 API
│   └── users.js       # 사용자 관리 API
├── views/             # Pug 템플릿
├── public/            # 정적 파일
├── test/              # 테스트 파일
└── app.js             # Express 애플리케이션
```

## 💻 개발 표준

> 📋 **코딩 컨벤션**: TypeScript, React, Express.js 패턴 및 스타일 가이드는 [`development-guide.md`](development-guide-for-human.md#코딩-컨벤션)를 참조하세요.

### 주요 규칙
- **변수명**: camelCase 사용
- **컴포넌트**: 함수형 컴포넌트 + TypeScript
- **스타일링**: Tailwind CSS 클래스 순서 준수
- **API**: RESTful 패턴 및 일관된 에러 처리

## 📝 개발 프로세스

### Git 워크플로우
- **main** - 프로덕션 브랜치
- **feature/**[기능명] - 기능 개발 브랜치
- **fix/**[수정사항] - 버그 수정 브랜치

### 커밋 규칙
- `feat`: 새 기능, `fix`: 버그 수정, `docs`: 문서 변경
- 커밋 메시지: `type(scope): 간단한 설명`

> 📋 **상세 프로세스**: 브랜치 전략, 커밋 메시지 규칙, 코드 리뷰 체크리스트는 [`development-guide.md`](development-guide-for-human.md#개발-프로세스)를 참조하세요.

## 🧪 테스트 표준

### 테스트 도구
- **Frontend**: Jest + Testing Library + Playwright
- **Backend**: Supertest + Jest
- **E2E**: Playwright

### 테스트 목표
- 코드 커버리지 85% 이상
- 모든 API 엔드포인트 테스트
- UI 컴포넌트 기본 기능 검증

> 📋 **상세 테스트 가이드**: 테스트 코드 예시 및 작성 방법은 [`development-guide.md`](development-guide-for-human.md#테스트-가이드라인)를 참조하세요.

## 🐛 디버깅 도구

### 주요 도구
- **Frontend**: React DevTools, Chrome DevTools
- **Backend**: Morgan 로거, Debug 모듈
- **API**: Postman, Thunder Client

> 📋 **디버깅 가이드**: 구체적인 디버깅 방법과 로깅 패턴은 [`development-guide.md`](development-guide-for-human.md#디버깅-가이드)를 참조하세요.

## 🚀 배포 준비

### 배포 전 체크리스트
- [ ] 환경변수 설정 (JWT_SECRET 등)
- [ ] 데이터베이스 백업
- [ ] 테스트 통과 확인
- [ ] 빌드 성공 확인

> 📋 **배포 가이드**: 상세한 빌드 프로세스와 배포 체크리스트는 [`development-guide.md`](development-guide-for-human.md#배포-가이드라인)를 참조하세요.

## 🔧 성능 최적화

### 최적화 포인트
- **Frontend**: React.memo, useMemo/useCallback, 지연 로딩
- **Backend**: 압축 미들웨어, 캐싱, 쿼리 최적화
- **Database**: 인덱싱, 쿼리 튜닝

> 📋 **성능 가이드**: 구체적인 최적화 방법은 [`development-guide.md`](development-guide-for-human.md#성능-최적화)를 참조하세요.

## 📚 문서 참조

### 개발 가이드
- **[`development-guide.md`](development-guide-for-human.md)** - 코딩 컨벤션, 테스트, 배포 가이드
- **[`todo/README.md`](todo/README.md)** - 체계적 개발 워크플로우
- **[`FEATURE_SUMMARY.md`](FEATURE_SUMMARY.md)** - 전체 기능 현황

### 외부 자료
- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

> 📝 **기능 문서화 템플릿**: 새 기능 문서 작성 시 [`development-guide.md`](development-guide-for-human.md#기능-문서화-템플릿)의 템플릿을 사용하세요.

## 🔄 개발 워크플로우

모든 개발 작업은 다음 8단계 워크플로우를 따라 진행합니다:

1. **우선순위 확인**: docs/todo/ 에서 우선순위가 높은 기능 선택
2. **요구사항 파악**: 해당 .md 파일의 Requirements, Dependencies, TODO 섹션 검토
3. **git branch생성**: 요구사항 파악 후 적합한 git branch 를 생성(base branch is "main") -> 전환 후 작업
4. **규칙 준수 구현**: 현재 프로젝트 기술 스택과 코딩 컨벤션 준수
5. **MCP Playwright 검사**: UI, 기능, 반응형, 접근성, 콘솔 에러 검사
6. **문제 수정**: Playwright에서 발견된 모든 이슈 해결
7. **문서 이동**: 완성된 기능의 .md 파일을 docs/todo/ → docs/completed/ 이동
8. **결과 문서화**: 검사 결과와 해결된 이슈들을 문서에 기록
8. **진행상황 업데이트**: docs/README.md와 docs/FEATURE_SUMMARY.md 업데이트
9. **git commit**: 변경 내용 commit 후 push

---

**Last Updated**: 2025-08-27  
**Version**: 1.1.0