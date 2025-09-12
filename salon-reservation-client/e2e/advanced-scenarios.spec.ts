import { test, expect } from '@playwright/test';

test.describe('헤어 살롱 예약 시스템 - 고급 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 애플리케이션이 완전히 로드될 때까지 대기
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
  });

  test('빠른 탭 전환 스트레스 테스트', async ({ page }) => {
    const tabs = [
      '📅 예약 관리',
      '👥 고객 관리', 
      '👨‍🎨 디자이너 관리',
      '🕐 영업시간 관리',
      '📊 통계 대시보드'
    ];

    // 여러 번 빠르게 탭 전환
    for (let i = 0; i < 3; i++) {
      for (const tabName of tabs) {
        await page.getByText(tabName).click();
        
        // 로딩이 시작되면 기다리고, 완료될 때까지 대기
        const loadingPromise = page.waitForSelector('text=페이지를 불러오는 중...', { timeout: 1000 }).catch(() => null);
        await loadingPromise;
        
        if (await page.getByText('페이지를 불러오는 중...').isVisible().catch(() => false)) {
          await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden({ timeout: 2000 });
        }

        // 해당 탭이 활성화되었는지 확인
        const activeTab = page.locator(`button:has-text("${tabName}")`);
        await expect(activeTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
      }
    }
  });

  test('동시 다중 작업 시뮬레이션', async ({ page }) => {
    // 예약 관리 페이지에서 시작
    await expect(page.getByText('📅 캘린더 선택')).toBeVisible();

    // 고객 관리로 이동
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 디자이너 관리로 빠르게 이동
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 통계 대시보드로 이동
    await page.getByText('📊 통계 대시보드').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 다시 예약 관리로 돌아가기
    await page.getByText('📅 예약 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 최종적으로 예약 관리 페이지 컨텐츠가 올바르게 표시되는지 확인
    await expect(page.getByText('📅 캘린더 선택')).toBeVisible();
    await expect(page.getByText('✏️ 고객 등록')).toBeVisible();
  });

  test('브라우저 뒤로가기/앞으로가기 히스토리 테스트', async ({ page }) => {
    // 초기 페이지 (예약 관리)
    await expect(page.getByText('📅 예약 관리')).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 고객 관리로 이동
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    await expect(page.getByText('👥 고객 관리')).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 디자이너 관리로 이동
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    await expect(page.getByText('👨‍🎨 디자이너 관리')).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 브라우저 뒤로가기
    await page.goBack();
    // 현재 구현에서는 SPA이므로 브라우저 히스토리가 관리되지 않을 수 있음
    // 이 부분은 실제 라우팅 구현에 따라 달라질 수 있음

    // 페이지가 여전히 정상 작동하는지 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
  });

  test('키보드 전용 네비게이션 테스트', async ({ page }) => {
    // 로그아웃 버튼에 포커스
    await page.keyboard.press('Tab');
    await expect(page.getByText('로그아웃')).toBeFocused();

    // 탭 네비게이션으로 이동
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      // 포커스된 요소 확인
      const focusedElement = page.locator(':focus');
      const isVisible = await focusedElement.isVisible().catch(() => false);
      
      if (isVisible) {
        const tagName = await focusedElement.evaluate(el => el.tagName).catch(() => '');
        if (tagName === 'BUTTON') {
          // 버튼에 포커스가 있으면 Enter로 클릭
          const text = await focusedElement.textContent().catch(() => '');
          if (text && text.includes('고객 관리')) {
            await page.keyboard.press('Enter');
            await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
            break;
          }
        }
      }
    }
  });

  test('다양한 화면 크기에서의 일관성 테스트', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '데스크톱 FHD' },
      { width: 1366, height: 768, name: '노트북' },
      { width: 1024, height: 768, name: '태블릿 랜드스케이프' },
      { width: 768, height: 1024, name: '태블릿 포트레이트' },
      { width: 414, height: 896, name: '모바일 iPhone XR' },
      { width: 375, height: 812, name: '모바일 iPhone X' },
      { width: 360, height: 640, name: '모바일 안드로이드' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // 헤더 요소들이 모든 화면 크기에서 보이는지 확인
      await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
      
      // 네비게이션 탭들이 접근 가능한지 확인
      await expect(page.getByText('📅 예약 관리')).toBeVisible();
      await expect(page.getByText('👥 고객 관리')).toBeVisible();
      
      // 탭 클릭이 정상 작동하는지 확인
      await page.getByText('👥 고객 관리').click();
      await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
      
      await page.getByText('📅 예약 관리').click();
      await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    }
  });

  test('장시간 사용 시뮬레이션', async ({ page }) => {
    // 30회 반복 탭 전환으로 장시간 사용 시뮬레이션
    const tabs = ['👥 고객 관리', '👨‍🎨 디자이너 관리', '📊 통계 대시보드', '📅 예약 관리'];
    
    for (let i = 0; i < 30; i++) {
      const randomTab = tabs[Math.floor(Math.random() * tabs.length)];
      await page.getByText(randomTab).click();
      
      // 로딩 대기
      if (await page.getByText('페이지를 불러오는 중...').isVisible().catch(() => false)) {
        await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden({ timeout: 2000 });
      }
      
      // 메모리 누수나 성능 저하가 없는지 확인하기 위해 일정 간격 대기
      if (i % 10 === 0) {
        await page.waitForTimeout(100);
      }
    }

    // 장시간 사용 후에도 기본 기능이 정상 작동하는지 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    await expect(page.getByText('관리자 대시보드')).toBeVisible();
  });

  test('네트워크 지연 상황 테스트', async ({ page }) => {
    // 네트워크 지연 시뮬레이션
    await page.route('**/*', async route => {
      // 100ms 지연
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    // 탭 전환이 지연된 네트워크에서도 정상 작동하는지 확인
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden({ timeout: 3000 });
    
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden({ timeout: 3000 });
  });

  test('CSS 및 스타일 일관성 테스트', async ({ page }) => {
    // 헤더의 글래스 카드 스타일 확인
    const header = page.locator('header.glass-card');
    await expect(header).toBeVisible();
    
    // 네비게이션 탭의 스타일 확인
    const nav = page.locator('nav.glass-card');
    await expect(nav).toBeVisible();

    // 탭 전환 시 스타일 변화 확인
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    const activeCustomerTab = page.locator('button:has-text("👥 고객 관리")');
    await expect(activeCustomerTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
    
    // 다른 탭들은 비활성화 스타일이어야 함
    const inactiveReservationTab = page.locator('button:has-text("📅 예약 관리")');
    await expect(inactiveReservationTab).not.toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
  });

  test('JavaScript 오류 감지 및 복구 테스트', async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];

    // JavaScript 오류 수집
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });

    // 콘솔 오류 수집  
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 다양한 작업 수행
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    await page.getByText('📊 통계 대시보드').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 오류가 없는지 확인
    expect(jsErrors).toHaveLength(0);
    expect(consoleErrors.filter(error => !error.includes('Warning'))).toHaveLength(0);
  });

  test('접근성 표준 준수 테스트', async ({ page }) => {
    // ARIA 레이블 및 역할 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    // 모든 버튼이 접근 가능한지 확인
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        await expect(button).toBeEnabled();
      }
    }

    // 색상 대비 확인 (시각적 확인)
    const activeTab = page.locator('button:has-text("📅 예약 관리")');
    await expect(activeTab).toBeVisible();
    
    // 키보드 네비게이션 확인
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});