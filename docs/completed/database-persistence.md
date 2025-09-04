---
# SQLite 데이터베이스 영구 저장소 구현 (SQLite Database Persistence)

## Status
- [x] 완료 (2025-09-03)

## Description
현재 인메모리 배열 방식의 임시 데이터 저장소를 SQLite 물리파일 기반의 영구 저장소로 변경합니다. 이를 통해 서버 재시작 후에도 데이터가 유지되고, 실제 운영 환경에서 사용 가능한 안정적인 데이터 저장 시스템을 구축합니다.

## 목표
in-memory 데이터베이스를 SQLite 물리파일 저장 방식으로 변경

## 기술 선택: SQLite
- 이유: Node.js 생태계 최적화, 1인 사용자에 적합, 설정 최소화
- 패키지: better-sqlite3 (동기식, 고성능) 또는 sqlite3 (비동기식, 전통적)

## 구현 계획
1. better-sqlite3 설치 및 설정
2. 현재 in-memory 스키마를 SQLite 스키마로 변환
3. 프로젝트 루트/db/ 폴더에 database.db 파일 저장
4. 환경별 설정 분리 (개발/운영)
5. 마이그레이션 스크립트 작성

## 고려사항
- 데이터베이스 파일 .gitignore 추가 (민감한 데이터의 경우)
- 백업 전략 수립
- TypeScript 타입 안정성 확보

우선순위: 높음

## Implementation Details
### 현재 상태
#### 임시 데이터 저장
- **위치**: `salon-reservation-server/routes/reservations.js`
- **라인**: 4-6
```javascript
let reservations = [];
let nextId = 1;
```

### 대상 구조
#### SQLite 데이터베이스 구조
```sql
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customerName TEXT NOT NULL,
  customerPhone TEXT,
  customerEmail TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  stylist TEXT NOT NULL,
  serviceType TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Requirements
### 비즈니스 요구사항
1. **데이터 영구성**: 서버 재시작 후에도 모든 예약 데이터 유지
2. **성능**: 현재 수준의 응답 속도 유지 (< 100ms)
3. **안정성**: 동시 접근 시 데이터 무결성 보장
4. **확장성**: 향후 기능 추가 시 스키마 확장 용이성

### 기술 요구사항
1. **better-sqlite3**: 고성능 동기식 SQLite 드라이버 사용
2. **파일 저장**: `salon-reservation-server/db/database.db` 경로
3. **환경 분리**: 개발/테스트/운영 환경별 DB 파일 분리
4. **마이그레이션**: 스키마 버전 관리 시스템 구축

### 보안 요구사항
1. **접근 제어**: 데이터베이스 파일 권한 설정
2. **백업**: 정기적인 데이터 백업 메커니즘
3. **암호화**: 민감 정보 암호화 (향후)

## Dependencies
### 새로운 패키지 설치
```bash
# 고성능 SQLite 드라이버 (권장)
npm install better-sqlite3

# TypeScript 타입 정의
npm install @types/better-sqlite3

# 대안: 전통적인 SQLite 드라이버
npm install sqlite3
npm install @types/sqlite3
```

### 추가 개발 도구
```bash
# 데이터베이스 관리 도구 (선택적)
npm install sqlite3-utils

# 마이그레이션 도구 (선택적)
npm install node-sqlite-migrations
```

### 연관 기능
- 모든 CRUD API 엔드포인트
- 백엔드 테스트 시스템
- 데이터 마이그레이션
- 환경 설정 관리

## TODO
### 우선순위: ⚡ 높음 (High)

#### Phase 1: 환경 설정
- [ ] better-sqlite3 패키지 설치
- [ ] 데이터베이스 디렉토리 구조 생성
```bash
mkdir -p salon-reservation-server/db
mkdir -p salon-reservation-server/migrations
```

- [ ] 환경변수 설정
```env
# .env
DATABASE_PATH=./db/database.db
DATABASE_PATH_TEST=./db/test.db
DATABASE_PATH_DEV=./db/development.db
```

#### Phase 2: 데이터베이스 초기화
- [ ] 데이터베이스 연결 모듈 작성
```javascript
// db/database.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './db/database.db';
const db = new Database(path.resolve(__dirname, '..', dbPath));

// WAL 모드 활성화 (성능 향상)
db.pragma('journal_mode = WAL');

module.exports = db;
```

- [ ] 테이블 생성 스크립트 작성
```javascript
// migrations/001_create_reservations.js
const createReservationsTable = `
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    customerPhone TEXT,
    customerEmail TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    stylist TEXT NOT NULL,
    serviceType TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;
```

#### Phase 3: CRUD 로직 리팩토링
- [ ] GET 엔드포인트 SQLite 쿼리로 변경
```javascript
// routes/reservations.js
const db = require('../db/database');

// GET all reservations
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM reservations ORDER BY date, time');
    const reservations = stmt.all();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

- [ ] POST 엔드포인트 수정
```javascript
// POST new reservation
router.post('/', (req, res) => {
  try {
    const { customerName, date, time, stylist, serviceType } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO reservations (customerName, date, time, stylist, serviceType)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(customerName, date, time, stylist, serviceType);
    
    const newReservation = db.prepare('SELECT * FROM reservations WHERE id = ?')
                            .get(result.lastInsertRowid);
    
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

- [ ] PUT, DELETE 엔드포인트 수정

#### Phase 4: 고급 기능
- [ ] 트랜잭션 지원
```javascript
const insertReservation = db.transaction((reservation) => {
  const stmt = db.prepare('INSERT INTO reservations (...) VALUES (...)');
  return stmt.run(reservation);
});
```

- [ ] 인덱스 생성으로 성능 최적화
```sql
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_stylist ON reservations(stylist);
```

- [ ] 중복 예약 방지 로직
```javascript
const checkDuplicate = db.prepare(`
  SELECT COUNT(*) as count 
  FROM reservations 
  WHERE date = ? AND time = ? AND stylist = ?
`);
```

#### Phase 5: 데이터 마이그레이션
- [ ] 기존 목 데이터를 SQLite로 이관
```javascript
// scripts/migrate-test-data.js
const db = require('../db/database');
const mockReservations = require('../test/data/mockReservations');

const stmt = db.prepare(`
  INSERT INTO reservations (customerName, date, time, stylist, serviceType)
  VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((reservations) => {
  for (const reservation of reservations) {
    stmt.run(
      reservation.customerName,
      reservation.date,
      reservation.time,
      reservation.stylist,
      reservation.serviceType
    );
  }
});

insertMany(mockReservations);
```

#### Phase 6: 테스트 시스템 업데이트
- [ ] 테스트용 데이터베이스 분리
- [ ] 모든 API 테스트 파일 업데이트
- [ ] 테스트 실행 전후 DB 초기화
```javascript
// test/setup.js
const db = require('../db/database');

beforeEach(() => {
  db.exec('DELETE FROM reservations');
  // 테스트 데이터 삽입
});

afterAll(() => {
  db.close();
});
```

#### Phase 7: 배포 및 운영
- [ ] .gitignore 업데이트
```gitignore
# Database files
salon-reservation-server/db/*.db
salon-reservation-server/db/*.db-wal
salon-reservation-server/db/*.db-shm
!salon-reservation-server/db/.gitkeep
```

- [ ] 백업 스크립트 작성
```bash
#!/bin/bash
# backup.sh
cp ./db/database.db "./backups/database-$(date +%Y%m%d-%H%M%S).db"
```

- [ ] 환경별 설정 완료
- [ ] 헬스체크 엔드포인트 추가

### 구현 예상 시간
- **환경 설정**: 2시간
- **데이터베이스 초기화**: 3시간
- **CRUD 리팩토링**: 6시간
- **고급 기능**: 4시간
- **데이터 마이그레이션**: 2시간
- **테스트 업데이트**: 4시간
- **배포 설정**: 2시간
- **총합**: 23시간 (약 3일)

### 위험 요소
- 동기식 better-sqlite3 vs 비동기식 기존 패턴의 차이
- 대용량 데이터 처리 시 성능 저하 가능성
- 파일 시스템 권한 및 경로 이슈
- 기존 테스트 케이스와의 호환성 문제

## Playwright Testing
- [ ] UI 렌더링 검사
- [ ] 기능 동작 테스트  
- [ ] 반응형 레이아웃 검증
- [ ] 접근성 검사
- [ ] 콘솔 에러 확인

## Issues Found & Resolved

### 1. Express Router 읽기 오류
**문제**: Express node_modules 파일을 읽으려 시도하여 불필요한 라이브러리 코드 분석 발생
**해결**: 프로젝트 파일에 집중하여 실제 구현 대상만 분석

### 2. UUID Primary Key 구현
**문제**: SQLite AUTOINCREMENT vs UUID 선택
**해결**: 
- UUID v4 사용으로 결정 (_id: TEXT PRIMARY KEY)
- `const { v4: uuidv4 } = require('uuid')` 임포트
- 클라이언트 호환성과 확장성 확보

### 3. WAL 모드 최적화
**구현**: SQLite 성능 최적화를 위한 설정
```javascript
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');
```

### 4. 스키마 불일치 해결
**문제**: 문서의 `id` vs 실제 구현의 `_id` 불일치
**해결**: UUID 문자열 기반 `_id` 필드로 통일

### 5. Prepared Statements 도입
**구현**: 보안과 성능을 위한 prepared statement 패턴
```javascript
const getAllReservations = db.prepare('SELECT * FROM reservations ORDER BY date, time');
const insertReservation = db.prepare(`INSERT INTO reservations...`);
```

### 6. 충돌 감지 로직
**구현**: 동일 스타일리스트의 시간 중복 예약 방지
```javascript
const checkConflict = db.prepare(`
  SELECT COUNT(*) as count 
  FROM reservations 
  WHERE date = ? AND time = ? AND stylist = ? AND _id != ?
`);
```

### 7. 트랜잭션 및 에러 처리
**구현**: Database 작업 중 예외 상황 처리 강화
- try-catch 블록으로 모든 DB 작업 보호
- 명확한 에러 메시지 제공
- HTTP 상태 코드 정확한 응답

### 8. 데이터 영속성 검증 완료
**테스트**: 서버 재시작 후 데이터 유지 확인
- 예약 생성 → 서버 재시작 → 데이터 조회 성공
- 충돌 감지 기능 정상 작동 확인