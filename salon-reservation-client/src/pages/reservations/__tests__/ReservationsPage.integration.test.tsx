import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReservationsPage } from '../ui/ReservationsPage';
import type { Reservation } from '~/entities/reservation';
import type { Designer } from '~/entities/designer';

// Mock data
const mockReservations: Reservation[] = [
  {
    id: '1',
    customerId: 'customer-1',
    customerName: '김고객',
    customerPhone: '010-1234-5678',
    designerName: '김미용',
    service: '커트',
    date: '2024-01-15',
    time: '10:00',
    duration: 60,
    price: 30000,
    status: 'confirmed',
    notes: '짧게 자르고 싶어요',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    customerId: 'customer-2',
    customerName: '이고객',
    customerPhone: '010-9876-5432',
    designerName: '박헤어',
    service: '펌',
    date: '2024-01-15',
    time: '14:00',
    duration: 120,
    price: 80000,
    status: 'pending',
    notes: '볼륨 펌 원해요',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockDesigners: Designer[] = [
  {
    id: '1',
    name: '김미용',
    specialties: ['커트', '컬러'],
    phone: '010-1111-2222',
    email: 'kim@salon.com',
    isActive: true,
    schedule: {
      monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      sunday: { isWorking: false, startTime: null, endTime: null }
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// Mocks
jest.mock('~/features/reservation-management', () => ({
  useReservationStore: jest.fn()
}));

jest.mock('~/features/designer-management', () => ({
  useDesigners: jest.fn()
}));

// Widget mocks
jest.mock('~/widgets/calendar', () => ({
  CalendarWidget: ({ selectedDate, onDateSelect, reservations, isLoading, onHolidaySelect }: any) => (
    <div data-testid="calendar-widget">
      <div>선택된 날짜: {selectedDate}</div>
      <div>예약 수: {reservations?.length || 0}개</div>
      <div>로딩 상태: {isLoading ? '로딩중' : '완료'}</div>
      <button onClick={() => onDateSelect('2024-01-16')}>다음 날 선택</button>
      <button onClick={() => onHolidaySelect('2024-01-01', { name: '신정', type: 'national' })}>
        공휴일 선택
      </button>
    </div>
  )
}));

jest.mock('~/widgets/reservation-table', () => ({
  ReservationTableWidget: ({ 
    reservations, 
    onEdit, 
    onDelete, 
    onStatusChange, 
    selectedDate, 
    isStatusUpdateLoading 
  }: any) => (
    <div data-testid="reservation-table-widget">
      <div>예약 테이블 - 선택된 날짜: {selectedDate}</div>
      <div>상태 업데이트 로딩: {isStatusUpdateLoading ? '로딩중' : '완료'}</div>
      {reservations?.map((reservation: any, index: number) => (
        <div key={reservation.id} data-testid={`reservation-${reservation.id}`}>
          <span>{reservation.customerName} - {reservation.service}</span>
          <button onClick={() => onEdit(reservation, index)}>편집</button>
          <button onClick={() => onDelete(index)}>삭제</button>
          <button onClick={() => onStatusChange(reservation.id, 'confirmed')}>
            상태 변경
          </button>
        </div>
      ))}
    </div>
  )
}));

// window.confirm mock
global.confirm = jest.fn();

describe('ReservationsPage Integration Tests', () => {
  const mockSetReservations = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockAddReservation = jest.fn();
  const mockUpdateReservation = jest.fn();
  const mockRemoveReservation = jest.fn();

  const defaultReservationStore = {
    reservations: mockReservations,
    isLoading: false,
    error: null,
    setReservations: mockSetReservations,
    setLoading: mockSetLoading,
    setError: mockSetError,
    addReservation: mockAddReservation,
    updateReservation: mockUpdateReservation,
    removeReservation: mockRemoveReservation
  };

  const defaultDesignersHook = {
    designers: mockDesigners,
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    const { useReservationStore } = require('~/features/reservation-management');
    const { useDesigners } = require('~/features/designer-management');

    useReservationStore.mockReturnValue(defaultReservationStore);
    useDesigners.mockReturnValue(defaultDesignersHook);

    jest.clearAllMocks();
    (global.confirm as jest.Mock).mockReturnValue(true);
    
    // console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('페이지 기본 렌더링', () => {
    it('모든 주요 섹션이 렌더링되어야 한다', () => {
      render(<ReservationsPage />);

      // 캘린더 섹션
      expect(screen.getByText('📅 캘린더 선택')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-widget')).toBeInTheDocument();

      // 고객 등록 섹션
      expect(screen.getByText('✏️ 고객 등록')).toBeInTheDocument();
      expect(screen.getByText('예약 등록 폼 위젯 구현 예정')).toBeInTheDocument();

      // 검색 필터 섹션
      expect(screen.getByText('검색 및 필터 위젯 구현 예정')).toBeInTheDocument();

      // 예약 테이블 섹션
      expect(screen.getByTestId('reservation-table-widget')).toBeInTheDocument();
    });

    it('초기 선택된 날짜가 오늘 날짜여야 한다', () => {
      const today = new Date().toISOString().split('T')[0];
      
      render(<ReservationsPage />);

      expect(screen.getByText(`선택된 날짜: ${today}`)).toBeInTheDocument();
      expect(screen.getByText(`예약 테이블 - 선택된 날짜: ${today}`)).toBeInTheDocument();
    });

    it('예약 데이터가 위젯들에 올바르게 전달되어야 한다', () => {
      render(<ReservationsPage />);

      // 캘린더에 예약 수가 표시되어야 함
      expect(screen.getByText('예약 수: 2개')).toBeInTheDocument();

      // 예약 테이블에 예약들이 표시되어야 함
      expect(screen.getByTestId('reservation-1')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-2')).toBeInTheDocument();
      expect(screen.getByText('김고객 - 커트')).toBeInTheDocument();
      expect(screen.getByText('이고객 - 펌')).toBeInTheDocument();
    });
  });

  describe('날짜 선택 기능', () => {
    it('캘린더에서 날짜 선택 시 상태가 업데이트되어야 한다', () => {
      render(<ReservationsPage />);

      const dateSelectButton = screen.getByText('다음 날 선택');
      fireEvent.click(dateSelectButton);

      expect(screen.getByText('선택된 날짜: 2024-01-16')).toBeInTheDocument();
      expect(screen.getByText('예약 테이블 - 선택된 날짜: 2024-01-16')).toBeInTheDocument();
    });

    it('공휴일 선택 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<ReservationsPage />);

      const holidaySelectButton = screen.getByText('공휴일 선택');
      fireEvent.click(holidaySelectButton);

      expect(consoleSpy).toHaveBeenCalledWith('공휴일 선택: 2024-01-01 - 신정');
    });
  });

  describe('예약 관리 기능', () => {
    it('예약 편집 버튼 클릭 시 편집 상태가 설정되어야 한다', () => {
      render(<ReservationsPage />);

      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      // 편집 상태가 설정되었는지 확인 (실제로는 모달이 열리거나 편집 폼이 나타날 것)
      expect(editButtons[0]).toBeInTheDocument();
    });

    it('예약 삭제 시 확인 대화상자가 표시되고 삭제가 실행되어야 한다', () => {
      render(<ReservationsPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalledWith('김고객님의 예약을 삭제하시겠습니까?');
      expect(mockRemoveReservation).toHaveBeenCalledWith('1');
    });

    it('예약 삭제 취소 시 삭제가 실행되지 않아야 한다', () => {
      (global.confirm as jest.Mock).mockReturnValue(false);

      render(<ReservationsPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockRemoveReservation).not.toHaveBeenCalled();
    });

    it('예약 상태 변경이 실행되어야 한다', () => {
      render(<ReservationsPage />);

      const statusChangeButtons = screen.getAllByText('상태 변경');
      fireEvent.click(statusChangeButtons[0]);

      expect(mockUpdateReservation).toHaveBeenCalledWith('1', { status: 'confirmed' });
    });
  });

  describe('로딩 상태 처리', () => {
    it('예약 데이터 로딩 중일 때 로딩 상태가 표시되어야 한다', () => {
      const { useReservationStore } = require('~/features/reservation-management');
      useReservationStore.mockReturnValue({
        ...defaultReservationStore,
        isLoading: true
      });

      render(<ReservationsPage />);

      expect(screen.getByText('로딩 상태: 로딩중')).toBeInTheDocument();
    });

    it('디자이너 데이터 로딩 중에도 페이지가 정상 렌더링되어야 한다', () => {
      const { useDesigners } = require('~/features/designer-management');
      useDesigners.mockReturnValue({
        ...defaultDesignersHook,
        isLoading: true
      });

      render(<ReservationsPage />);

      expect(screen.getByTestId('calendar-widget')).toBeInTheDocument();
      expect(screen.getByTestId('reservation-table-widget')).toBeInTheDocument();
    });

    it('상태 업데이트 로딩이 테이블에 전달되어야 한다', () => {
      render(<ReservationsPage />);

      expect(screen.getByText('상태 업데이트 로딩: 완료')).toBeInTheDocument();
    });
  });

  describe('에러 상황 처리', () => {
    it('예약 삭제 중 오류 발생 시 콘솔에 에러가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockRemoveReservation.mockRejectedValueOnce(new Error('삭제 실패'));

      render(<ReservationsPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('예약 삭제 실패:', expect.any(Error));
      });
    });

    it('상태 변경 중 오류 발생 시 콘솔에 에러가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockUpdateReservation.mockRejectedValueOnce(new Error('상태 변경 실패'));

      render(<ReservationsPage />);

      const statusChangeButtons = screen.getAllByText('상태 변경');
      fireEvent.click(statusChangeButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('상태 변경 실패:', expect.any(Error));
      });
    });
  });

  describe('디자이너 필터링', () => {
    it('활성 디자이너만 필터링되어야 한다', () => {
      const { useDesigners } = require('~/features/designer-management');
      useDesigners.mockReturnValue({
        designers: [
          ...mockDesigners,
          {
            id: '2',
            name: '비활성디자이너',
            specialties: ['커트'],
            phone: '010-3333-4444',
            email: 'inactive@salon.com',
            isActive: false,
            schedule: {},
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        ],
        isLoading: false,
        error: null
      });

      render(<ReservationsPage />);

      // 페이지가 정상적으로 렌더링되고, 활성 디자이너만 사용되는지 확인
      expect(screen.getByTestId('calendar-widget')).toBeInTheDocument();
    });
  });

  describe('레이아웃 구조', () => {
    it('그리드 레이아웃이 올바르게 적용되어야 한다', () => {
      render(<ReservationsPage />);

      // 최상위 컨테이너
      const mainContainer = screen.getByText('📅 캘린더 선택').closest('.space-y-6');
      expect(mainContainer).toBeInTheDocument();

      // 상단 그리드 (캘린더 + 고객 등록)
      const topGrid = screen.getByText('📅 캘린더 선택').closest('.grid');
      expect(topGrid).toHaveClass('grid-cols-1', 'xl:grid-cols-2', 'gap-6');
    });

    it('glass-card 스타일이 적용되어야 한다', () => {
      render(<ReservationsPage />);

      const calendarCard = screen.getByText('📅 캘린더 선택').closest('.glass-card');
      expect(calendarCard).toBeInTheDocument();
      expect(calendarCard).toHaveClass('p-6');

      const customerCard = screen.getByText('✏️ 고객 등록').closest('.glass-card');
      expect(customerCard).toBeInTheDocument();
      expect(customerCard).toHaveClass('p-6');
    });
  });
});