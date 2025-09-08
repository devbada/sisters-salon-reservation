const Database = require('better-sqlite3');
const path = require('path');

// Database path configuration
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '../../', dbPath);

console.log('마이그레이션 시작: 예약 상태 관리 시스템 추가');

try {
  // 데이터베이스 연결
  const db = new Database(fullPath);
  
  console.log('데이터베이스 연결 성공');
  
  // 트랜잭션으로 안전하게 마이그레이션 실행
  const migration = db.transaction(() => {
    // 1. 예약 테이블에 상태 관련 컬럼 추가
    console.log('1. 예약 테이블에 상태 컬럼 추가...');
    
    // 기존 컬럼 존재 확인
    const tableInfo = db.prepare("PRAGMA table_info(reservations)").all();
    const existingColumns = tableInfo.map(col => col.name);
    
    if (!existingColumns.includes('status')) {
      db.exec('ALTER TABLE reservations ADD COLUMN status TEXT DEFAULT "pending"');
      console.log('   - status 컬럼 추가 완료');
    } else {
      console.log('   - status 컬럼이 이미 존재합니다');
    }
    
    if (!existingColumns.includes('status_updated_at')) {
      db.exec('ALTER TABLE reservations ADD COLUMN status_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('   - status_updated_at 컬럼 추가 완료');
    } else {
      console.log('   - status_updated_at 컬럼이 이미 존재합니다');
    }
    
    if (!existingColumns.includes('status_updated_by')) {
      db.exec('ALTER TABLE reservations ADD COLUMN status_updated_by TEXT');
      console.log('   - status_updated_by 컬럼 추가 완료');
    } else {
      console.log('   - status_updated_by 컬럼이 이미 존재합니다');
    }
    
    if (!existingColumns.includes('notes')) {
      db.exec('ALTER TABLE reservations ADD COLUMN notes TEXT');
      console.log('   - notes 컬럼 추가 완료');
    } else {
      console.log('   - notes 컬럼이 이미 존재합니다');
    }
    
    // 2. 예약 상태 히스토리 테이블 생성
    console.log('2. 예약 상태 히스토리 테이블 생성...');
    const createStatusHistoryTable = `
      CREATE TABLE IF NOT EXISTS reservation_status_history (
        id TEXT PRIMARY KEY,
        reservation_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_by TEXT NOT NULL,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        FOREIGN KEY (reservation_id) REFERENCES reservations(_id) ON DELETE CASCADE
      )
    `;
    
    db.exec(createStatusHistoryTable);
    console.log('   - reservation_status_history 테이블 생성 완료');
    
    // 3. 인덱스 추가
    console.log('3. 성능을 위한 인덱스 추가...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_status_date ON reservations(status, date)',
      'CREATE INDEX IF NOT EXISTS idx_reservations_status_updated_at ON reservations(status_updated_at)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_reservation ON reservation_status_history(reservation_id)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON reservation_status_history(changed_at)',
      'CREATE INDEX IF NOT EXISTS idx_status_history_new_status ON reservation_status_history(new_status)'
    ];
    
    indexes.forEach(index => {
      db.exec(index);
    });
    console.log('   - 인덱스 생성 완료');
    
    // 4. 기존 예약 데이터의 상태를 'pending'으로 초기화
    console.log('4. 기존 예약 데이터 상태 초기화...');
    const updateExistingReservations = db.prepare(`
      UPDATE reservations 
      SET status = 'pending', 
          status_updated_at = CURRENT_TIMESTAMP 
      WHERE status IS NULL OR status = ''
    `);
    
    const result = updateExistingReservations.run();
    console.log(`   - ${result.changes}개의 기존 예약이 'pending' 상태로 설정되었습니다`);
    
    console.log('마이그레이션 완료!');
  });
  
  // 마이그레이션 실행
  migration();
  
  // 데이터베이스 연결 종료
  db.close();
  console.log('데이터베이스 연결 종료');
  
} catch (error) {
  console.error('마이그레이션 실패:', error);
  process.exit(1);
}