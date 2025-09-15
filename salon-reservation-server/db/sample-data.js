const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database connection
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '..', dbPath);
const db = new Database(fullPath);

console.log('🌱 샘플 데이터 삽입을 시작합니다...');

try {
  // 1. Hair Designers 샘플 데이터
  console.log('👩‍💼 헤어 디자이너 샘플 데이터 삽입 중...');

  const insertDesigner = db.prepare(`
    INSERT INTO hair_designers (_id, name, specialization, phone, email, experience_years, bio, is_active, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const designers = [
    {
      _id: uuidv4(),
      name: '김수연',
      specialization: '컷, 펌',
      phone: '010-1234-5678',
      email: 'suyeon.kim@salon.com',
      experience_years: 8,
      bio: '10년 경력의 베테랑 헤어 디자이너입니다. 트렌디한 컷과 자연스러운 펌이 전문입니다.',
      is_active: 1,
      deleted: 0
    },
    {
      _id: uuidv4(),
      name: '박지은',
      specialization: '염색, 컬러링',
      phone: '010-2345-6789',
      email: 'jieun.park@salon.com',
      experience_years: 6,
      bio: '컬러 전문가로 개인의 피부톤에 맞는 완벽한 컬러를 제안합니다.',
      is_active: 1,
      deleted: 0
    },
    {
      _id: uuidv4(),
      name: '이민호',
      specialization: '남성 컷, 스타일링',
      phone: '010-3456-7890',
      email: 'minho.lee@salon.com',
      experience_years: 5,
      bio: '남성 헤어 전문가로 깔끔하고 세련된 스타일을 연출합니다.',
      is_active: 1,
      deleted: 0
    },
    {
      _id: uuidv4(),
      name: '최영희',
      specialization: '웨딩, 특수 메이크업',
      phone: '010-4567-8901',
      email: 'younghee.choi@salon.com',
      experience_years: 12,
      bio: '웨딩 및 특별한 날을 위한 헤어 스타일링 전문가입니다.',
      is_active: 1,
      deleted: 0
    }
  ];

  designers.forEach(designer => {
    insertDesigner.run(
      designer._id, designer.name, designer.specialization, designer.phone,
      designer.email, designer.experience_years, designer.bio, designer.is_active, designer.deleted
    );
  });

  console.log(`✅ ${designers.length}명의 헤어 디자이너 데이터가 삽입되었습니다.`);

  // 2. Customers 샘플 데이터
  console.log('👥 고객 샘플 데이터 삽입 중...');

  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, phone, email, birthdate, gender, preferred_stylist, preferred_service, allergies, vip_status, vip_level, total_visits, last_visit_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const customers = [
    {
      name: '홍길동',
      phone: '010-1111-2222',
      email: 'hong@example.com',
      birthdate: '1990-05-15',
      gender: 'male',
      preferred_stylist: '이민호',
      preferred_service: '컷',
      allergies: null,
      vip_status: 0,
      vip_level: 0,
      total_visits: 5,
      last_visit_date: '2025-08-15',
      notes: '항상 짧은 스타일을 선호함'
    },
    {
      name: '김영희',
      phone: '010-2222-3333',
      email: 'younghee@example.com',
      birthdate: '1985-03-22',
      gender: 'female',
      preferred_stylist: '김수연',
      preferred_service: '컷, 펌',
      allergies: '염색약 알레르기',
      vip_status: 1,
      vip_level: 2,
      total_visits: 15,
      last_visit_date: '2025-09-01',
      notes: 'VIP 고객, 염색 불가'
    },
    {
      name: '박철수',
      phone: '010-3333-4444',
      email: 'cheolsu@example.com',
      birthdate: '1988-11-08',
      gender: 'male',
      preferred_stylist: '이민호',
      preferred_service: '컷, 스타일링',
      allergies: null,
      vip_status: 0,
      vip_level: 0,
      total_visits: 3,
      last_visit_date: '2025-07-20',
      notes: '비즈니스 스타일 선호'
    },
    {
      name: '이수정',
      phone: '010-4444-5555',
      email: 'sujeong@example.com',
      birthdate: '1992-07-30',
      gender: 'female',
      preferred_stylist: '박지은',
      preferred_service: '염색, 컬러링',
      allergies: null,
      vip_status: 1,
      vip_level: 1,
      total_visits: 8,
      last_visit_date: '2025-08-25',
      notes: '밝은 컬러 선호'
    },
    {
      name: '정민재',
      phone: '010-5555-6666',
      email: 'minjae@example.com',
      birthdate: '1995-12-12',
      gender: 'male',
      preferred_stylist: '이민호',
      preferred_service: '컷',
      allergies: null,
      vip_status: 0,
      vip_level: 0,
      total_visits: 2,
      last_visit_date: '2025-09-10',
      notes: '첫 방문 고객'
    }
  ];

  customers.forEach(customer => {
    insertCustomer.run(
      customer.name, customer.phone, customer.email, customer.birthdate, customer.gender,
      customer.preferred_stylist, customer.preferred_service, customer.allergies,
      customer.vip_status, customer.vip_level, customer.total_visits, customer.last_visit_date, customer.notes
    );
  });

  console.log(`✅ ${customers.length}명의 고객 데이터가 삽입되었습니다.`);

  // 3. Reservations 샘플 데이터
  console.log('📅 예약 샘플 데이터 삽입 중...');

  const insertReservation = db.prepare(`
    INSERT INTO reservations (_id, customerName, date, time, stylist, serviceType, status, customer_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reservations = [
    {
      _id: uuidv4(),
      customerName: '홍길동',
      date: '2025-09-16',
      time: '10:00',
      stylist: '이민호',
      serviceType: '컷',
      status: 'confirmed',
      customer_id: 1,
      notes: '앞머리 짧게'
    },
    {
      _id: uuidv4(),
      customerName: '김영희',
      date: '2025-09-16',
      time: '14:00',
      stylist: '김수연',
      serviceType: '펌',
      status: 'confirmed',
      customer_id: 2,
      notes: '자연스러운 웨이브'
    },
    {
      _id: uuidv4(),
      customerName: '박철수',
      date: '2025-09-17',
      time: '11:00',
      stylist: '이민호',
      serviceType: '컷, 스타일링',
      status: 'pending',
      customer_id: 3,
      notes: '비즈니스 미팅 준비'
    },
    {
      _id: uuidv4(),
      customerName: '이수정',
      date: '2025-09-17',
      time: '15:30',
      stylist: '박지은',
      serviceType: '염색',
      status: 'confirmed',
      customer_id: 4,
      notes: '애쉬 브라운 색상'
    },
    {
      _id: uuidv4(),
      customerName: '정민재',
      date: '2025-09-18',
      time: '16:00',
      stylist: '이민호',
      serviceType: '컷',
      status: 'pending',
      customer_id: 5,
      notes: '첫 방문'
    },
    {
      _id: uuidv4(),
      customerName: '김영희',
      date: '2025-09-20',
      time: '13:00',
      stylist: '최영희',
      serviceType: '웨딩 스타일링',
      status: 'confirmed',
      customer_id: 2,
      notes: '결혼식 리허설'
    }
  ];

  reservations.forEach(reservation => {
    insertReservation.run(
      reservation._id, reservation.customerName, reservation.date, reservation.time,
      reservation.stylist, reservation.serviceType, reservation.status, reservation.customer_id, reservation.notes
    );
  });

  console.log(`✅ ${reservations.length}개의 예약 데이터가 삽입되었습니다.`);

  // 4. Holidays 샘플 데이터
  console.log('🎌 휴일 샘플 데이터 삽입 중...');

  const insertHoliday = db.prepare(`
    INSERT INTO holidays (date, name, type, reason, is_recurring, is_closed, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const holidays = [
    {
      date: '2025-09-21',
      name: '추석',
      type: 'national',
      reason: '전통 명절',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 연휴로 인한 휴무'
    },
    {
      date: '2025-09-22',
      name: '추석 연휴',
      type: 'national',
      reason: '전통 명절 연휴',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 연휴로 인한 휴무'
    },
    {
      date: '2025-09-23',
      name: '추석 연휴',
      type: 'national',
      reason: '전통 명절 연휴',
      is_recurring: 0,
      is_closed: 1,
      description: '추석 연휴로 인한 휴무'
    },
    {
      date: '2025-10-03',
      name: '개천절',
      type: 'national',
      reason: '국경일',
      is_recurring: 1,
      is_closed: 1,
      description: '개천절 휴무'
    },
    {
      date: '2025-10-09',
      name: '한글날',
      type: 'national',
      reason: '국경일',
      is_recurring: 1,
      is_closed: 1,
      description: '한글날 휴무'
    }
  ];

  holidays.forEach(holiday => {
    insertHoliday.run(
      holiday.date, holiday.name, holiday.type, holiday.reason,
      holiday.is_recurring, holiday.is_closed, holiday.description
    );
  });

  console.log(`✅ ${holidays.length}개의 휴일 데이터가 삽입되었습니다.`);

  // 5. Customer Notes 샘플 데이터
  console.log('📝 고객 노트 샘플 데이터 삽입 중...');

  const insertCustomerNote = db.prepare(`
    INSERT INTO customer_notes (customer_id, note, is_important, created_by)
    VALUES (?, ?, ?, ?)
  `);

  const customerNotes = [
    {
      customer_id: 2,
      note: '염색약 알레르기 있음 - 반드시 패치 테스트 필요',
      is_important: 1,
      created_by: '김수연'
    },
    {
      customer_id: 2,
      note: '결혼식 준비 중 - 웨딩 스타일링 상담 예정',
      is_important: 1,
      created_by: '최영희'
    },
    {
      customer_id: 1,
      note: '항상 짧은 스타일을 원함',
      is_important: 0,
      created_by: '이민호'
    },
    {
      customer_id: 4,
      note: '밝은 컬러 선호, 애쉬 톤 추천',
      is_important: 0,
      created_by: '박지은'
    }
  ];

  customerNotes.forEach(note => {
    insertCustomerNote.run(note.customer_id, note.note, note.is_important, note.created_by);
  });

  console.log(`✅ ${customerNotes.length}개의 고객 노트가 삽입되었습니다.`);

  console.log('🎉 모든 샘플 데이터 삽입이 완료되었습니다!');
  console.log('\n📊 삽입된 데이터 요약:');
  console.log(`- 헤어 디자이너: ${designers.length}명`);
  console.log(`- 고객: ${customers.length}명`);
  console.log(`- 예약: ${reservations.length}개`);
  console.log(`- 휴일: ${holidays.length}개`);
  console.log(`- 고객 노트: ${customerNotes.length}개`);

} catch (error) {
  console.error('❌ 샘플 데이터 삽입 중 오류 발생:', error);
  process.exit(1);
} finally {
  db.close();
}