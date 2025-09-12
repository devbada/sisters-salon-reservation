import { http, HttpResponse } from 'msw';
import type { Designer } from '~/entities/designer';
import type { Customer } from '~/entities/customer';
import type { Reservation, ConflictInfo, ReservationConflict } from '~/entities/reservation';
import type { BusinessHour, SpecialHour, BusinessHoliday } from '~/shared/lib/types';

// Mock 데이터
const mockDesigners: Designer[] = [
  {
    id: '1',
    name: '김미용',
    phone: '010-1111-2222',
    email: 'kim@salon.com',
    specialties: ['헤어컷', '염색', '하이라이트'],
    workSchedule: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '17:00' }
    },
    isActive: true,
    hireDate: '2023-01-01',
    rating: 4.8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2', 
    name: '박스타일',
    phone: '010-3333-4444',
    email: 'park@salon.com',
    specialties: ['펌', '트리트먼트', '스타일링'],
    workSchedule: {
      monday: { start: '10:00', end: '19:00' },
      tuesday: { start: '10:00', end: '19:00' },
      wednesday: { start: '10:00', end: '19:00' },
      thursday: { start: '10:00', end: '19:00' },
      friday: { start: '10:00', end: '19:00' }
    },
    isActive: true,
    hireDate: '2023-06-01',
    rating: 4.5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: '이헤어',
    phone: '010-5555-6666',
    email: 'lee@salon.com', 
    specialties: ['브리치', '옴브레', '발라야지'],
    workSchedule: {
      tuesday: { start: '11:00', end: '20:00' },
      wednesday: { start: '11:00', end: '20:00' },
      thursday: { start: '11:00', end: '20:00' },
      friday: { start: '11:00', end: '20:00' },
      saturday: { start: '10:00', end: '18:00' },
      sunday: { start: '10:00', end: '16:00' }
    },
    isActive: true,
    hireDate: '2023-03-15',
    rating: 4.9,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '4',
    name: '최컬러',
    phone: '010-7777-8888',
    email: 'choi@salon.com',
    specialties: ['컬러링', '보정', '탈색'],
    workSchedule: {
      monday: { start: '09:30', end: '18:30' },
      tuesday: { start: '09:30', end: '18:30' },
      wednesday: { start: '09:30', end: '18:30' },
      thursday: { start: '09:30', end: '18:30' },
      friday: { start: '09:30', end: '18:30' }
    },
    isActive: false,
    hireDate: '2022-08-01',
    rating: 4.6,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '김영희',
    phone: '010-1234-5678',
    email: 'younghee@test.com',
    isVip: true,
    birthDate: '1985-03-15',
    totalVisits: 15,
    lastVisit: '2025-08-20',
    preferences: {
      preferredDesigner: '김미용',
      preferredServices: ['헤어컷', '염색', '하이라이트']
    },
    createdAt: '2023-01-01',
    updatedAt: '2025-08-20'
  },
  {
    id: '2',
    name: '박민수',
    phone: '010-2345-6789',
    email: 'minsu@test.com',
    isVip: false,
    birthDate: '1992-07-22',
    totalVisits: 3,
    lastVisit: '2025-07-10',
    preferences: {
      preferredDesigner: '박스타일',
      preferredServices: ['헤어컷', '스타일링']
    },
    createdAt: '2024-05-01',
    updatedAt: '2025-07-10'
  },
  {
    id: '3',
    name: '이지은',
    phone: '010-3456-7890',
    email: 'jieun@test.com',
    isVip: true,
    birthDate: '1988-11-03',
    totalVisits: 22,
    lastVisit: '2025-09-05',
    preferences: {
      preferredDesigner: '이헤어',
      preferredServices: ['브리치', '옴브레', '발라야지']
    },
    createdAt: '2022-08-15',
    updatedAt: '2025-09-05'
  },
  {
    id: '4',
    name: '정수현',
    phone: '010-4567-8901',
    email: 'suhyun@test.com',
    isVip: false,
    birthDate: '1995-12-10',
    totalVisits: 7,
    lastVisit: '2025-08-28',
    preferences: {
      preferredDesigner: '최컬러',
      preferredServices: ['컬러링', '보정']
    },
    createdAt: '2024-01-20',
    updatedAt: '2025-08-28'
  },
  {
    id: '5',
    name: '최서연',
    phone: '010-5678-9012',
    email: 'seoyeon@test.com',
    isVip: false,
    birthDate: '1998-04-18',
    totalVisits: 2,
    lastVisit: '2025-06-15',
    preferences: {
      preferredDesigner: '박스타일',
      preferredServices: ['펌', '트리트먼트']
    },
    createdAt: '2025-04-01',
    updatedAt: '2025-06-15'
  }
];

const mockReservations: Reservation[] = [
  {
    id: '1',
    customerName: '김영희',
    customerPhone: '010-1234-5678',
    customerEmail: 'younghee@test.com',
    designerName: '김미용',
    date: '2025-09-15',
    time: '10:00',
    duration: 120,
    service: '헤어컷 + 염색',
    price: 85000,
    status: 'confirmed',
    notes: 'VIP 고객, 브라운 계열 염색 희망',
    createdAt: '2025-09-01',
    updatedAt: '2025-09-01'
  },
  {
    id: '2',
    customerName: '박민수',
    customerPhone: '010-2345-6789',
    customerEmail: 'minsu@test.com',
    designerName: '박스타일',
    date: '2025-09-16',
    time: '14:00',
    duration: 60,
    service: '헤어컷',
    price: 28000,
    status: 'pending',
    notes: '첫 방문, 상담 후 스타일 결정',
    createdAt: '2025-09-12',
    updatedAt: '2025-09-12'
  },
  {
    id: '3',
    customerName: '이지은',
    customerPhone: '010-3456-7890',
    customerEmail: 'jieun@test.com',
    designerName: '이헤어',
    date: '2025-09-18',
    time: '11:00',
    duration: 180,
    service: '발라야지',
    price: 150000,
    status: 'confirmed',
    notes: 'VIP 고객, 내추럴한 발라야지 스타일',
    createdAt: '2025-09-10',
    updatedAt: '2025-09-10'
  },
  {
    id: '4',
    customerName: '정수현',
    customerPhone: '010-4567-8901',
    customerEmail: 'suhyun@test.com',
    designerName: '최컬러',
    date: '2025-09-20',
    time: '15:30',
    duration: 90,
    service: '컬러 보정',
    price: 65000,
    status: 'cancelled',
    notes: '개인 사정으로 취소',
    createdAt: '2025-09-05',
    updatedAt: '2025-09-12'
  },
  {
    id: '5',
    customerName: '최서연',
    customerPhone: '010-5678-9012',
    customerEmail: 'seoyeon@test.com',
    designerName: '박스타일',
    date: '2025-09-22',
    time: '13:00',
    duration: 150,
    service: '펌 + 트리트먼트',
    price: 95000,
    status: 'confirmed',
    notes: '자연스러운 웨이브 펜',
    createdAt: '2025-09-08',
    updatedAt: '2025-09-08'
  },
  {
    id: '6',
    customerName: '김영희',
    customerPhone: '010-1234-5678',
    customerEmail: 'younghee@test.com',
    designerName: '이헤어',
    date: '2025-09-25',
    time: '16:00',
    duration: 60,
    service: '트리트먼트',
    price: 45000,
    status: 'completed',
    notes: 'VIP 고객, 케라틴 트리트먼트',
    createdAt: '2025-08-25',
    updatedAt: '2025-09-25'
  }
];

// 영업시간 관련 Mock 데이터
const mockBusinessHours: BusinessHour[] = [
  {
    id: 'bh-1',
    dayOfWeek: 0, // 일요일
    dayName: 'sunday',
    isOpen: false,
    openTime: '',
    closeTime: '',
    isActive: true
  },
  {
    id: 'bh-2',
    dayOfWeek: 1, // 월요일
    dayName: 'monday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  },
  {
    id: 'bh-3',
    dayOfWeek: 2, // 화요일
    dayName: 'tuesday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  },
  {
    id: 'bh-4',
    dayOfWeek: 3, // 수요일
    dayName: 'wednesday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  },
  {
    id: 'bh-5',
    dayOfWeek: 4, // 목요일
    dayName: 'thursday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  },
  {
    id: 'bh-6',
    dayOfWeek: 5, // 금요일
    dayName: 'friday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  },
  {
    id: 'bh-7',
    dayOfWeek: 6, // 토요일
    dayName: 'saturday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isActive: true
  }
];

const mockSpecialHours: SpecialHour[] = [
  {
    id: 'sh-1',
    date: '2025-12-25',
    reason: '크리스마스',
    type: 'closed',
    notes: '크리스마스 휴무',
    isActive: true
  },
  {
    id: 'sh-2',
    date: '2025-12-31',
    reason: '연말',
    type: 'modified',
    openTime: '10:00',
    closeTime: '15:00',
    notes: '연말 단축 영업',
    isActive: true
  },
  {
    id: 'sh-3',
    date: '2025-09-20',
    reason: '직원 연수',
    type: 'modified',
    openTime: '11:00',
    closeTime: '16:00',
    notes: '오전 직원 연수로 인한 단축 영업',
    isActive: true
  }
];

const mockHolidays: BusinessHoliday[] = [
  {
    id: 'h-1',
    date: '2025-01-01',
    name: '신정',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-2',
    date: '2025-01-28',
    name: '설날',
    type: 'public',
    isRecurring: false,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-3',
    date: '2025-01-30',
    name: '설날 대체공휴일',
    type: 'public',
    isRecurring: false,
    isClosed: true,
    isSubstitute: true
  },
  {
    id: 'h-4',
    date: '2025-03-01',
    name: '삼일절',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-5',
    date: '2025-05-05',
    name: '어린이날',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-6',
    date: '2025-06-06',
    name: '현충일',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-7',
    date: '2025-08-15',
    name: '광복절',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-8',
    date: '2025-10-03',
    name: '개천절',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-9',
    date: '2025-10-09',
    name: '한글날',
    type: 'public',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false
  },
  {
    id: 'h-10',
    date: '2025-12-25',
    name: '크리스마스',
    type: 'custom',
    isRecurring: true,
    isClosed: true,
    isSubstitute: false,
    notes: '매장 휴무'
  }
];

// Mock conflicts data and generation functions
const generateMockConflicts = (): ConflictInfo[] => {
  // 중복 예약이 있는 날짜들을 설정
  const conflictDates = ['2025-09-20', '2025-09-25', '2025-10-05'];
  
  return conflictDates.map(date => ({
    date,
    conflicts: [
      {
        id: `conflict-${date}`,
        date,
        conflictType: 'time_overlap' as const,
        reservations: ['1', '2'], // 충돌하는 예약 ID들
        message: '같은 시간대에 중복 예약이 있습니다.',
        severity: 'warning' as const,
        createdAt: new Date().toISOString()
      }
    ]
  }));
};

// Mock conflicts를 전역에서 사용할 수 있도록 생성
const mockConflicts = generateMockConflicts();

export const handlers = [
  // Designer API
  http.get('/api/designers', () => {
    return HttpResponse.json(mockDesigners);
  }),

  http.get('*/designers', () => {
    return HttpResponse.json(mockDesigners);
  }),
  
  http.post('/api/designers', async ({ request }) => {
    const newDesigner = await request.json() as Omit<Designer, 'id' | 'createdAt' | 'updatedAt'>;
    const designer: Designer = {
      ...newDesigner,
      id: String(mockDesigners.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockDesigners.push(designer);
    return HttpResponse.json(designer, { status: 201 });
  }),

  http.put('/api/designers/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<Designer>;
    const index = mockDesigners.findIndex(d => d.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Designer not found' }, { status: 404 });
    }
    
    mockDesigners[index] = {
      ...mockDesigners[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockDesigners[index]);
  }),

  http.delete('/api/designers/:id', ({ params }) => {
    const { id } = params;
    const index = mockDesigners.findIndex(d => d.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Designer not found' }, { status: 404 });
    }
    mockDesigners.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Customer API  
  http.get('/api/customers', () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.get('/api/customers/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json([]);
    }

    const filteredCustomers = mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query.toLowerCase()))
    );
    
    return HttpResponse.json(filteredCustomers);
  }),

  http.post('/api/customers', async ({ request }) => {
    const newCustomer = await request.json() as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
    const customer: Customer = {
      ...newCustomer,
      id: String(mockCustomers.length + 1),
      totalVisits: 0,
      lastVisit: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockCustomers.push(customer);
    return HttpResponse.json(customer, { status: 201 });
  }),

  http.put('/api/customers/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<Customer>;
    const index = mockCustomers.findIndex(c => c.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    mockCustomers[index] = {
      ...mockCustomers[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockCustomers[index]);
  }),

  http.delete('/api/customers/:id', ({ params }) => {
    const { id } = params;
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    mockCustomers.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Reservation API (appointments 엔드포인트 사용)
  http.get('/api/appointments', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (date) {
      const filteredReservations = mockReservations.filter(r => r.date === date);
      return HttpResponse.json(filteredReservations);
    }
    
    return HttpResponse.json(mockReservations);
  }),

  // Reservation API (절대 URL 패턴도 지원)
  http.get('*/appointments', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    if (date) {
      const filteredReservations = mockReservations.filter(r => r.date === date);
      return HttpResponse.json(filteredReservations);
    }
    
    return HttpResponse.json(mockReservations);
  }),

  http.post('/api/appointments', async ({ request }) => {
    const newReservation = await request.json() as Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>;
    const reservation: Reservation = {
      ...newReservation,
      id: String(mockReservations.length + 1),
      status: newReservation.status || 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockReservations.push(reservation);
    return HttpResponse.json(reservation, { status: 201 });
  }),

  http.post('*/appointments', async ({ request }) => {
    const newReservation = await request.json() as Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>;
    const reservation: Reservation = {
      ...newReservation,
      id: String(mockReservations.length + 1),
      status: newReservation.status || 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockReservations.push(reservation);
    return HttpResponse.json(reservation, { status: 201 });
  }),

  http.put('/api/appointments/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<Reservation>;
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations[index] = {
      ...mockReservations[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockReservations[index]);
  }),

  http.put('*/appointments/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<Reservation>;
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations[index] = {
      ...mockReservations[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockReservations[index]);
  }),

  http.delete('/api/appointments/:id', ({ params }) => {
    const { id } = params;
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  http.delete('*/appointments/:id', ({ params }) => {
    const { id } = params;
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  http.patch('/api/appointments/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json() as { status: string };
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations[index] = {
      ...mockReservations[index],
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockReservations[index]);
  }),

  http.patch('*/appointments/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json() as { status: string };
    const index = mockReservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    mockReservations[index] = {
      ...mockReservations[index],
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(mockReservations[index]);
  }),

  http.post('/api/appointments/check-conflicts', async ({ request }) => {
    // 충돌 체크 로직 (간단한 예시)
    const data = await request.json() as any;
    const conflicts = mockReservations.filter(r => 
      r.designerName === data.designerName && 
      r.date === data.date &&
      r.time === data.time
    );
    
    return HttpResponse.json(conflicts.map(r => ({
      reservationId: r.id,
      conflictType: 'time_overlap',
      message: '같은 시간에 다른 예약이 있습니다.'
    })));
  }),

  http.post('*/appointments/check-conflicts', async ({ request }) => {
    // 충돌 체크 로직 (간단한 예시)
    const data = await request.json() as any;
    const conflicts = mockReservations.filter(r => 
      r.designerName === data.designerName && 
      r.date === data.date &&
      r.time === data.time
    );
    
    return HttpResponse.json(conflicts.map(r => ({
      reservationId: r.id,
      conflictType: 'time_overlap',
      message: '같은 시간에 다른 예약이 있습니다.'
    })));
  }),


  // Auth API - 관리자 상태 추적을 위한 클로저
  ...(() => {
    let adminRegistered = false;
    let adminData: any = null;

    return [
      // 관리자 존재 여부 확인
      http.get('/api/auth/check-admin', () => {
        return HttpResponse.json({ hasAdmin: adminRegistered });
      }),

      // 관리자 등록
      http.post('/api/auth/register', async ({ request }) => {
        const { username, password, email } = await request.json() as any;
        
        if (adminRegistered) {
          return HttpResponse.json(
            { error: '이미 관리자가 등록되어 있습니다.' },
            { status: 400 }
          );
        }

        adminData = {
          id: '1',
          username,
          password, // 실제로는 해싱해야 하지만 테스트용
          email: email || `${username}@admin.com`,
          name: username,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        adminRegistered = true;

        const { password: _, ...userWithoutPassword } = adminData;
        return HttpResponse.json({
          user: userWithoutPassword,
          token: 'mock-jwt-token',
          message: '관리자 등록이 완료되었습니다.'
        }, { status: 201 });
      }),

      // 로그인 (등록된 관리자 정보 사용)
      http.post('/api/auth/login', async ({ request }) => {
        const { email, password } = await request.json() as any;
        
        if (!adminRegistered) {
          return HttpResponse.json(
            { error: '등록된 관리자가 없습니다.' },
            { status: 401 }
          );
        }

        // 이메일로 로그인 (사용자명@admin.com 형태)
        const loginEmail = email.includes('@') ? email : `${email}@admin.com`;
        
        if ((adminData.email === loginEmail || adminData.username === email) && 
            adminData.password === password) {
          const { password: _, ...userWithoutPassword } = adminData;
          return HttpResponse.json({
            user: userWithoutPassword,
            token: 'mock-jwt-token'
          });
        }
        
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }),
    ];
  })(),

  // Business Hours API
  http.get('/api/business-hours', () => {
    return HttpResponse.json(mockBusinessHours);
  }),

  http.put('/api/business-hours', async ({ request }) => {
    const updatedHours = await request.json() as BusinessHour[];
    
    // Mock에서는 단순히 전체 교체
    mockBusinessHours.splice(0, mockBusinessHours.length, ...updatedHours);
    
    return HttpResponse.json(mockBusinessHours);
  }),

  // Special Hours API
  http.get('/api/special-hours', () => {
    return HttpResponse.json(mockSpecialHours);
  }),

  http.post('/api/special-hours', async ({ request }) => {
    const newSpecialHour = await request.json() as Omit<SpecialHour, 'id'>;
    const specialHour: SpecialHour = {
      ...newSpecialHour,
      id: `sh-${Date.now()}`
    };
    mockSpecialHours.push(specialHour);
    return HttpResponse.json(specialHour, { status: 201 });
  }),

  http.put('/api/special-hours/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<SpecialHour>;
    const index = mockSpecialHours.findIndex(sh => sh.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Special hour not found' }, { status: 404 });
    }
    
    mockSpecialHours[index] = {
      ...mockSpecialHours[index],
      ...updateData
    };
    
    return HttpResponse.json(mockSpecialHours[index]);
  }),

  http.delete('/api/special-hours/:id', ({ params }) => {
    const { id } = params;
    const index = mockSpecialHours.findIndex(sh => sh.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Special hour not found' }, { status: 404 });
    }
    mockSpecialHours.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Holidays API
  http.get('/api/holidays', () => {
    return HttpResponse.json(mockHolidays);
  }),

  http.post('/api/holidays', async ({ request }) => {
    const newHoliday = await request.json() as Omit<BusinessHoliday, 'id'>;
    const holiday: BusinessHoliday = {
      ...newHoliday,
      id: `h-${Date.now()}`
    };
    mockHolidays.push(holiday);
    return HttpResponse.json(holiday, { status: 201 });
  }),

  http.put('/api/holidays/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = await request.json() as Partial<BusinessHoliday>;
    const index = mockHolidays.findIndex(h => h.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }
    
    mockHolidays[index] = {
      ...mockHolidays[index],
      ...updateData
    };
    
    return HttpResponse.json(mockHolidays[index]);
  }),

  http.delete('/api/holidays/:id', ({ params }) => {
    const { id } = params;
    const index = mockHolidays.findIndex(h => h.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Holiday not found' }, { status: 404 });
    }
    mockHolidays.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // Extended Holiday API for Calendar
  http.get('/api/holidays/:year', ({ params }) => {
    const { year } = params;
    const yearStr = year as string;
    const yearHolidays = mockHolidays.filter(h => h.date.startsWith(yearStr));
    
    return HttpResponse.json({
      success: true,
      count: yearHolidays.length,
      holidays: yearHolidays.map(h => ({
        id: parseInt(h.id.split('-')[1]) || 0,
        date: h.date,
        name: h.name,
        type: h.type,
        is_recurring: h.isRecurring || false,
        is_closed: h.isClosed,
        is_substitute: h.isSubstitute,
        description: h.notes
      })),
      year: parseInt(yearStr)
    });
  }),

  http.get('/api/holidays/date/:date', ({ params }) => {
    const { date } = params;
    const holiday = mockHolidays.find(h => h.date === date);
    
    if (holiday) {
      return HttpResponse.json({
        success: true,
        isHoliday: true,
        holiday: {
          id: parseInt(holiday.id.split('-')[1]) || 0,
          date: holiday.date,
          name: holiday.name,
          type: holiday.type,
          is_recurring: holiday.isRecurring || false,
          is_closed: holiday.isClosed,
          is_substitute: holiday.isSubstitute,
          description: holiday.notes
        }
      });
    } else {
      return HttpResponse.json({
        success: true,
        isHoliday: false,
        holiday: null
      });
    }
  }),

  http.get('/api/holidays/today', () => {
    const today = new Date().toISOString().split('T')[0];
    const holiday = mockHolidays.find(h => h.date === today);
    
    return HttpResponse.json({
      success: true,
      isHoliday: !!holiday,
      today,
      holiday: holiday ? {
        id: parseInt(holiday.id.split('-')[1]) || 0,
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        is_recurring: holiday.isRecurring || false,
        is_closed: holiday.isClosed,
        is_substitute: holiday.isSubstitute,
        description: holiday.notes
      } : null
    });
  }),

  // Conflicts API
  http.get('/api/reservations/conflicts', () => {
    return HttpResponse.json(mockConflicts);
  }),

  http.get('/api/reservations/conflicts/:date', ({ params }) => {
    const { date } = params;
    const conflict = mockConflicts.find(c => c.date === date);
    return HttpResponse.json(conflict || null);
  }),

  http.post('/api/reservations/check-detailed-conflicts', async ({ request }) => {
    const data = await request.json() as any;
    
    // 간단한 충돌 체크 로직
    const hasConflict = mockConflicts.some(c => 
      c.date === data.date && 
      c.conflicts.some(conflict => 
        conflict.reservations.some(resId => resId !== data.excludeReservationId)
      )
    );

    if (hasConflict) {
      const conflict = mockConflicts.find(c => c.date === data.date);
      return HttpResponse.json({
        hasConflict: true,
        conflicts: conflict?.conflicts || [],
        success: true
      });
    } else {
      return HttpResponse.json({
        hasConflict: false,
        conflicts: [],
        success: true
      });
    }
  })
];