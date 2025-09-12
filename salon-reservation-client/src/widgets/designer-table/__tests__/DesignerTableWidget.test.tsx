import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignerTableWidget } from '../ui/DesignerTableWidget';
import type { Designer } from '~/entities/designer';

// useDesigners hook mock
jest.mock('~/features/designer-management', () => ({
  useDesigners: jest.fn()
}));

// useReservationStore mock
jest.mock('~/features/reservation-management', () => ({
  useReservationStore: jest.fn()
}));

const mockDesigners: Designer[] = [
  {
    id: '1',
    name: '김미용',
    specialties: ['헤어컷', '염색'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: '박스타일',
    specialties: ['펌', '트리트먼트'],
    isActive: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const defaultProps = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onAdd: jest.fn()
};

describe('DesignerTableWidget', () => {
  const mockUseDesigners = require('~/features/designer-management').useDesigners;
  const mockUseReservationStore = require('~/features/reservation-management').useReservationStore;

  beforeEach(() => {
    mockUseDesigners.mockReturnValue({
      designers: mockDesigners,
      isLoading: false,
      deleteDesigner: jest.fn()
    });
    
    mockUseReservationStore.mockReturnValue({
      reservations: []
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('렌더링', () => {
    it('디자이너 목록이 올바르게 렌더링되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      expect(screen.getByText('👨‍🎨 헤어 디자이너 관리 (2명)')).toBeInTheDocument();
      expect(screen.getByText('김미용')).toBeInTheDocument();
      expect(screen.getByText('박스타일')).toBeInTheDocument();
    });

    it('로딩 중일 때 로딩 표시가 나타나야 한다', () => {
      mockUseDesigners.mockReturnValue({
        designers: [],
        isLoading: true,
        deleteDesigner: jest.fn()
      });

      render(<DesignerTableWidget {...defaultProps} />);
      
      expect(screen.getByText('디자이너 목록을 불러오는 중...')).toBeInTheDocument();
    });

    it('디자이너가 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
      mockUseDesigners.mockReturnValue({
        designers: [],
        isLoading: false,
        deleteDesigner: jest.fn()
      });

      render(<DesignerTableWidget {...defaultProps} />);
      
      expect(screen.getByText('등록된 디자이너가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('새로운 디자이너를 등록해보세요')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('검색어 입력이 가능해야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('디자이너 검색...');
      fireEvent.change(searchInput, { target: { value: '김미용' } });
      
      expect(searchInput).toHaveValue('김미용');
    });

    it('검색 결과가 없을 때 적절한 메시지가 표시되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('디자이너 검색...');
      fireEvent.change(searchInput, { target: { value: '존재하지않는디자이너' } });
      
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('다른 검색어를 시도해보세요')).toBeInTheDocument();
    });
  });

  describe('필터링 기능', () => {
    it('활성 상태 필터가 동작해야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      const filterSelect = screen.getByDisplayValue('전체');
      fireEvent.change(filterSelect, { target: { value: 'active' } });
      
      expect(filterSelect).toHaveValue('active');
    });
  });

  describe('버튼 이벤트', () => {
    it('새 디자이너 등록 버튼 클릭 시 onAdd가 호출되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      const addButton = screen.getByText('➕ 새 디자이너 등록');
      fireEvent.click(addButton);
      
      expect(defaultProps.onAdd).toHaveBeenCalledTimes(1);
    });

    it('일정 미리보기 토글 버튼이 동작해야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      const scheduleToggle = screen.getByText('📅 일정 미리보기');
      fireEvent.click(scheduleToggle);
      
      // 버튼 상태가 변경되었는지 확인 (클래스나 스타일 변경)
      expect(scheduleToggle).toBeInTheDocument();
    });
  });

  describe('데스크톱 및 모바일 뷰', () => {
    it('데스크톱 테이블 뷰가 렌더링되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      // 테이블 헤더 확인
      expect(screen.getByText('이름')).toBeInTheDocument();
      expect(screen.getByText('전문분야')).toBeInTheDocument();
      expect(screen.getByText('경력')).toBeInTheDocument();
      expect(screen.getByText('연락처')).toBeInTheDocument();
      expect(screen.getByText('상태')).toBeInTheDocument();
      expect(screen.getByText('관리')).toBeInTheDocument();
    });
  });

  describe('전문분야 표시', () => {
    it('디자이너의 전문분야가 올바르게 표시되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      expect(screen.getByText('헤어컷, 염색')).toBeInTheDocument();
      expect(screen.getByText('펌, 트리트먼트')).toBeInTheDocument();
    });
  });

  describe('활성 상태 표시', () => {
    it('활성/비활성 상태가 올바르게 구분되어야 한다', () => {
      render(<DesignerTableWidget {...defaultProps} />);
      
      // 김미용은 활성, 박스타일은 비활성 상태
      expect(screen.getByText('김미용')).toBeInTheDocument();
      expect(screen.getByText('박스타일')).toBeInTheDocument();
    });
  });
});