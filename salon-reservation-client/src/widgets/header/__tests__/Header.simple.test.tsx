import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../ui/Header';

// useAuthStore mock
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

// window.confirm mock
global.confirm = jest.fn(() => true);

describe('Header Simple Tests', () => {
  const defaultProps = {
    activeTab: 'reservations' as const,
    onTabChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 한다', () => {
      const { container } = render(<Header {...defaultProps} />);
      expect(container).toBeTruthy();
    });

    it('시스템 제목이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('헤어 살롱 예약 시스템')).toBeInTheDocument();
    });

    it('관리자 대시보드 텍스트가 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('관리자 대시보드')).toBeInTheDocument();
    });

    it('사용자 이름이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('관리자')).toBeInTheDocument();
    });

    it('로그아웃 버튼이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });
  });

  describe('탭 네비게이션', () => {
    it('예약 관리 탭이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('📅 예약 관리')).toBeInTheDocument();
    });

    it('고객 관리 탭이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('👥 고객 관리')).toBeInTheDocument();
    });

    it('디자이너 관리 탭이 표시되어야 한다', () => {
      render(<Header {...defaultProps} />);
      expect(screen.getByText('👨‍🎨 디자이너 관리')).toBeInTheDocument();
    });

    it('고객 관리 탭 클릭 시 onTabChange가 호출되어야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const customersTab = screen.getByText('👥 고객 관리');
      fireEvent.click(customersTab);
      
      expect(defaultProps.onTabChange).toHaveBeenCalledWith('customers');
    });
  });

  describe('로그아웃 기능', () => {
    it('로그아웃 버튼 클릭이 가능해야 한다', () => {
      render(<Header {...defaultProps} />);
      
      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);
      
      expect(global.confirm).toHaveBeenCalled();
    });
  });
});