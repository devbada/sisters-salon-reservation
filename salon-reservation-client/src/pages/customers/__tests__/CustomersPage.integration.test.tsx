import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomersPage } from '../ui/CustomersPage';
import type { Customer } from '~/entities/customer';

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '김고객',
    phone: '010-1234-5678',
    email: 'kim@customer.com',
    isVip: false,
    birthDate: '1990-01-01',
    preferences: {
      preferredDesigner: '김미용'
    },
    visitHistory: [],
    lastVisit: '2024-01-01',
    totalVisits: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'VIP고객',
    phone: '010-9876-5432',
    email: 'vip@customer.com',
    isVip: true,
    birthDate: '1985-05-15',
    preferences: {},
    visitHistory: [],
    lastVisit: '2024-01-15',
    totalVisits: 15,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// Mocks
jest.mock('~/features/customer-management', () => ({
  useCustomers: jest.fn()
}));

jest.mock('~/widgets/customer-list', () => ({
  CustomerListWidget: ({ 
    onCustomerSelect, 
    onCustomerEdit, 
    onCustomerDelete, 
    onCustomerAdd 
  }: any) => (
    <div data-testid="customer-list-widget">
      <div>고객 목록 위젯</div>
      {mockCustomers.map((customer) => (
        <div key={customer.id} data-testid={`customer-${customer.id}`}>
          <span>{customer.name}</span>
          <button onClick={() => onCustomerSelect(customer)}>선택</button>
          <button onClick={() => onCustomerEdit(customer)}>편집</button>
          <button onClick={() => onCustomerDelete(customer.id)}>삭제</button>
        </div>
      ))}
      <button onClick={onCustomerAdd}>고객 추가</button>
    </div>
  )
}));

describe('CustomersPage Integration Tests', () => {
  const mockDeleteCustomer = jest.fn();

  beforeEach(() => {
    const { useCustomers } = require('~/features/customer-management');
    useCustomers.mockReturnValue({
      deleteCustomer: mockDeleteCustomer
    });

    jest.clearAllMocks();
    
    // console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('페이지 기본 렌더링', () => {
    it('고객 목록 위젯이 렌더링되어야 한다', () => {
      render(<CustomersPage />);

      expect(screen.getByTestId('customer-list-widget')).toBeInTheDocument();
      expect(screen.getByText('고객 목록 위젯')).toBeInTheDocument();
    });

    it('초기 상태에서는 모달이 표시되지 않아야 한다', () => {
      render(<CustomersPage />);

      expect(screen.queryByText('고객 상세 정보')).not.toBeInTheDocument();
      expect(screen.queryByText('새 고객 등록')).not.toBeInTheDocument();
      expect(screen.queryByText('고객 정보 수정')).not.toBeInTheDocument();
    });
  });

  describe('고객 선택 기능', () => {
    it('고객 선택 시 상세 정보 모달이 표시되어야 한다', () => {
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('고객 상세 정보')).toBeInTheDocument();
      expect(screen.getByText('이름:')).toBeInTheDocument();
      
      // 모달 내의 김고객 텍스트 찾기
      const modal = screen.getByText('고객 상세 정보').closest('.glass-card');
      expect(modal).toBeInTheDocument();
      
      expect(screen.getByText('연락처:')).toBeInTheDocument();
      expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    });

    it('VIP 고객 선택 시에도 상세 정보가 표시되어야 한다', () => {
      render(<CustomersPage />);

      const selectButtons = screen.getAllByText('선택');
      fireEvent.click(selectButtons[1]); // VIP고객 선택

      expect(screen.getByText('고객 상세 정보')).toBeInTheDocument();
      
      // 모달 내의 VIP고객 정보 확인
      const modal = screen.getByText('고객 상세 정보').closest('.glass-card');
      expect(modal).toBeInTheDocument();
      expect(screen.getByText('010-9876-5432')).toBeInTheDocument();
    });

    it('고객 정보에 이메일이 있으면 표시되어야 한다', () => {
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('이메일:')).toBeInTheDocument();
      expect(screen.getByText('kim@customer.com')).toBeInTheDocument();
    });

    it('고객 정보에 생년월일이 있으면 표시되어야 한다', () => {
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('생년월일:')).toBeInTheDocument();
      expect(screen.getByText('1990-01-01')).toBeInTheDocument();
    });

    it('총 방문 횟수가 표시되어야 한다', () => {
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('총 방문:')).toBeInTheDocument();
      expect(screen.getByText('5회')).toBeInTheDocument();
    });

    it('고객 선택 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(consoleSpy).toHaveBeenCalledWith('고객 선택:', '김고객');
    });
  });

  describe('고객 편집 기능', () => {
    it('고객 편집 버튼 클릭 시 편집 모달이 표시되어야 한다', () => {
      render(<CustomersPage />);

      const editButton = screen.getAllByText('편집')[0];
      fireEvent.click(editButton);

      expect(screen.getByText('고객 정보 수정')).toBeInTheDocument();
      expect(screen.getByText('고객 폼 위젯 구현 예정')).toBeInTheDocument();
    });

    it('고객 편집 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<CustomersPage />);

      const editButton = screen.getAllByText('편집')[0];
      fireEvent.click(editButton);

      expect(consoleSpy).toHaveBeenCalledWith('고객 편집:', '김고객');
    });
  });

  describe('고객 삭제 기능', () => {
    it('고객 삭제 버튼 클릭 시 삭제 함수가 호출되어야 한다', async () => {
      mockDeleteCustomer.mockResolvedValueOnce(undefined);
      
      render(<CustomersPage />);

      const deleteButton = screen.getAllByText('삭제')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteCustomer).toHaveBeenCalledWith('1');
      });
    });

    it('고객 삭제 성공 시 콘솔에 로그가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockDeleteCustomer.mockResolvedValueOnce(undefined);
      
      render(<CustomersPage />);

      const deleteButton = screen.getAllByText('삭제')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('고객 삭제 완료:', '1');
      });
    });

    it('고객 삭제 실패 시 콘솔에 에러가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('삭제 실패');
      mockDeleteCustomer.mockRejectedValueOnce(error);
      
      render(<CustomersPage />);

      const deleteButton = screen.getAllByText('삭제')[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('고객 삭제 실패:', error);
      });
    });
  });

  describe('고객 추가 기능', () => {
    it('고객 추가 버튼 클릭 시 등록 모달이 표시되어야 한다', () => {
      render(<CustomersPage />);

      const addButton = screen.getByText('고객 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 고객 등록')).toBeInTheDocument();
      expect(screen.getByText('고객 폼 위젯 구현 예정')).toBeInTheDocument();
    });

    it('고객 추가 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<CustomersPage />);

      const addButton = screen.getByText('고객 추가');
      fireEvent.click(addButton);

      expect(consoleSpy).toHaveBeenCalledWith('새 고객 등록');
    });
  });

  describe('모달 닫기 기능', () => {
    it('상세 정보 모달의 닫기 버튼이 동작해야 한다', () => {
      render(<CustomersPage />);

      // 모달 열기
      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('고객 상세 정보')).toBeInTheDocument();

      // 모달 닫기
      const closeButton = screen.getByText('닫기');
      fireEvent.click(closeButton);

      expect(screen.queryByText('고객 상세 정보')).not.toBeInTheDocument();
    });

    it('편집 모달의 닫기 버튼이 동작해야 한다', () => {
      render(<CustomersPage />);

      // 편집 모달 열기
      const editButton = screen.getAllByText('편집')[0];
      fireEvent.click(editButton);

      expect(screen.getByText('고객 정보 수정')).toBeInTheDocument();

      // 모달 닫기
      const closeButton = screen.getByText('닫기');
      fireEvent.click(closeButton);

      expect(screen.queryByText('고객 정보 수정')).not.toBeInTheDocument();
    });

    it('등록 모달의 닫기 버튼이 동작해야 한다', () => {
      render(<CustomersPage />);

      // 등록 모달 열기
      const addButton = screen.getByText('고객 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 고객 등록')).toBeInTheDocument();

      // 모달 닫기
      const closeButton = screen.getByText('닫기');
      fireEvent.click(closeButton);

      expect(screen.queryByText('새 고객 등록')).not.toBeInTheDocument();
    });
  });

  describe('모달 상태 관리', () => {
    it('편집에서 등록으로 모드 전환이 올바르게 동작해야 한다', () => {
      render(<CustomersPage />);

      // 편집 모달 열기
      const editButton = screen.getAllByText('편집')[0];
      fireEvent.click(editButton);

      expect(screen.getByText('고객 정보 수정')).toBeInTheDocument();

      // 모달 닫기
      const closeButton = screen.getByText('닫기');
      fireEvent.click(closeButton);

      // 등록 모달 열기
      const addButton = screen.getByText('고객 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 고객 등록')).toBeInTheDocument();
      expect(screen.queryByText('고객 정보 수정')).not.toBeInTheDocument();
    });

    it('상세 정보에서 편집으로 전환이 올바르게 동작해야 한다', () => {
      render(<CustomersPage />);

      // 상세 정보 모달 열기
      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('고객 상세 정보')).toBeInTheDocument();

      // 상세 정보 모달 닫기
      let closeButton = screen.getByText('닫기');
      fireEvent.click(closeButton);

      // 편집 모달 열기
      const editButton = screen.getAllByText('편집')[0];
      fireEvent.click(editButton);

      expect(screen.getByText('고객 정보 수정')).toBeInTheDocument();
      expect(screen.queryByText('고객 상세 정보')).not.toBeInTheDocument();
    });
  });

  describe('모달 레이아웃', () => {
    it('상세 정보 모달이 올바른 구조를 가져야 한다', () => {
      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      // 모달 백드롭
      const modalBackdrop = screen.getByText('고객 상세 정보').closest('.fixed.inset-0');
      expect(modalBackdrop).toHaveClass('bg-black/50', 'flex', 'items-center', 'justify-center', 'z-50');

      // 모달 컨텐츠
      const modalContent = screen.getByText('고객 상세 정보').closest('.glass-card');
      expect(modalContent).toHaveClass('p-6', 'max-w-md', 'w-full', 'mx-4');
    });

    it('폼 모달이 올바른 구조를 가져야 한다', () => {
      render(<CustomersPage />);

      const addButton = screen.getByText('고객 추가');
      fireEvent.click(addButton);

      // 모달 백드롭
      const modalBackdrop = screen.getByText('새 고객 등록').closest('.fixed.inset-0');
      expect(modalBackdrop).toHaveClass('bg-black/50', 'flex', 'items-center', 'justify-center', 'z-50');

      // 모달 컨텐츠
      const modalContent = screen.getByText('새 고객 등록').closest('.glass-card');
      expect(modalContent).toHaveClass('p-6', 'max-w-md', 'w-full', 'mx-4');
    });
  });

  describe('데이터 표시 처리', () => {
    it('이메일이 없는 고객의 경우 이메일 필드가 표시되지 않아야 한다', () => {
      // 이메일이 없는 고객 데이터로 테스트
      const customersWithoutEmail = [
        {
          ...mockCustomers[0],
          email: undefined
        }
      ];

      jest.doMock('~/widgets/customer-list', () => ({
        CustomerListWidget: ({ onCustomerSelect }: any) => (
          <div data-testid="customer-list-widget">
            <button onClick={() => onCustomerSelect(customersWithoutEmail[0])}>
              선택
            </button>
          </div>
        )
      }));

      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('고객 상세 정보')).toBeInTheDocument();
      expect(screen.queryByText('이메일:')).not.toBeInTheDocument();
    });

    it('총 방문 횟수가 없는 경우 0으로 표시되어야 한다', () => {
      const customersWithoutVisits = [
        {
          ...mockCustomers[0],
          totalVisits: undefined
        }
      ];

      jest.doMock('~/widgets/customer-list', () => ({
        CustomerListWidget: ({ onCustomerSelect }: any) => (
          <div data-testid="customer-list-widget">
            <button onClick={() => onCustomerSelect(customersWithoutVisits[0])}>
              선택
            </button>
          </div>
        )
      }));

      render(<CustomersPage />);

      const selectButton = screen.getAllByText('선택')[0];
      fireEvent.click(selectButton);

      expect(screen.getByText('총 방문:')).toBeInTheDocument();
      expect(screen.getByText('0회')).toBeInTheDocument();
    });
  });
});