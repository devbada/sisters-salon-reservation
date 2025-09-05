# 🖥️ CLI 데이터베이스 초기화 시스템

**작성일**: 2025-01-04  
**완료일**: 2025-01-04  
**상태**: ✅ 완료  
**우선순위**: ⭐⭐⭐ (중간)  
**실제 소요 시간**: 1.5시간

## 📋 개요

Node.js API 서버 시작 시 사용자에게 데이터베이스 초기화 여부를 묻고, 선택에 따라 초기화를 수행한 후 서버를 시작하는 대화형 CLI 스크립트를 구현했습니다.

## 🎯 목표

- 서버 시작 시 대화형 데이터베이스 초기화 옵션 제공
- 안전한 데이터베이스 초기화 프로세스 구현
- 사용자 친화적인 CLI 인터페이스 제공
- 기존 서버 시작 프로세스와의 원활한 통합

## 🛠 기술 스택

- **Shell**: Bash script with colored output
- **Node.js**: Database initialization script
- **SQLite**: Database management via better-sqlite3
- **npm scripts**: Package.json integration

## ✅ 구현 완료 사항

### 1. 데이터베이스 초기화 스크립트 ✅
- ✅ `/scripts/initDatabase.js` 생성
- ✅ 기존 데이터 확인 로직
- ✅ 샘플 데이터 삽입 기능
- ✅ 에러 처리 및 상세 로깅
- ✅ 색상별 출력으로 가독성 향상

### 2. 대화형 CLI 스크립트 ✅
- ✅ `/scripts/start-with-init.sh` bash 스크립트 생성
- ✅ 사용자 입력 처리 (Y/N 검증)
- ✅ 색상별 출력 (성공/경고/오류/정보)
- ✅ 요구사항 검증 (파일 존재 확인)
- ✅ 시그널 처리 (SIGINT/SIGTERM)

### 3. Package.json 통합 ✅
- ✅ `start:interactive` 스크립트 추가
- ✅ `init-db` 독립 실행 스크립트 추가
- ✅ 기존 start 명령어 유지

### 4. 에러 처리 및 검증 ✅
- ✅ Node.js 버전 호환성 처리 (better-sqlite3 rebuild)
- ✅ 파일 존재 여부 검증
- ✅ 데이터베이스 연결 상태 확인
- ✅ 사용자 입력 유효성 검사

## 🔧 구현된 주요 기능

### 1. 대화형 시작 프로세스
```bash
# 대화형 모드로 서버 시작
npm run start:interactive

# 또는 직접 bash 스크립트 실행
bash scripts/start-with-init.sh
```

### 2. 데이터베이스 초기화 스크립트
```bash
# 독립적으로 데이터베이스 초기화
npm run init-db

# 또는 직접 Node.js 스크립트 실행
node scripts/initDatabase.js
```

### 3. 샘플 데이터 자동 삽입
- 기존 데이터가 없을 경우에만 샘플 예약 데이터 3건 삽입
- 고객명, 날짜, 시간, 스타일리스트, 서비스 유형 포함
- 오늘과 내일 날짜로 현실적인 샘플 데이터 생성

### 4. 색상별 출력 시스템
- 🟢 **성공**: 녹색 (✅)
- 🔴 **오류**: 빨간색 (❌)
- 🟡 **경고**: 노란색 (⚠️)
- 🔵 **정보**: 청록색 (ℹ️)
- 🟣 **헤더**: 보라색

## 📄 파일 구조

```
salon-reservation-server/
├── scripts/
│   ├── initDatabase.js          # Node.js 데이터베이스 초기화 스크립트
│   └── start-with-init.sh       # Bash 대화형 시작 스크립트
└── package.json                 # 업데이트된 npm 스크립트
```

## 🎯 사용법

### 1. 대화형 시작
```bash
cd salon-reservation-server
npm run start:interactive
```

**실행 예시:**
```
================================
 🏪 Hair Salon Reservation API
================================

ℹ️  Checking requirements...
✅ All requirements satisfied

🔧 Database Initialization
----------------------------------------

Do you want to initialize the database? (Y/N): Y

ℹ️  Initializing database...
✅ Database initialized successfully!

🚀 Starting API Server
----------------------------------------

ℹ️  Starting server with command: node bin/www
ℹ️  Server will be available at: http://localhost:4000
✅ Server is starting...
```

### 2. 데이터베이스만 초기화
```bash
npm run init-db
```

### 3. 일반 시작 (기존 방식)
```bash
npm start
```

## 🚨 해결된 이슈들

### 1. Node.js 버전 호환성
- **문제**: better-sqlite3 모듈 버전 충돌
- **해결**: `npm rebuild better-sqlite3`으로 재빌드
- **결과**: 정상 작동 확인

### 2. 스크립트 권한 설정
- **문제**: bash 스크립트 실행 권한 없음
- **해결**: `chmod +x scripts/*.sh` 권한 부여
- **결과**: 스크립트 정상 실행

### 3. 경로 처리
- **문제**: 상대 경로 문제로 모듈 로딩 실패
- **해결**: 프로젝트 루트 기준 절대 경로 사용
- **결과**: 어떤 디렉토리에서든 정상 작동

## 📊 예상 결과

- **개발자 경험**: 데이터베이스 초기화 과정 자동화로 50% 시간 절약
- **안정성**: 데이터 충돌 방지 및 안전한 초기화
- **사용성**: 직관적인 CLI 인터페이스로 사용 편의성 향상
- **유지보수**: 모듈화된 스크립트로 확장 가능

## 🔗 관련 파일

### 주요 구현 파일
- `scripts/initDatabase.js` - 데이터베이스 초기화 로직
- `scripts/start-with-init.sh` - 대화형 CLI 스크립트
- `package.json` - npm 스크립트 설정

### 연관 기능
- `db/database.js` - 데이터베이스 연결 및 스키마
- `bin/www` - 서버 시작점

## 🎉 달성 결과

이 구현으로 Hair Salon Reservation API 서버가 다음을 지원하게 되었습니다:

1. **대화형 시작**: 사용자가 데이터베이스 초기화 여부를 선택할 수 있음
2. **안전한 초기화**: 기존 데이터 확인 후 필요한 경우에만 샘플 데이터 추가
3. **개발자 친화적**: 색상별 출력과 상세한 상태 메시지로 명확한 피드백 제공
4. **확장 가능**: 모듈화된 구조로 향후 추가 초기화 작업 쉽게 추가 가능

## 🔍 미래 개선 사항

- 다양한 환경별 설정 파일 지원
- 데이터베이스 마이그레이션 기능 추가
- 초기화 진행 상황 프로그레스 바
- 설정 파일 기반 자동화 옵션