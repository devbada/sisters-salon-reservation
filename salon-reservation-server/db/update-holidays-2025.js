const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '..', dbPath);
const db = new Database(fullPath);

console.log('🗓️ 2025년 정확한 한국 공휴일 데이터로 업데이트를 시작합니다...');

try {
  // 2025년 정확한 한국 공휴일 데이터
  const insertHoliday = db.prepare(`
    INSERT INTO holidays (date, name, type, reason, is_recurring, is_closed, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const holidays2025 = [
    // 1월
    {
      date: '2025-01-01',
      name: '신정',
      type: 'national',
      reason: '새해 첫날',
      is_recurring: 1,
      is_closed: 1,
      description: '새해 첫날 휴무'
    },
    {
      date: '2025-01-28',
      name: '설날 연휴',
      type: 'national',
      reason: '음력 1월 1일 연휴',
      is_recurring: 0,
      is_closed: 1,
      description: '설날 연휴 (음력 12월 29일)'
    },
    {
      date: '2025-01-29',
      name: '설날',
      type: 'national',
      reason: '음력 1월 1일',
      is_recurring: 0,
      is_closed: 1,
      description: '설날 (음력 1월 1일)'
    },
    {
      date: '2025-01-30',
      name: '설날 연휴',
      type: 'national',
      reason: '음력 1월 1일 연휴',
      is_recurring: 0,
      is_closed: 1,
      description: '설날 연휴 (음력 1월 2일)'
    },

    // 3월
    {
      date: '2025-03-01',
      name: '삼일절',
      type: 'national',
      reason: '3.1 독립운동 기념일',
      is_recurring: 1,
      is_closed: 1,
      description: '삼일절 휴무'
    },

    // 5월
    {
      date: '2025-05-01',
      name: '근로자의 날',
      type: 'other',
      reason: '노동절',
      is_recurring: 1,
      is_closed: 1,
      description: '근로자의 날 휴무'
    },
    {
      date: '2025-05-05',
      name: '어린이날',
      type: 'national',
      reason: '어린이날',
      is_recurring: 1,
      is_closed: 1,
      description: '어린이날 휴무'
    },
    {
      date: '2025-05-06',
      name: '어린이날 대체공휴일',
      type: 'national',
      reason: '어린이날 대체휴일',
      is_recurring: 0,
      is_closed: 1,
      description: '어린이날 대체공휴일 (5월 5일이 월요일이므로 대체휴일 없음, 실제로는 필요없음)'
    },
    {
      date: '2025-05-13',
      name: '부처님오신날',
      type: 'national',
      reason: '석가탄신일 (음력 4월 8일)',
      is_recurring: 0,
      is_closed: 1,
      description: '부처님오신날 휴무'
    },

    // 6월
    {
      date: '2025-06-06',
      name: '현충일',
      type: 'national',
      reason: '순국선열 추모일',
      is_recurring: 1,
      is_closed: 1,
      description: '현충일 휴무'
    },

    // 8월
    {
      date: '2025-08-15',
      name: '광복절',
      type: 'national',
      reason: '일제강점기 해방 기념일',
      is_recurring: 1,
      is_closed: 1,
      description: '광복절 휴무'
    },

    // 10월 - 올바른 추석 연휴
    {
      date: '2025-10-03',
      name: '개천절',
      type: 'national',
      reason: '단군 건국 기념일',
      is_recurring: 1,
      is_closed: 1,
      description: '개천절 휴무'
    },
    {
      date: '2025-10-05',
      name: '추석 연휴',
      type: 'national',
      reason: '추석 연휴 (음력 8월 14일)',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 연휴 (음력 8월 14일)'
    },
    {
      date: '2025-10-06',
      name: '추석',
      type: 'national',
      reason: '추석 당일 (음력 8월 15일)',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 당일 (음력 8월 15일)'
    },
    {
      date: '2025-10-07',
      name: '추석 연휴',
      type: 'national',
      reason: '추석 연휴 (음력 8월 16일)',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 연휴 (음력 8월 16일)'
    },
    {
      date: '2025-10-08',
      name: '추석 대체공휴일',
      type: 'national',
      reason: '추석 대체휴일',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 대체공휴일 (10월 5일이 일요일이므로)'
    },
    {
      date: '2025-10-09',
      name: '한글날',
      type: 'national',
      reason: '한글 창제 기념일',
      is_recurring: 1,
      is_closed: 1,
      description: '한글날 휴무'
    },

    // 12월
    {
      date: '2025-12-25',
      name: '크리스마스',
      type: 'national',
      reason: '기독탄신일',
      is_recurring: 1,
      is_closed: 1,
      description: '크리스마스 휴무'
    }
  ];

  // 불필요한 항목 제거 (어린이날 대체공휴일은 2025년에 실제로는 없음)
  const validHolidays = holidays2025.filter(holiday => holiday.date !== '2025-05-06');

  validHolidays.forEach(holiday => {
    insertHoliday.run(
      holiday.date, holiday.name, holiday.type, holiday.reason,
      holiday.is_recurring, holiday.is_closed, holiday.description
    );
  });

  console.log(`✅ ${validHolidays.length}개의 2025년 한국 공휴일 데이터가 정확히 삽입되었습니다.`);

  console.log('\n📅 삽입된 공휴일 목록:');
  validHolidays.forEach(holiday => {
    console.log(`- ${holiday.date}: ${holiday.name}`);
  });

} catch (error) {
  console.error('❌ 공휴일 데이터 업데이트 중 오류 발생:', error);
  process.exit(1);
} finally {
  db.close();
  console.log('\n🎉 2025년 한국 공휴일 데이터 업데이트가 완료되었습니다!');
}