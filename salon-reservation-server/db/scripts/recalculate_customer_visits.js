const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '../..', dbPath);
const db = new Database(fullPath);

/**
 * 모든 고객의 방문 횟수와 마지막 방문 날짜를 재계산합니다.
 * - completed 상태의 예약만 방문으로 계산
 * - total_visits와 last_visit_date를 정확히 업데이트
 */
function recalculateCustomerVisits() {
  console.log('고객 방문 이력 재계산을 시작합니다...');
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // 모든 고객 조회
    const customers = db.prepare('SELECT id, name FROM customers').all();
    console.log(`총 ${customers.length}명의 고객을 처리합니다.`);
    
    // 고객별 방문 통계를 계산하는 쿼리
    const getVisitStats = db.prepare(`
      SELECT 
        COUNT(*) as visit_count,
        MAX(date) as last_visit_date
      FROM reservations 
      WHERE customer_id = ? AND status = 'completed'
    `);
    
    // 고객 정보 업데이트 쿼리
    const updateCustomer = db.prepare(`
      UPDATE customers 
      SET total_visits = ?, last_visit_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    let updatedCount = 0;
    let totalVisitsCalculated = 0;
    
    for (const customer of customers) {
      const stats = getVisitStats.get(customer.id);
      
      if (stats) {
        const visitCount = stats.visit_count || 0;
        const lastVisitDate = stats.last_visit_date || null;
        
        // 고객 정보 업데이트
        updateCustomer.run(visitCount, lastVisitDate, customer.id);
        
        totalVisitsCalculated += visitCount;
        updatedCount++;
        
        if (visitCount > 0) {
          console.log(`${customer.name} (ID: ${customer.id}): ${visitCount}회 방문, 마지막 방문: ${lastVisitDate || '없음'}`);
        }
      }
    }
    
    // 결과 검증
    console.log('\n=== 재계산 완료 ===');
    console.log(`처리된 고객 수: ${updatedCount}명`);
    console.log(`총 방문 횟수: ${totalVisitsCalculated}회`);
    
    // 완료된 예약 수와 비교
    const completedReservationsCount = db.prepare(`
      SELECT COUNT(*) as count FROM reservations WHERE status = 'completed'
    `).get();
    
    console.log(`완료된 예약 수: ${completedReservationsCount.count}회`);
    
    if (totalVisitsCalculated === completedReservationsCount.count) {
      console.log('✅ 방문 횟수가 완료된 예약 수와 일치합니다.');
    } else {
      console.log('⚠️  방문 횟수와 완료된 예약 수가 일치하지 않습니다.');
    }
    
    // 방문 횟수가 0보다 큰 고객들 표시
    const activeCustomers = db.prepare(`
      SELECT name, total_visits, last_visit_date 
      FROM customers 
      WHERE total_visits > 0 
      ORDER BY total_visits DESC, last_visit_date DESC
    `).all();
    
    console.log('\n=== 방문 이력이 있는 고객들 ===');
    activeCustomers.forEach(customer => {
      console.log(`${customer.name}: ${customer.total_visits}회 (마지막: ${customer.last_visit_date || '기록없음'})`);
    });
    
    db.exec('COMMIT');
    console.log('\n✅ 고객 방문 이력 재계산이 완료되었습니다!');
    
  } catch (error) {
    console.error('재계산 중 오류 발생:', error);
    db.exec('ROLLBACK');
    throw error;
  }
}

// 스크립트가 직접 실행될 때
if (require.main === module) {
  recalculateCustomerVisits();
  db.close();
}

module.exports = { recalculateCustomerVisits };