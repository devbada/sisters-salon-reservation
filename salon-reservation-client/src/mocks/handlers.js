import { rest } from 'msw';

export const handlers = [
  // GET all reservations
  rest.get('/api/reservations', (req, res, ctx) => {
    return res(ctx.json([
      {
        _id: 'test-id-1',
        customerName: '김민재',
        date: '2025-09-15',
        time: '10:00',
        stylist: 'John',
        serviceType: 'Haircut',
        createdAt: '2025-09-03T05:00:00.000Z'
      },
      {
        _id: 'test-id-2',
        customerName: '이수진',
        date: '2025-09-16',
        time: '14:00',
        stylist: 'Sarah',
        serviceType: 'Coloring',
        createdAt: '2025-09-03T05:00:00.000Z'
      }
    ]));
  }),

  // POST new reservation
  rest.post('/api/reservations', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({
      _id: 'new-test-id',
      ...req.body,
      createdAt: new Date().toISOString()
    }));
  }),

  // PUT update reservation
  rest.put('/api/reservations/:id', (req, res, ctx) => {
    return res(ctx.json({
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    }));
  }),

  // DELETE reservation
  rest.delete('/api/reservations/:id', (req, res, ctx) => {
    return res(ctx.json({
      _id: req.params.id,
      message: 'Reservation deleted successfully'
    }));
  }),

  // Error scenarios
  rest.post('/api/reservations/error', (req, res, ctx) => {
    return res(ctx.status(409), ctx.json({
      error: 'Emma는 2025-09-15 10:00에 이미 예약이 있습니다.'
    }));
  })
];