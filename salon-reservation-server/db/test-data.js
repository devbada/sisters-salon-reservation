const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Helper function to generate unique IDs
const generateId = () => uuidv4();

// Test data setup function
async function setupTestData() {
  try {
    console.log('Setting up test data...');

    // 1. Create test administrator
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    
    const insertAdmin = db.prepare(`
      INSERT OR REPLACE INTO administrators (username, password_hash) 
      VALUES (?, ?)
    `);
    
    insertAdmin.run('admin', adminPassword);
    console.log('✓ Test admin created (username: admin, password: admin123)');

    // 2. Create test hair designers
    const insertDesigner = db.prepare(`
      INSERT OR REPLACE INTO hair_designers 
      (_id, name, specialization, phone, email, experience_years, bio, is_active, deleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const designers = [
      {
        id: generateId(),
        name: '김민주',
        specialization: '컷, 펌',
        phone: '010-1234-5678',
        email: 'minju.kim@salon.com',
        experience: 5,
        bio: '세련되고 트렌디한 스타일을 추구하는 헤어 디자이너입니다.',
        active: true
      },
      {
        id: generateId(),
        name: '박서연',
        specialization: '염색, 트리트먼트',
        phone: '010-2345-6789',
        email: 'seoyeon.park@salon.com',
        experience: 7,
        bio: '건강하고 아름다운 모발을 만드는 것이 저의 목표입니다.',
        active: true
      },
      {
        id: generateId(),
        name: '이지우',
        specialization: '컷, 스타일링',
        phone: '010-3456-7890',
        email: 'jiwoo.lee@salon.com',
        experience: 3,
        bio: '고객님의 개성을 살리는 맞춤형 헤어 스타일을 제안합니다.',
        active: true
      },
      {
        id: generateId(),
        name: '최하늘',
        specialization: '웨딩 헤어, 업스타일',
        phone: '010-4567-8901',
        email: 'haneul.choi@salon.com',
        experience: 8,
        bio: '특별한 날을 더욱 빛나게 만드는 헤어 스타일을 선사합니다.',
        active: true
      }
    ];

    designers.forEach(designer => {
      insertDesigner.run(
        designer.id,
        designer.name,
        designer.specialization,
        designer.phone,
        designer.email,
        designer.experience,
        designer.bio,
        designer.active ? 1 : 0,
        0 // not deleted
      );
    });
    console.log('✓ Test hair designers created');

    // 3. Create test reservations
    const insertReservation = db.prepare(`
      INSERT OR REPLACE INTO reservations 
      (_id, customerName, date, time, stylist, serviceType, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const today = new Date();
    const reservations = [];
    
    // Create reservations for the next 7 days
    for (let i = 1; i <= 7; i++) {
      const reservationDate = new Date(today);
      reservationDate.setDate(today.getDate() + i);
      const dateStr = reservationDate.toISOString().split('T')[0];
      
      const times = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
      const services = ['컷', '펜', '염색', '트리트먼트', '컷+펌', '컷+염색'];
      const customers = ['홍길동', '김영희', '박철수', '이미영', '정수민', '최지혜'];
      
      // Add 2-4 random reservations per day
      const numReservations = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < numReservations; j++) {
        const timeIndex = Math.floor(Math.random() * times.length);
        const serviceIndex = Math.floor(Math.random() * services.length);
        const customerIndex = Math.floor(Math.random() * customers.length);
        const designerIndex = Math.floor(Math.random() * designers.length);
        
        reservations.push({
          id: generateId(),
          customerName: customers[customerIndex],
          date: dateStr,
          time: times[timeIndex],
          stylist: designers[designerIndex].name,
          serviceType: services[serviceIndex],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Remove used time slot to avoid conflicts
        times.splice(timeIndex, 1);
        if (times.length === 0) break;
      }
    }

    reservations.forEach(reservation => {
      insertReservation.run(
        reservation.id,
        reservation.customerName,
        reservation.date,
        reservation.time,
        reservation.stylist,
        reservation.serviceType,
        reservation.createdAt,
        reservation.updatedAt
      );
    });
    console.log(`✓ ${reservations.length} test reservations created`);

    // 4. Add some holidays for testing
    const insertHoliday = db.prepare(`
      INSERT OR REPLACE INTO holidays (date, reason, is_recurring)
      VALUES (?, ?, ?)
    `);

    const holidays = [
      { date: '2024-12-25', reason: '크리스마스', recurring: 1 },
      { date: '2024-01-01', reason: '신정', recurring: 1 },
      { date: '2024-02-09', reason: '설날', recurring: 0 },
      { date: '2024-02-10', reason: '설날 연휴', recurring: 0 },
      { date: '2024-02-11', reason: '설날 연휴', recurring: 0 }
    ];

    holidays.forEach(holiday => {
      insertHoliday.run(holiday.date, holiday.reason, holiday.recurring ? 1 : 0);
    });
    console.log('✓ Test holidays added');

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`- Admin account: username: admin, password: admin123`);
    console.log(`- Hair designers: ${designers.length} active designers`);
    console.log(`- Reservations: ${reservations.length} upcoming reservations`);
    console.log(`- Holidays: ${holidays.length} holiday entries`);
    
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupTestData()
    .then(() => {
      console.log('\nTest data setup finished. You can now test all features!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to setup test data:', error);
      process.exit(1);
    });
}

module.exports = { setupTestData };