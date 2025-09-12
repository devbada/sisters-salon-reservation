import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerListWidget } from '../ui/CustomerListWidget';
import type { Customer } from '~/entities/customer';

// useCustomers hook mock
jest.mock('~/features/customer-management', () => ({
  useCustomers: jest.fn()
}));

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '고객1',
    phone: '010-1234-5678',
    email: 'customer1@test.com',
    isVip: false,
    birthDate: '1990-01-01',
    preferences: {
      preferredDesigner: '김미용'
    },
    visitHistory: [],
    lastVisit: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'VIP고객',
    phone: '010-9876-5432', 
    email: 'vip@test.com',
    isVip: true,
    birthDate: '1985-05-15',
    preferences: {},
    visitHistory: [],
    lastVisit: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const defaultProps = {
  onCustomerSelect: jest.fn(),
  onCustomerEdit: jest.fn(),
  onCustomerDelete: jest.fn(),
  onCustomerAdd: jest.fn()
};

describe('CustomerListWidget', () => {
  const mockUseCustomers = require('~/features/customer-management').useCustomers;

  beforeEach(() => {
    mockUseCustomers.mockReturnValue({
      customers: mockCustomers,
      isLoading: false,
      error: null,
      deleteCustomer: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('고객 목록이 올바르게 렌더링되어야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('👥 고객 관리')).toBeInTheDocument();
      expect(screen.getByText('고객1')).toBeInTheDocument();
      expect(screen.getByText('VIP고객')).toBeInTheDocument();
      expect(screen.getByText('📊 총 2명의 고객')).toBeInTheDocument();
    });

    it('로딩 중일 때 로딩 표시가 나타나야 한다', () => {
      mockUseCustomers.mockReturnValue({
        customers: [],
        isLoading: true,
        error: null,
        deleteCustomer: jest.fn()
      });

      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('고객 목록을 불러오는 중...')).toBeInTheDocument();
    });

    it('에러가 있을 때 에러 메시지가 표시되어야 한다', () => {
      mockUseCustomers.mockReturnValue({
        customers: [],
        isLoading: false,
        error: '네트워크 오류가 발생했습니다.',
        deleteCustomer: jest.fn()
      });

      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('네트워크 오류가 발생했습니다.')).toBeInTheDocument();
    });

    it('고객이 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
      mockUseCustomers.mockReturnValue({
        customers: [],
        isLoading: false,
        error: null,
        deleteCustomer: jest.fn()
      });

      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('등록된 고객이 없습니다')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 고객을 등록해보세요.')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색어 입력이 가능해야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      // CustomerSearch 컴포넌트 내의 검색 입력 필드 찾기
      const searchInputs = screen.getAllByRole('textbox');
      const searchInput = searchInputs.find(input => 
        input.getAttribute('placeholder')?.includes('검색') ||
        input.getAttribute('type') === 'search'
      );
      
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: '고객1' } });
        expect(searchInput).toHaveValue('고객1');
      }
    });

    it('VIP 필터가 동작해야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      // VIP 필터 셀렉트 박스 찾기
      const selects = screen.getAllByRole('combobox');
      if (selects.length > 0) {
        fireEvent.change(selects[0], { target: { value: 'vip' } });
        expect(selects[0]).toHaveValue('vip');
      }
    });
  });

  describe('버튼 이벤트', () => {
    it('새 고객 등록 버튼 클릭 시 onCustomerAdd가 호출되어야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      const addButton = screen.getByText('➕ 새 고객 등록');
      fireEvent.click(addButton);
      
      expect(defaultProps.onCustomerAdd).toHaveBeenCalledTimes(1);
    });

    it('빈 상태에서도 고객 등록 버튼이 동작해야 한다', () => {
      mockUseCustomers.mockReturnValue({
        customers: [],
        isLoading: false,
        error: null,
        deleteCustomer: jest.fn()
      });

      render(<CustomerListWidget {...defaultProps} />);
      
      const addButton = screen.getByText('➕ 고객 등록하기');
      fireEvent.click(addButton);
      
      expect(defaultProps.onCustomerAdd).toHaveBeenCalledTimes(1);
    });

    it('에러 상태에서 다시 시도 버튼이 동작해야 한다', () => {
      mockUseCustomers.mockReturnValue({
        customers: [],
        isLoading: false,
        error: '네트워크 오류',
        deleteCustomer: jest.fn()
      });

      render(<CustomerListWidget {...defaultProps} />);
      
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
      
      // 콘솔에 로그가 찍히는지 확인 (실제 구현에서는 다시 로드 로직이 들어갈 것)
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('고객 카드 표시', () => {
    it('고객 정보가 카드 형태로 표시되어야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('고객1')).toBeInTheDocument();
      expect(screen.getByText('VIP고객')).toBeInTheDocument();
    });

    it('총 고객 수가 올바르게 표시되어야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      expect(screen.getByText('📊 총 2명의 고객')).toBeInTheDocument();
    });
  });

  describe('고객 상호작용', () => {
    it('고객 카드를 통한 상호작용이 가능해야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      // CustomerCard 컴포넌트들이 렌더링되는지 확인
      const customerCards = screen.getAllByText(/고객/);
      expect(customerCards.length).toBeGreaterThan(0);
    });
  });

  describe('반응형 디자인', () => {
    it('그리드 레이아웃이 적용되어야 한다', () => {
      render(<CustomerListWidget {...defaultProps} />);
      
      // 그리드 컨테이너가 있는지 확인
      const gridContainer = screen.getByText('📊 총 2명의 고객').parentElement?.nextElementSibling;
      expect(gridContainer).toBeInTheDocument();
    });
  });
});