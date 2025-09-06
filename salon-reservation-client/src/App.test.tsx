import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentForm from './components/AppointmentForm';
import ReservationTable from './components/ReservationTable';
import DesignerForm from './components/DesignerForm';
import DesignerTable from './components/DesignerTable';

// Mock axios to avoid network calls
jest.mock('axios', () => ({
  get: jest.fn((url) => {
    if (url.includes('designers')) {
      return Promise.resolve({ 
        data: [
          { _id: '1', name: '김민수', specialization: '헤어컷 전문', is_active: true },
          { _id: '2', name: '이영희', specialization: '염색 전문', is_active: true }
        ]
      });
    }
    return Promise.resolve({ data: [] });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} }))
}));

describe('AppointmentForm Component', () => {
  test('renders all form fields', () => {
    render(<AppointmentForm onSubmit={jest.fn()} selectedDate="2025-09-05" />);
    
    expect(screen.getByLabelText(/고객 이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/시간/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/헤어 디자이너/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/서비스 유형/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<AppointmentForm onSubmit={jest.fn()} selectedDate="2025-09-05" />);
    expect(screen.getByRole('button', { name: /예약하기/i })).toBeInTheDocument();
  });

  test('renders correctly without validation errors prop', () => {
    render(<AppointmentForm onSubmit={jest.fn()} selectedDate="2025-09-05" />);
    expect(screen.getByLabelText(/고객 이름/i)).toBeInTheDocument();
  });
});

describe('ReservationTable Component', () => {
  const mockReservations = [
    {
      _id: '1',
      customerName: '김민재',
      date: '2025-09-15',
      time: '10:00',
      stylist: 'John',
      serviceType: 'Haircut'
    }
  ];

  test('displays reservations correctly', () => {
    render(
      <ReservationTable 
        reservations={mockReservations}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        selectedDate="2024-01-15"
      />
    );
    
    expect(screen.getAllByText('김민재')).toHaveLength(2); // Desktop table + Mobile card
    expect(screen.getAllByText('John')).toHaveLength(2);
  });

  test('displays empty state when no reservations', () => {
    render(
      <ReservationTable 
        reservations={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        selectedDate="2024-01-15"
      />
    );
    
    expect(screen.getByText(/예약이 없습니다/i)).toBeInTheDocument();
  });

  test('renders edit and delete buttons', () => {
    render(
      <ReservationTable 
        reservations={mockReservations}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        selectedDate="2024-01-15"
      />
    );
    
    expect(screen.getByText(/수정/i)).toBeInTheDocument();
    expect(screen.getByText(/삭제/i)).toBeInTheDocument();
  });
});

describe('DesignerForm Component', () => {
  test('renders all form fields', () => {
    render(<DesignerForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/디자이너 이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전문분야/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/경력/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/소개/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/활성화 상태/i)).toBeInTheDocument();
  });

  test('renders submit button for new designer', () => {
    render(<DesignerForm onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: /등록하기/i })).toBeInTheDocument();
  });

  test('renders edit mode correctly', () => {
    const mockDesigner = {
      _id: '1',
      name: '김민수',
      specialization: '헤어컷 전문',
      phone: '010-1234-5678',
      email: 'test@salon.com',
      experience_years: 5,
      bio: '경험 많은 디자이너',
      is_active: true
    };

    render(
      <DesignerForm 
        onSubmit={jest.fn()}
        initialData={mockDesigner}
        isEditing={true}
      />
    );
    
    expect(screen.getByRole('button', { name: /수정하기/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('김민수')).toBeInTheDocument();
    expect(screen.getByDisplayValue('헤어컷 전문')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const mockSubmit = jest.fn();
    render(<DesignerForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /등록하기/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/디자이너 이름은 필수입니다/i)).toBeInTheDocument();
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});

describe('DesignerTable Component', () => {
  const mockDesigners = [
    {
      _id: '1',
      name: '김민수',
      specialization: '헤어컷 전문',
      phone: '010-1234-5678',
      email: 'test@salon.com',
      experience_years: 5,
      bio: '경험 많은 디자이너',
      is_active: true
    },
    {
      _id: '2', 
      name: '이영희',
      specialization: '염색 전문',
      phone: '010-9876-5432',
      email: 'younghee@salon.com',
      experience_years: 3,
      bio: '컬러 전문가',
      is_active: false
    }
  ];

  test('displays designers correctly', () => {
    render(
      <DesignerTable 
        designers={mockDesigners}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getAllByText('김민수')).toHaveLength(2); // Desktop table + Mobile card
    expect(screen.getAllByText('이영희')).toHaveLength(2); // Desktop table + Mobile card
    expect(screen.getByText('헤어컷 전문')).toBeInTheDocument();
    expect(screen.getByText('염색 전문')).toBeInTheDocument();
  });

  test('displays empty state when no designers', () => {
    render(
      <DesignerTable 
        designers={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText(/등록된 디자이너가 없습니다/i)).toBeInTheDocument();
  });

  test('renders edit and delete buttons for each designer', () => {
    render(
      <DesignerTable 
        designers={mockDesigners}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    const editButtons = screen.getAllByText(/수정/i);
    const deleteButtons = screen.getAllByText(/삭제/i);
    
    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  test('filters designers by search term', () => {
    render(
      <DesignerTable 
        designers={mockDesigners}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/디자이너 검색/i);
    fireEvent.change(searchInput, { target: { value: '김민수' } });
    
    expect(screen.getAllByText('김민수')).toHaveLength(2); // Desktop table + Mobile card
    expect(screen.queryByText('이영희')).not.toBeInTheDocument();
  });

  test('filters designers by active status', () => {
    render(
      <DesignerTable 
        designers={mockDesigners}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    const filterSelect = screen.getByDisplayValue('전체');
    fireEvent.change(filterSelect, { target: { value: 'active' } });
    
    expect(screen.getAllByText('김민수')).toHaveLength(2); // Desktop table + Mobile card
    expect(screen.queryByText('이영희')).not.toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(
      <DesignerTable 
        designers={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/디자이너 목록을 불러오는 중/i)).toBeInTheDocument();
  });
});

describe('AppointmentForm with Designer Integration', () => {
  test('renders designer field instead of stylist', async () => {
    render(<AppointmentForm onSubmit={jest.fn()} selectedDate="2025-09-05" />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/헤어 디자이너/i)).toBeInTheDocument();
    });
  });

  test('shows loading state for designers', () => {
    render(<AppointmentForm onSubmit={jest.fn()} selectedDate="2025-09-05" />);
    
    expect(screen.getByText(/디자이너 목록 로딩 중/i)).toBeInTheDocument();
  });
});
