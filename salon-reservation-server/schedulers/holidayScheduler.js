const cron = require('node-cron');
const HolidayService = require('../services/holidayService');

/**
 * Korean Holiday Auto-Sync Scheduler
 * Automatically syncs Korean public holidays daily at 2 AM KST
 */
class HolidayScheduler {
  constructor() {
    this.holidayService = new HolidayService();
    this.isRunning = false;
    this.lastSyncResult = null;
    
    // 스케줄러 설정 (매일 새벽 2시 실행)
    this.scheduleTime = process.env.HOLIDAY_SYNC_TIME || '0 2 * * *';
    this.timezone = 'Asia/Seoul';
    this.enabled = process.env.HOLIDAY_SYNC_ENABLED !== 'false';
  }

  /**
   * 스케줄러 시작
   */
  start() {
    if (!this.enabled) {
      console.log('ℹ️ Holiday sync scheduler is disabled');
      return;
    }

    console.log(`🚀 Starting Holiday Sync Scheduler...`);
    console.log(`⏰ Schedule: ${this.scheduleTime} (${this.timezone})`);
    
    // 매일 새벽 2시에 실행하는 크론 작업
    this.task = cron.schedule(this.scheduleTime, async () => {
      await this.executeSync();
    }, {
      scheduled: true,
      timezone: this.timezone
    });

    console.log('✅ Holiday Sync Scheduler started successfully');
    
    // 서버 시작 시 한 번 실행 (개발/테스트 목적)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log('🔄 Running initial holiday sync for development...');
        this.executeSync();
      }, 5000); // 5초 후 실행
    }
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.task) {
      this.task.stop();
      console.log('⏹️ Holiday Sync Scheduler stopped');
    }
  }

  /**
   * 동기화 실행
   */
  async executeSync() {
    if (this.isRunning) {
      console.log('⚠️ Holiday sync is already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    
    try {
      console.log('🌟 ===== Holiday Sync Started =====');
      console.log(`📅 Started at: ${startTime.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);
      
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      
      // 올해와 내년 공휴일을 동시에 동기화
      const [currentYearResult, nextYearResult] = await Promise.all([
        this.holidayService.syncHolidays(currentYear),
        this.holidayService.syncHolidays(nextYear)
      ]);
      
      // 결과 집계
      const totalSynced = (currentYearResult.count || 0) + (nextYearResult.count || 0);
      const hasErrors = !currentYearResult.success || !nextYearResult.success;
      
      this.lastSyncResult = {
        timestamp: startTime.toISOString(),
        duration: Date.now() - startTime.getTime(),
        totalSynced,
        currentYear: currentYearResult,
        nextYear: nextYearResult,
        success: !hasErrors
      };
      
      // 결과 출력
      console.log('📊 ===== Sync Results =====');
      console.log(`📅 ${currentYear}: ${currentYearResult.success ? '✅' : '❌'} ${currentYearResult.count || 0} holidays`);
      console.log(`📅 ${nextYear}: ${nextYearResult.success ? '✅' : '❌'} ${nextYearResult.count || 0} holidays`);
      console.log(`📈 Total synced: ${totalSynced} holidays`);
      console.log(`⏱️ Duration: ${this.lastSyncResult.duration}ms`);
      
      if (hasErrors) {
        console.log('⚠️ Some sync operations failed:');
        if (!currentYearResult.success) {
          console.log(`  - ${currentYear}: ${currentYearResult.error}`);
        }
        if (!nextYearResult.success) {
          console.log(`  - ${nextYear}: ${nextYearResult.error}`);
        }
      } else {
        console.log('🎉 Holiday sync completed successfully!');
      }
      
      console.log('🌟 ===== Holiday Sync Finished =====\n');
      
    } catch (error) {
      console.error('❌ Holiday sync failed with unexpected error:', error);
      
      this.lastSyncResult = {
        timestamp: startTime.toISOString(),
        duration: Date.now() - startTime.getTime(),
        totalSynced: 0,
        success: false,
        error: error.message
      };
      
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 수동 동기화 실행
   * @param {number} year - 특정 연도 동기화 (선택사항)
   * @returns {Promise<Object>} 동기화 결과
   */
  async manualSync(year = null) {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Holiday sync is already running'
      };
    }

    try {
      if (year) {
        console.log(`🔄 Manual sync requested for year ${year}`);
        return await this.holidayService.syncHolidays(year);
      } else {
        console.log('🔄 Manual full sync requested');
        await this.executeSync();
        return this.lastSyncResult;
      }
      
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 스케줄러 상태 조회
   * @returns {Object} 스케줄러 상태 정보
   */
  getStatus() {
    return {
      enabled: this.enabled,
      running: this.isRunning,
      schedule: this.scheduleTime,
      timezone: this.timezone,
      nextRun: this.task ? 'Next scheduled run at 2 AM KST daily' : null,
      lastSync: this.lastSyncResult,
      uptime: process.uptime()
    };
  }

  /**
   * 다음 실행 시간 조회
   * @returns {string|null} 다음 실행 시간
   */
  getNextRunTime() {
    return this.task ? 'Next scheduled run at 2 AM KST daily' : null;
  }
}

// 싱글톤 인스턴스 생성
const holidayScheduler = new HolidayScheduler();

// Graceful shutdown 핸들러
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Holiday Scheduler...');
  holidayScheduler.stop();
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Holiday Scheduler...');
  holidayScheduler.stop();
});

module.exports = holidayScheduler;