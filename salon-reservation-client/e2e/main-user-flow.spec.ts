import { test, expect } from '@playwright/test';

test.describe('헤어 살롱 예약 시스템 - 메인 사용자 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 애플리케이션 메인 페이지로 이동
    await page.goto('/');
  });

  test('메인 대시보드 로딩 및 기본 구조 확인', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/헤어 살롱 예약 시스템/);

    // 헤더 요소들 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    await expect(page.getByText('관리자 대시보드')).toBeVisible();
    await expect(page.getByText('로그아웃')).toBeVisible();

    // 네비게이션 탭들 확인
    await expect(page.getByText('📅 예약 관리')).toBeVisible();
    await expect(page.getByText('👥 고객 관리')).toBeVisible();
    await expect(page.getByText('👨‍🎨 디자이너 관리')).toBeVisible();
    await expect(page.getByText('🕐 영업시간 관리')).toBeVisible();
    await expect(page.getByText('📊 통계 대시보드')).toBeVisible();

    // 기본적으로 예약 관리 탭이 활성화되어 있는지 확인
    const activeTab = page.locator('button:has-text("📅 예약 관리")');
    await expect(activeTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
  });

  test('탭 네비게이션 동작 확인', async ({ page }) => {
    // 고객 관리 탭으로 이동
    await page.getByText('👥 고객 관리').click();
    
    // 로딩 상태 대기
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 고객 관리 탭이 활성화되었는지 확인
    const customerTab = page.locator('button:has-text("👥 고객 관리")');
    await expect(customerTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 디자이너 관리 탭으로 이동
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    const designerTab = page.locator('button:has-text("👨‍🎨 디자이너 관리")');
    await expect(designerTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 통계 대시보드 탭으로 이동
    await page.getByText('📊 통계 대시보드').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    const statisticsTab = page.locator('button:has-text("📊 통계 대시보드")');
    await expect(statisticsTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);

    // 예약 관리 탭으로 다시 이동
    await page.getByText('📅 예약 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeVisible();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    const reservationTab = page.locator('button:has-text("📅 예약 관리")');
    await expect(reservationTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
  });

  test('예약 관리 페이지 기능 확인', async ({ page }) => {
    // 예약 관리 페이지가 기본으로 로드되어야 함
    await expect(page.getByText('📅 캘린더 선택')).toBeVisible();
    await expect(page.getByText('✏️ 고객 등록')).toBeVisible();

    // 캘린더 위젯 확인
    const calendarSection = page.locator('.glass-card:has-text("📅 캘린더 선택")');
    await expect(calendarSection).toBeVisible();

    // 고객 등록 폼 섹션 확인
    const customerFormSection = page.locator('.glass-card:has-text("✏️ 고객 등록")');
    await expect(customerFormSection).toBeVisible();
    await expect(customerFormSection.getByText('예약 등록 폼 위젯 구현 예정')).toBeVisible();

    // 검색 필터 섹션 확인
    await expect(page.getByText('검색 및 필터 위젯 구현 예정')).toBeVisible();
  });

  test('고객 관리 페이지 기능 확인', async ({ page }) => {
    // 고객 관리 탭으로 이동
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 고객 관리 위젯 확인 (실제 구현에서는 고객 목록이 표시될 것)
    // 현재는 구현되지 않은 상태이므로 기본 페이지 구조만 확인
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('디자이너 관리 페이지 기능 확인', async ({ page }) => {
    // 디자이너 관리 탭으로 이동
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 디자이너 관리 위젯 확인 (실제 구현에서는 디자이너 목록이 표시될 것)
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('영업시간 관리 페이지 기능 확인', async ({ page }) => {
    // 영업시간 관리 탭으로 이동
    await page.getByText('🕐 영업시간 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 영업시간 관리 위젯 확인
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('통계 대시보드 페이지 기능 확인', async ({ page }) => {
    // 통계 대시보드 탭으로 이동
    await page.getByText('📊 통계 대시보드').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 통계 대시보드 위젯 확인
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('반응형 디자인 확인 - 모바일 뷰', async ({ page }) => {
    // 모바일 화면 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 헤더가 모바일에서도 제대로 표시되는지 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    await expect(page.getByText('관리자 대시보드')).toBeVisible();

    // 네비게이션 탭들이 모바일에서도 접근 가능한지 확인
    await expect(page.getByText('📅 예약 관리')).toBeVisible();
    await expect(page.getByText('👥 고객 관리')).toBeVisible();
    
    // 탭 클릭이 모바일에서도 동작하는지 확인
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    const customerTab = page.locator('button:has-text("👥 고객 관리")');
    await expect(customerTab).toHaveClass(/bg-gradient-to-r from-purple-500 to-pink-500/);
  });

  test('반응형 디자인 확인 - 태블릿 뷰', async ({ page }) => {
    // 태블릿 화면 크기로 변경
    await page.setViewportSize({ width: 768, height: 1024 });

    // 헤더 레이아웃 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    
    // 네비게이션 탭들의 레이아웃 확인
    const tabContainer = page.locator('nav.glass-card');
    await expect(tabContainer).toBeVisible();
    
    // 모든 탭이 표시되는지 확인
    await expect(page.getByText('📅 예약 관리')).toBeVisible();
    await expect(page.getByText('👥 고객 관리')).toBeVisible();
    await expect(page.getByText('👨‍🎨 디자이너 관리')).toBeVisible();
    await expect(page.getByText('🕐 영업시간 관리')).toBeVisible();
    await expect(page.getByText('📊 통계 대시보드')).toBeVisible();
  });

  test('로그아웃 기능 확인', async ({ page }) => {
    // 로그아웃 버튼 클릭
    // 실제로는 confirm dialog가 뜨지만, 현재 구현에서는 확인만
    await expect(page.getByText('로그아웃')).toBeVisible();
    
    // 로그아웃 버튼이 클릭 가능한지 확인
    const logoutButton = page.getByText('로그아웃');
    await expect(logoutButton).toBeEnabled();
  });

  test('페이지 로딩 성능 확인', async ({ page }) => {
    // 페이지 로딩 시작 시간 측정
    const start = Date.now();
    
    await page.goto('/');
    
    // 메인 컴포넌트들이 로드될 때까지 대기
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    await expect(page.getByText('📅 예약 관리')).toBeVisible();
    
    const loadTime = Date.now() - start;
    
    // 페이지 로딩이 3초 이내에 완료되는지 확인
    expect(loadTime).toBeLessThan(3000);
  });

  test('오류 처리 확인', async ({ page }) => {
    // 네트워크 오류 시뮬레이션은 실제 API 연동 후에 구현
    // 현재는 기본 오류 상태 확인
    await expect(page.getByText('헤어 살롱 예약 시스템')).toBeVisible();
    
    // JavaScript 오류가 발생하지 않는지 확인
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // 여러 탭을 이동하면서 오류 확인
    await page.getByText('👥 고객 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    await page.getByText('👨‍🎨 디자이너 관리').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();
    
    await page.getByText('📊 통계 대시보드').click();
    await expect(page.getByText('페이지를 불러오는 중...')).toBeHidden();

    // 수집된 오류가 없는지 확인
    expect(errors).toHaveLength(0);
  });

  test('접근성 확인', async ({ page }) => {
    // 키보드 네비게이션 확인
    await page.keyboard.press('Tab');
    
    // 로그아웃 버튼이 포커스를 받는지 확인
    await expect(page.getByText('로그아웃')).toBeFocused();
    
    // 탭 키로 네비게이션 이동
    await page.keyboard.press('Tab');
    
    // 다음 포커스 가능한 요소로 이동되었는지 확인
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
  });
});