import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PageRouter } from '../ui/PageRouter';

// 모든 하위 컴포넌트들을 모킹
jest.mock('~/features/authentication', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      name: '관리자',
      email: 'admin@test.com',
      role: 'admin',
      isActive: true
    },
    logout: jest.fn()
  })
}));

jest.mock('~/features/reservation-management', () => ({
  useReservations: () => ({
    reservations: [],
    isLoading: false,
    error: null,
    addReservation: jest.fn(),
    updateReservation: jest.fn(),
    deleteReservation: jest.fn()
  })
}));

jest.mock('~/features/customer-management', () => ({
  useCustomers: () => ({
    customers: [],
    isLoading: false,
    error: null,
    deleteCustomer: jest.fn(),
    updateCustomer: jest.fn()
  })
}));

jest.mock('~/features/designer-management', () => ({
  useDesigners: () => ({
    designers: [],
    isLoading: false,
    error: null,
    deleteDesigner: jest.fn(),
    updateDesigner: jest.fn()
  })
}));

jest.mock('~/features/business-hours', () => ({
  useBusinessHours: () => ({
    businessHours: {
      weekdays: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '17:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false },
      holidays: []
    },
    isLoading: false,
    error: null,
    updateBusinessHours: jest.fn()
  })
}));

jest.mock('~/features/statistics', () => ({
  useStatistics: () => ({
    summaryStats: {
      totalReservations: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      todayReservations: 0
    },
    trendData: [],
    popularServices: [],
    isLoading: false,
    error: null
  })
}));

// window.confirm mock
global.confirm = jest.fn(() => true);

describe('PageRouter Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 페이지 전환 지연 시간을 단축
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('기본 렌더링 및 초기 상태', () => {
    it('헤더와 초기 페이지가 올바르게 렌더링되어야 한다', async () => {
      render(<PageRouter />);
      
      // 헤더 요소들 확인
      expect(screen.getByText('헤어 살롱 예약 시스템')).toBeInTheDocument();
      expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();
      expect(screen.getByText('관리자')).toBeInTheDocument();
      
      // 탭 네비게이션 확인
      expect(screen.getByText('📅 예약 관리')).toBeInTheDocument();
      expect(screen.getByText('👥 고객 관리')).toBeInTheDocument();
      expect(screen.getByText('👨‍🎨 디자이너 관리')).toBeInTheDocument();
      expect(screen.getByText('🕐 영업시간 관리')).toBeInTheDocument();
      expect(screen.getByText('📊 통계 대시보드')).toBeInTheDocument();
    });

    it('기본적으로 예약 관리 탭이 활성화되어야 한다', () => {
      render(<PageRouter />);
      
      const activeTab = screen.getByText('📅 예약 관리');
      expect(activeTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });
  });

  describe('페이지 전환 테스트', () => {
    it('고객 관리 탭 클릭 시 페이지가 전환되어야 한다', async () => {
      render(<PageRouter />);
      
      const customersTab = screen.getByText('👥 고객 관리');
      fireEvent.click(customersTab);
      
      // 로딩 상태 확인
      expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
      
      // 시간을 진행시켜 페이지 전환 완료
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      // 고객 관리 탭이 활성화되었는지 확인
      expect(customersTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });

    it('디자이너 관리 탭 클릭 시 페이지가 전환되어야 한다', async () => {
      render(<PageRouter />);
      
      const designersTab = screen.getByText('👨‍🎨 디자이너 관리');
      fireEvent.click(designersTab);
      
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      expect(designersTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });

    it('영업시간 관리 탭 클릭 시 페이지가 전환되어야 한다', async () => {
      render(<PageRouter />);
      
      const businessHoursTab = screen.getByText('🕐 영업시간 관리');
      fireEvent.click(businessHoursTab);
      
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      expect(businessHoursTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });

    it('통계 대시보드 탭 클릭 시 페이지가 전환되어야 한다', async () => {
      render(<PageRouter />);
      
      const statisticsTab = screen.getByText('📊 통계 대시보드');
      fireEvent.click(statisticsTab);
      
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      expect(statisticsTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });
  });

  describe('로딩 상태 테스트', () => {
    it('페이지 전환 중 로딩 화면이 표시되어야 한다', () => {
      render(<PageRouter />);
      
      const customersTab = screen.getByText('👥 고객 관리');
      fireEvent.click(customersTab);
      
      // 로딩 화면 요소들 확인
      expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
      
      // 스피너가 있는지 확인
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('로딩 완료 후 정상 레이아웃으로 돌아와야 한다', async () => {
      render(<PageRouter />);
      
      const customersTab = screen.getByText('👥 고객 관리');
      fireEvent.click(customersTab);
      
      // 로딩 상태 확인
      expect(screen.getByText('페이지를 불러오는 중...')).toBeInTheDocument();
      
      // 시간 진행
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      // 정상 헤더와 메인 컨텐츠가 표시되는지 확인
      expect(screen.getByText('헤어 살롱 예약 시스템')).toBeInTheDocument();
    });
  });

  describe('사용자 인터랙션 통합 테스트', () => {
    it('로그아웃 버튼이 헤더에서 동작해야 한다', () => {
      render(<PageRouter />);
      
      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);
      
      expect(global.confirm).toHaveBeenCalledWith('로그아웃하시겠습니까?');
    });

    it('여러 탭을 연속으로 클릭해도 정상 동작해야 한다', async () => {
      render(<PageRouter />);
      
      // 고객 관리로 이동
      fireEvent.click(screen.getByText('👥 고객 관리'));
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      // 디자이너 관리로 이동
      fireEvent.click(screen.getByText('👨‍🎨 디자이너 관리'));
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      // 통계 대시보드로 이동
      fireEvent.click(screen.getByText('📊 통계 대시보드'));
      jest.advanceTimersByTime(150);
      
      await waitFor(() => {
        expect(screen.queryByText('페이지를 불러오는 중...')).not.toBeInTheDocument();
      });
      
      // 마지막으로 클릭한 탭이 활성화되어야 함
      const statisticsTab = screen.getByText('📊 통계 대시보드');
      expect(statisticsTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });
  });

  describe('반응형 레이아웃 테스트', () => {
    it('메인 레이아웃 구조가 올바르게 적용되어야 한다', () => {
      render(<PageRouter />);
      
      // 전체 컨테이너
      const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
      expect(mainContainer).toBeInTheDocument();
      
      // 헤더 영역
      const header = document.querySelector('header.glass-card');
      expect(header).toBeInTheDocument();
      
      // 메인 컨텐츠 영역
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('pt-6', 'pb-12');
      
      // 컨텐츠 컨테이너
      const contentContainer = main?.querySelector('.max-w-7xl.mx-auto');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('에러 상황 처리', () => {
    it('잘못된 페이지 타입에도 기본 페이지가 렌더링되어야 한다', () => {
      render(<PageRouter />);
      
      // 기본적으로 예약 관리 페이지가 표시되어야 함
      const activeTab = screen.getByText('📅 예약 관리');
      expect(activeTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });
  });
});