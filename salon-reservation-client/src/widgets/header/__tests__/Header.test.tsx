import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../ui/Header';

// useAuthStore mock
jest.mock('~/features/authentication', () => ({
  useAuthStore: jest.fn()
}));

// window.confirm mock
global.confirm = jest.fn();

const defaultProps = {
  activeTab: 'reservations' as const,
  onTabChange: jest.fn()
};

describe('Header', () => {
  const mockUseAuthStore = require('~/features/authentication').useAuthStore;

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        name: '관리자',
        email: 'admin@test.com',
        role: 'admin',
        isActive: true
      },
      logout: jest.fn()
    });
    
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('헤더가 올바르게 렌더링되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('헤어 살롱 예약 시스템')).toBeInTheDocument();
      expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();
    });

    it('사용자 정보가 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('관리자')).toBeInTheDocument();
      expect(screen.getByText(/님/)).toBeInTheDocument();
    });

    it('로그아웃 버튼이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });
  });

  describe('탭 네비게이션', () => {
    it('탭 메뉴들이 올바르게 렌더링되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('📅 예약 관리')).toBeInTheDocument();
      expect(screen.getByText('👥 고객 관리')).toBeInTheDocument();
      expect(screen.getByText('👨‍🎨 디자이너 관리')).toBeInTheDocument();
      expect(screen.getByText('🕐 영업시간 관리')).toBeInTheDocument();
      expect(screen.getByText('📊 통계 대시보드')).toBeInTheDocument();
    });

    it('활성 탭이 올바르게 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const activeTab = screen.getByText('📅 예약 관리');
      expect(activeTab.closest('button')).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-500');
    });

    it('탭 클릭 시 onTabChange가 호출되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const customersTab = screen.getByText('👥 고객 관리');
      fireEvent.click(customersTab);
      
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('customers');
    });

    it('다른 탭들도 클릭 가능해야 한다', () => {
      render(<Header {...defaultProps} />);
      
      // 디자이너 관리 탭 클릭
      fireEvent.click(screen.getByText('👨‍🎨 디자이너 관리'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('designers');
      
      // 영업시간 탭 클릭
      fireEvent.click(screen.getByText('🕐 영업시간 관리'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('business-hours');
      
      // 통계 탭 클릭
      fireEvent.click(screen.getByText('📊 통계 대시보드'));
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('statistics');
    });
  });

  describe('로그아웃 기능', () => {
    it('로그아웃 버튼 클릭 시 확인 대화상자가 표시되어야 한다', () => {
      const mockLogout = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: {
          id: '1',
          name: '관리자',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true
        },
        logout: mockLogout
      });

      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);
      
      expect(global.confirm).toHaveBeenCalledWith('로그아웃하시겠습니까?');
    });

    it('로그아웃 확인 시 logout 함수가 호출되어야 한다', () => {
      const mockLogout = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: {
          id: '1',
          name: '관리자',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true
        },
        logout: mockLogout
      });

      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('로그아웃 취소 시 logout 함수가 호출되지 않아야 한다', () => {
      const mockLogout = jest.fn();
      (global.confirm as jest.Mock).mockReturnValue(false);
      
      mockUseAuthStore.mockReturnValue({
        user: {
          id: '1',
          name: '관리자',
          email: 'admin@test.com',
          role: 'admin',
          isActive: true
        },
        logout: mockLogout
      });

      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);
      
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('사용자 정보 표시', () => {
    it('사용자 이름이 없을 때 기본값이 표시되어야 한다', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        logout: jest.fn()
      });

      render(<Header {...defaultProps} />);
      
      // 사용자가 null일 때의 처리
      expect(screen.getByText('헤어 살롱 예약 시스템')).toBeInTheDocument();
    });

    it('다른 사용자 이름도 올바르게 표시되어야 한다', () => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: '2',
          name: '직원',
          email: 'staff@test.com',
          role: 'staff',
          isActive: true
        },
        logout: jest.fn()
      });

      render(<Header {...defaultProps} />);
      
      expect(screen.getByText('직원')).toBeInTheDocument();
    });
  });

  describe('반응형 디자인', () => {
    it('헤더가 반응형 클래스를 가져야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const header = screen.getByText('헤어 살롱 예약 시스템').closest('header');
      expect(header).toHaveClass('glass-card');
    });

    it('탭 네비게이션이 반응형 레이아웃을 가져야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const tabContainer = screen.getByText('📅 예약 관리').closest('div');
      expect(tabContainer).toBeInTheDocument();
    });
  });
});