import React from 'react';
import { render, screen } from '@testing-library/react';
import AppointmentForm from './components/AppointmentForm';
import ReservationTable from './components/ReservationTable';

// Mock axios to avoid network calls
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} }))
}));

describe('AppointmentForm Component', () => {
  test('renders all form fields', () => {
    render(<AppointmentForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/고객 이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/날짜/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/시간/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/스타일리스트/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/서비스 유형/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<AppointmentForm onSubmit={jest.fn()} />);
    expect(screen.getByRole('button', { name: /예약하기/i })).toBeInTheDocument();
  });

  test('renders correctly without validation errors prop', () => {
    render(<AppointmentForm onSubmit={jest.fn()} />);
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
      />
    );
    
    expect(screen.getByText(/수정/i)).toBeInTheDocument();
    expect(screen.getByText(/삭제/i)).toBeInTheDocument();
  });
});
