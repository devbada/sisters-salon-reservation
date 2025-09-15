import { http, HttpResponse } from 'msw';

// Mock data
const mockBusinessHours = [
  { id: 1, day_of_week: 0, open_time: null, close_time: null, is_closed: true, break_start: null, break_end: null }, // Sunday
  { id: 2, day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Monday
  { id: 3, day_of_week: 2, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Tuesday
  { id: 4, day_of_week: 3, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Wednesday
  { id: 5, day_of_week: 4, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Thursday
  { id: 6, day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Friday
  { id: 7, day_of_week: 6, open_time: '09:00', close_time: '17:00', is_closed: false, break_start: '12:00', break_end: '13:00' }, // Saturday
];

const mockSpecialHours = [
  {
    id: 1,
    date: '2025-12-31',
    open_time: '09:00',
    close_time: '15:00',
    is_closed: false,
    break_start: null,
    break_end: null,
    reason: '연말 단축 근무'
  }
];

const mockDesigners = [
  { _id: '1', name: '김수정', specialization: '컷트, 펌', is_active: true },
  { _id: '2', name: '이영희', specialization: '컬러링, 트리트먼트', is_active: true },
  { _id: '3', name: '박민수', specialization: '컷트, 스타일링', is_active: true },
  { _id: '4', name: '최지현', specialization: '펌, 컬러링', is_active: false }
];

const mockCustomers = [
  { id: 1, name: '김민재', phone: '010-1234-5678', email: 'kim@example.com', total_visits: 5 },
  { id: 2, name: '이수진', phone: '010-9876-5432', email: 'lee@example.com', total_visits: 8 },
  { id: 3, name: '박지현', phone: '010-5555-1234', email: 'park@example.com', total_visits: 3 },
  { id: 4, name: '최서영', phone: '010-7777-8888', email: 'choi@example.com', total_visits: 12 }
];

const mockConflicts = [
  {
    date: '2025-09-15',
    time: '10:00',
    stylist: '김수정',
    conflictCount: 2,
    reservationIds: ['test-id-1', 'test-id-conflict'],
    customerNames: ['김민재', '이지은']
  }
];

const mockHolidays = {
  2024: [
    {
      id: 1,
      date: '2024-01-01',
      name: '신정',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '새해 첫날',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      date: '2024-02-09',
      name: '설날',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '음력 1월 1일',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      date: '2024-03-01',
      name: '삼일절',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '3·1 운동 기념일',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  2025: [
    {
      id: 4,
      date: '2025-01-01',
      name: '신정',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '새해 첫날',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      date: '2025-01-28',
      name: '설날',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '음력 1월 1일',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      date: '2025-03-01',
      name: '삼일절',
      type: 'public',
      is_substitute: false,
      is_closed: true,
      description: '3·1 운동 기념일',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

// State management for admin registration
let hasAdminRegistered = false;

export const handlers = [
  // Basic auth check
  http.get('/api/auth/check-admin', () => {
    return HttpResponse.json({ hasAdmin: hasAdminRegistered });
  }),

  // Admin registration
  http.post('/api/auth/register', async ({ request }) => {
    const data = await request.json() as any;
    hasAdminRegistered = true; // Set admin as registered
    return HttpResponse.json({
      user: {
        id: '1',
        username: data.username
      },
      token: 'mock-jwt-token'
    }, { status: 201 });
  }),

  // GET all reservations
  http.get('/api/reservations', () => {
    return HttpResponse.json([
      {
        _id: 'test-id-1',
        customerName: '김민재',
        customerPhone: '010-1234-5678',
        date: '2025-09-15',
        time: '10:00',
        stylist: 'John',
        serviceType: 'Haircut',
        createdAt: '2025-09-03T05:00:00.000Z'
      },
      {
        _id: 'test-id-2',
        customerName: '이수진',
        customerPhone: '010-9876-5432',
        date: '2025-09-16',
        time: '14:00',
        stylist: 'Sarah',
        serviceType: 'Coloring',
        createdAt: '2025-09-03T05:00:00.000Z'
      }
    ]);
  }),

  // POST new reservation
  http.post('/api/reservations', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      _id: 'new-test-id',
      ...data,
      createdAt: new Date().toISOString()
    }, { status: 201 });
  }),

  // PUT update reservation
  http.put('/api/reservations/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      _id: params.id,
      ...data,
      updatedAt: new Date().toISOString()
    });
  }),

  // DELETE reservation
  http.delete('/api/reservations/:id', ({ params }) => {
    return HttpResponse.json({
      _id: params.id,
      message: 'Reservation deleted successfully'
    });
  }),

  // GET reservation conflicts
  http.get('/api/reservations/conflicts', () => {
    return HttpResponse.json(mockConflicts);
  }),

  // Business Hours APIs
  http.get('/api/business-hours', () => {
    return HttpResponse.json(mockBusinessHours);
  }),

  http.get('/api/business-hours/special', () => {
    return HttpResponse.json(mockSpecialHours);
  }),

  // Designer APIs
  http.get('/api/designers', () => {
    const activeDesigners = mockDesigners.filter(d => d.is_active);
    return HttpResponse.json({ designers: activeDesigners });
  }),

  http.post('/api/designers', async ({ request }) => {
    const data = await request.json() as any;
    const newDesigner = {
      _id: `designer-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      specialization: data.specialties?.join(', ') || '',
      is_active: true,
      workDays: data.workDays || [],
      createdAt: new Date().toISOString()
    };

    mockDesigners.push(newDesigner);

    return HttpResponse.json({
      success: true,
      designer: newDesigner,
      message: '디자이너가 성공적으로 등록되었습니다.'
    }, { status: 201 });
  }),

  // Customer APIs
  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredCustomers = mockCustomers;
    if (search) {
      filteredCustomers = mockCustomers.filter(
        customer =>
          customer.name.toLowerCase().includes(search) ||
          customer.phone.includes(search)
      );
    }

    return HttpResponse.json({
      customers: filteredCustomers.slice(0, limit),
      total: filteredCustomers.length
    });
  }),

  // Holiday APIs
  http.get('/api/holidays', ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    const limit = url.searchParams.get('limit');

    let allHolidays: any[] = [];
    if (year) {
      const yearNum = parseInt(year);
      allHolidays = mockHolidays[yearNum as keyof typeof mockHolidays] || [];
    } else {
      allHolidays = [...mockHolidays[2024], ...mockHolidays[2025]];
    }

    if (limit) {
      allHolidays = allHolidays.slice(0, parseInt(limit));
    }

    return HttpResponse.json({
      success: true,
      count: allHolidays.length,
      holidays: allHolidays,
      year: year ? parseInt(year) : undefined
    });
  }),

  http.get('/api/holidays/:year', ({ params }) => {
    const year = parseInt(params.year as string);
    const holidays = mockHolidays[year as keyof typeof mockHolidays] || [];

    return HttpResponse.json({
      success: true,
      count: holidays.length,
      holidays,
      year
    });
  }),

  http.get('/api/holidays/date/:date', ({ params }) => {
    const date = params.date as string;
    const allHolidays = [...mockHolidays[2024], ...mockHolidays[2025]];
    const holiday = allHolidays.find(h => h.date === date);

    return HttpResponse.json({
      success: true,
      isHoliday: !!holiday,
      holiday: holiday || null
    });
  }),

  http.get('/api/holidays/today', () => {
    const today = new Date().toISOString().split('T')[0];
    const allHolidays = [...mockHolidays[2024], ...mockHolidays[2025]];
    const holiday = allHolidays.find(h => h.date === today);

    return HttpResponse.json({
      success: true,
      isHoliday: !!holiday,
      today,
      holiday: holiday || null
    });
  }),

  http.get('/api/holidays/upcoming', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    const today = new Date().toISOString().split('T')[0];

    const allHolidays = [...mockHolidays[2024], ...mockHolidays[2025]];
    const upcomingHolidays = allHolidays
      .filter(h => h.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);

    return HttpResponse.json({
      success: true,
      count: upcomingHolidays.length,
      holidays: upcomingHolidays
    });
  }),

  http.get('/api/holidays/calendar/:year/:month', ({ params }) => {
    const year = parseInt(params.year as string);
    const month = parseInt(params.month as string);

    const holidays = mockHolidays[year as keyof typeof mockHolidays] || [];
    const monthHolidays = holidays.filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate.getFullYear() === year && (holidayDate.getMonth() + 1) === month;
    });

    const holidaysByDay: { [day: number]: any } = {};
    monthHolidays.forEach(holiday => {
      const day = new Date(holiday.date).getDate();
      holidaysByDay[day] = {
        isHoliday: true,
        name: holiday.name,
        type: holiday.type,
        isClosed: holiday.is_closed
      };
    });

    return HttpResponse.json({
      success: true,
      year,
      month,
      holidays: holidaysByDay,
      count: monthHolidays.length
    });
  }),

  http.get('/api/holidays/sync/status', () => {
    return HttpResponse.json({
      success: true,
      sync: {
        database: {
          currentYear: {
            year: 2025,
            count: mockHolidays[2025].length,
            holidays: mockHolidays[2025]
          },
          nextYear: {
            year: 2026,
            count: 0,
            holidays: []
          },
          lastUpdate: new Date().toISOString()
        }
      },
      scheduler: {
        enabled: true,
        running: false,
        schedule: '0 2 * * *',
        timezone: 'Asia/Seoul',
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        lastSync: {
          status: 'success',
          timestamp: new Date().toISOString(),
          syncedCount: mockHolidays[2025].length
        },
        uptime: 86400
      }
    });
  }),

  http.post('/api/holidays/sync', async ({ request }) => {
    const data = await request.json() as any;
    const year = data?.year || new Date().getFullYear();

    return HttpResponse.json({
      success: true,
      message: `Successfully synced holidays for ${year}`,
      result: {
        year,
        syncedCount: mockHolidays[year as keyof typeof mockHolidays]?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
  }),

  // 누락된 핸들러들 추가
  http.get('/api/reservations/conflicts', () => {
    return HttpResponse.json(mockConflicts);
  }),

  http.get('/api/appointments', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    // 날짜별 예약 데이터 반환 (현재는 빈 배열)
    return HttpResponse.json([]);
  }),

  // Customer POST 핸들러 추가
  http.post('/api/customers', async ({ request }) => {
    const data = await request.json() as any;
    const newCustomer = {
      id: mockCustomers.length + 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      total_visits: 0
    };
    mockCustomers.push(newCustomer);
    return HttpResponse.json({
      success: true,
      customer: newCustomer
    }, { status: 201 });
  }),

  // 추가 누락된 핸들러들
  http.get('/api/designers/:id', ({ params }) => {
    const designer = mockDesigners.find(d => d._id === params.id);
    if (designer) {
      return HttpResponse.json({ designer });
    }
    return HttpResponse.json({ error: 'Designer not found' }, { status: 404 });
  }),

  http.put('/api/designers/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = mockDesigners.findIndex(d => d._id === params.id);
    if (index !== -1) {
      mockDesigners[index] = { ...mockDesigners[index], ...data };
      return HttpResponse.json({
        success: true,
        designer: mockDesigners[index],
        message: '디자이너 정보가 업데이트되었습니다.'
      });
    }
    return HttpResponse.json({ error: 'Designer not found' }, { status: 404 });
  }),

  http.delete('/api/designers/:id', ({ params }) => {
    const index = mockDesigners.findIndex(d => d._id === params.id);
    if (index !== -1) {
      mockDesigners[index].is_active = false;
      return HttpResponse.json({
        success: true,
        message: '디자이너가 비활성화되었습니다.'
      });
    }
    return HttpResponse.json({ error: 'Designer not found' }, { status: 404 });
  }),

  // Business Hours 업데이트 핸들러
  http.put('/api/business-hours/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = mockBusinessHours.findIndex(bh => bh.id === parseInt(params.id as string));
    if (index !== -1) {
      mockBusinessHours[index] = { ...mockBusinessHours[index], ...data };
      return HttpResponse.json(mockBusinessHours[index]);
    }
    return HttpResponse.json({ error: 'Business hour not found' }, { status: 404 });
  }),

  // Auth 관련 추가 핸들러
  http.post('/api/auth/login', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      user: {
        id: '1',
        username: data.username
      },
      token: 'mock-jwt-token'
    });
  }),

  http.post('/api/auth/logout', () => {
    hasAdminRegistered = false;
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Statistics/Dashboard 핸들러
  http.get('/api/statistics/dashboard', () => {
    return HttpResponse.json({
      totalReservations: 150,
      todayReservations: 8,
      totalCustomers: mockCustomers.length,
      activeDesigners: mockDesigners.filter(d => d.is_active).length,
      monthlyRevenue: 2500000,
      popularServices: [
        { name: 'Haircut', count: 45 },
        { name: 'Coloring', count: 32 },
        { name: 'Perm', count: 28 }
      ],
      weeklyBookings: [
        { day: 'Mon', bookings: 12 },
        { day: 'Tue', bookings: 15 },
        { day: 'Wed', bookings: 18 },
        { day: 'Thu', bookings: 14 },
        { day: 'Fri', bookings: 22 },
        { day: 'Sat', bookings: 25 },
        { day: 'Sun', bookings: 8 }
      ]
    });
  }),

  // 추가로 누락된 연도별 공휴일 핸들러들
  http.get('/api/holidays/2025', () => {
    return HttpResponse.json({
      success: true,
      count: mockHolidays[2025].length,
      holidays: mockHolidays[2025],
      year: 2025
    });
  }),

  http.get('/api/holidays/2026', () => {
    return HttpResponse.json({
      success: true,
      count: 0,
      holidays: [],
      year: 2026
    });
  }),

  // 예약 충돌 정보를 위한 추가 핸들러
  http.get('/api/reservation-conflicts', () => {
    return HttpResponse.json(mockConflicts);
  }),

  // Special hours 업데이트 핸들러
  http.post('/api/business-hours/special', async ({ request }) => {
    const data = await request.json() as any;
    const newSpecialHour = {
      id: mockSpecialHours.length + 1,
      ...data
    };
    mockSpecialHours.push(newSpecialHour);
    return HttpResponse.json(newSpecialHour, { status: 201 });
  }),

  http.put('/api/business-hours/special/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = mockSpecialHours.findIndex(sh => sh.id === parseInt(params.id as string));
    if (index !== -1) {
      mockSpecialHours[index] = { ...mockSpecialHours[index], ...data };
      return HttpResponse.json(mockSpecialHours[index]);
    }
    return HttpResponse.json({ error: 'Special hour not found' }, { status: 404 });
  }),

  http.delete('/api/business-hours/special/:id', ({ params }) => {
    const index = mockSpecialHours.findIndex(sh => sh.id === parseInt(params.id as string));
    if (index !== -1) {
      mockSpecialHours.splice(index, 1);
      return HttpResponse.json({ message: 'Special hour deleted successfully' });
    }
    return HttpResponse.json({ error: 'Special hour not found' }, { status: 404 });
  }),
];