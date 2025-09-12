import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DesignersPage } from '../ui/DesignersPage';
import type { Designer } from '~/entities/designer';

// Mock data
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
  },
  {
    id: '2',
    name: '박헤어',
    specialties: ['펌', '트리트먼트'],
    phone: '010-3333-4444',
    email: 'park@salon.com',
    isActive: false,
    schedule: {
      monday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      tuesday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      wednesday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      thursday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      friday: { isWorking: true, startTime: '10:00', endTime: '19:00' },
      saturday: { isWorking: false, startTime: null, endTime: null },
      sunday: { isWorking: false, startTime: null, endTime: null }
    },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

// Mocks
jest.mock('~/features/designer-management', () => ({
  useDesigners: jest.fn()
}));

jest.mock('~/widgets/designer-table', () => ({
  DesignerTableWidget: ({ onEdit, onDelete, onAdd }: any) => (
    <div data-testid="designer-table-widget">
      <div>디자이너 테이블 위젯</div>
      {mockDesigners.map((designer) => (
        <div key={designer.id} data-testid={`designer-${designer.id}`}>
          <span>{designer.name}</span>
          <button onClick={() => onEdit(designer)}>편집</button>
          <button onClick={() => onDelete(designer)}>삭제</button>
        </div>
      ))}
      <button onClick={onAdd}>디자이너 추가</button>
    </div>
  )
}));

// window.confirm mock
global.confirm = jest.fn();

describe('DesignersPage Integration Tests', () => {
  const mockDeleteDesigner = jest.fn();

  beforeEach(() => {
    const { useDesigners } = require('~/features/designer-management');
    useDesigners.mockReturnValue({
      deleteDesigner: mockDeleteDesigner
    });

    jest.clearAllMocks();
    (global.confirm as jest.Mock).mockReturnValue(true);
    
    // console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('페이지 기본 렌더링', () => {
    it('디자이너 테이블 위젯이 렌더링되어야 한다', () => {
      render(<DesignersPage />);

      expect(screen.getByTestId('designer-table-widget')).toBeInTheDocument();
      expect(screen.getByText('디자이너 테이블 위젯')).toBeInTheDocument();
    });

    it('초기 상태에서는 폼 모달이 표시되지 않아야 한다', () => {
      render(<DesignersPage />);

      expect(screen.queryByText('디자이너 정보 수정')).not.toBeInTheDocument();
      expect(screen.queryByText('새 디자이너 등록')).not.toBeInTheDocument();
    });

    it('디자이너 목록이 테이블에 표시되어야 한다', () => {
      render(<DesignersPage />);

      expect(screen.getByTestId('designer-1')).toBeInTheDocument();
      expect(screen.getByTestId('designer-2')).toBeInTheDocument();
      expect(screen.getByText('김미용')).toBeInTheDocument();
      expect(screen.getByText('박헤어')).toBeInTheDocument();
    });
  });

  describe('디자이너 편집 기능', () => {
    it('편집 버튼 클릭 시 편집 모달이 표시되어야 한다', () => {
      render(<DesignersPage />);

      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('디자이너 정보 수정')).toBeInTheDocument();
      expect(screen.getByDisplayValue('김미용')).toBeInTheDocument();
      expect(screen.getByDisplayValue('커트, 컬러')).toBeInTheDocument();
      expect(screen.getByDisplayValue('010-1111-2222')).toBeInTheDocument();
      expect(screen.getByDisplayValue('kim@salon.com')).toBeInTheDocument();
    });

    it('편집 모달에서 활성화 상태가 올바르게 표시되어야 한다', () => {
      render(<DesignersPage />);

      // 활성화된 디자이너 편집
      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      const activeCheckbox = screen.getByLabelText('활성화') as HTMLInputElement;
      expect(activeCheckbox.checked).toBe(true);
    });

    it('비활성화된 디자이너 편집 시 체크박스가 해제되어야 한다', () => {
      render(<DesignersPage />);

      // 비활성화된 디자이너 편집
      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[1]); // 박헤어 (isActive: false)

      const activeCheckbox = screen.getByLabelText('활성화') as HTMLInputElement;
      expect(activeCheckbox.checked).toBe(false);
    });

    it('편집 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<DesignersPage />);

      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      expect(consoleSpy).toHaveBeenCalledWith('디자이너 편집:', '김미용');
    });
  });

  describe('디자이너 삭제 기능', () => {
    it('삭제 버튼 클릭 시 확인 대화상자가 표시되어야 한다', () => {
      render(<DesignersPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalledWith('정말로 "김미용" 디자이너를 삭제하시겠습니까?');
    });

    it('삭제 확인 시 삭제 함수가 호출되어야 한다', async () => {
      mockDeleteDesigner.mockResolvedValueOnce(undefined);
      
      render(<DesignersPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteDesigner).toHaveBeenCalledWith('1');
      });
    });

    it('삭제 취소 시 삭제 함수가 호출되지 않아야 한다', () => {
      (global.confirm as jest.Mock).mockReturnValue(false);
      
      render(<DesignersPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteDesigner).not.toHaveBeenCalled();
    });

    it('삭제 성공 시 콘솔에 로그가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockDeleteDesigner.mockResolvedValueOnce(undefined);
      
      render(<DesignersPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('디자이너 삭제 완료:', '김미용');
      });
    });

    it('삭제 실패 시 콘솔에 에러가 출력되어야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('삭제 실패');
      mockDeleteDesigner.mockRejectedValueOnce(error);
      
      render(<DesignersPage />);

      const deleteButtons = screen.getAllByText('삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('디자이너 삭제 실패:', error);
      });
    });
  });

  describe('디자이너 추가 기능', () => {
    it('추가 버튼 클릭 시 등록 모달이 표시되어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 디자이너 등록')).toBeInTheDocument();
      expect(screen.getByText('등록')).toBeInTheDocument();
    });

    it('등록 모달에서 폼 필드들이 비어있어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const nameInput = screen.getByLabelText('이름 *') as HTMLInputElement;
      const specialtiesInput = screen.getByLabelText('전문분야') as HTMLInputElement;
      const phoneInput = screen.getByLabelText('연락처') as HTMLInputElement;
      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;

      expect(nameInput.value).toBe('');
      expect(specialtiesInput.value).toBe('');
      expect(phoneInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });

    it('등록 모달에서 활성화 체크박스가 기본적으로 체크되어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const activeCheckbox = screen.getByLabelText('활성화') as HTMLInputElement;
      expect(activeCheckbox.checked).toBe(true);
    });

    it('추가 시 콘솔에 로그가 출력되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      expect(consoleSpy).toHaveBeenCalledWith('새 디자이너 등록');
    });
  });

  describe('폼 제출 기능', () => {
    it('편집 모달에서 수정 버튼 클릭 시 수정 로직이 실행되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<DesignersPage />);

      // 편집 모달 열기
      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      // 수정 버튼 클릭
      const submitButton = screen.getByText('수정');
      fireEvent.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith('디자이너 수정:', {});
    });

    it('등록 모달에서 등록 버튼 클릭 시 추가 로직이 실행되어야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(<DesignersPage />);

      // 등록 모달 열기
      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      // 등록 버튼 클릭
      const submitButton = screen.getByText('등록');
      fireEvent.click(submitButton);

      expect(consoleSpy).toHaveBeenCalledWith('디자이너 추가:', {});
    });

    it('폼 제출 후 모달이 닫혀야 한다', () => {
      render(<DesignersPage />);

      // 등록 모달 열기
      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 디자이너 등록')).toBeInTheDocument();

      // 등록 버튼 클릭
      const submitButton = screen.getByText('등록');
      fireEvent.click(submitButton);

      expect(screen.queryByText('새 디자이너 등록')).not.toBeInTheDocument();
    });
  });

  describe('모달 닫기 기능', () => {
    it('편집 모달의 취소 버튼이 동작해야 한다', () => {
      render(<DesignersPage />);

      // 편집 모달 열기
      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      expect(screen.getByText('디자이너 정보 수정')).toBeInTheDocument();

      // 취소 버튼 클릭
      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('디자이너 정보 수정')).not.toBeInTheDocument();
    });

    it('등록 모달의 취소 버튼이 동작해야 한다', () => {
      render(<DesignersPage />);

      // 등록 모달 열기
      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      expect(screen.getByText('새 디자이너 등록')).toBeInTheDocument();

      // 취소 버튼 클릭
      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('새 디자이너 등록')).not.toBeInTheDocument();
    });
  });

  describe('폼 필드 유효성', () => {
    it('필수 필드에 required 속성이 있어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const nameInput = screen.getByLabelText('이름 *') as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });

    it('경력 입력 필드가 숫자 타입이어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const experienceInput = screen.getByLabelText('경력 (년)') as HTMLInputElement;
      expect(experienceInput.type).toBe('number');
      expect(experienceInput.min).toBe('0');
    });

    it('연락처 필드가 tel 타입이어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const phoneInput = screen.getByLabelText('연락처') as HTMLInputElement;
      expect(phoneInput.type).toBe('tel');
    });

    it('이메일 필드가 email 타입이어야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const emailInput = screen.getByLabelText('이메일') as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });
  });

  describe('모달 레이아웃', () => {
    it('모달이 올바른 구조를 가져야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      // 모달 백드롭
      const modalBackdrop = screen.getByText('새 디자이너 등록').closest('.fixed.inset-0');
      expect(modalBackdrop).toHaveClass('bg-black/50', 'flex', 'items-center', 'justify-center', 'z-50');

      // 모달 컨텐츠
      const modalContent = screen.getByText('새 디자이너 등록').closest('.glass-card');
      expect(modalContent).toHaveClass('p-6', 'max-w-2xl', 'w-full', 'mx-4', 'max-h-[80vh]', 'overflow-y-auto');
    });

    it('폼이 적절한 간격을 가져야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const form = screen.getByRole('form');
      expect(form).toHaveClass('space-y-4');
    });

    it('버튼 영역이 적절한 레이아웃을 가져야 한다', () => {
      render(<DesignersPage />);

      const addButton = screen.getByText('디자이너 추가');
      fireEvent.click(addButton);

      const buttonContainer = screen.getByText('취소').closest('.flex');
      expect(buttonContainer).toHaveClass('justify-end', 'space-x-3', 'mt-6');
    });
  });

  describe('전문분야 표시', () => {
    it('전문분야가 쉼표로 구분되어 표시되어야 한다', () => {
      render(<DesignersPage />);

      const editButtons = screen.getAllByText('편집');
      fireEvent.click(editButtons[0]);

      expect(screen.getByDisplayValue('커트, 컬러')).toBeInTheDocument();
    });

    it('전문분야가 없는 경우 빈 값이 표시되어야 한다', () => {
      // 전문분야가 없는 디자이너 데이터로 모킹
      const designersWithoutSpecialties = [
        {
          ...mockDesigners[0],
          specialties: []
        }
      ];

      jest.doMock('~/widgets/designer-table', () => ({
        DesignerTableWidget: ({ onEdit }: any) => (
          <div data-testid="designer-table-widget">
            <button onClick={() => onEdit(designersWithoutSpecialties[0])}>
              편집
            </button>
          </div>
        )
      }));

      render(<DesignersPage />);

      const editButton = screen.getByText('편집');
      fireEvent.click(editButton);

      const specialtiesInput = screen.getByLabelText('전문분야') as HTMLInputElement;
      expect(specialtiesInput.value).toBe('');
    });
  });
});