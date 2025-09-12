import type { Reservation, ReservationStatus } from '../types';

describe('Reservation Entity Types', () => {
  describe('Reservation 타입 검증', () => {
    it('올바른 Reservation 객체를 생성할 수 있어야 한다', () => {
      const reservation: Reservation = {
        id: '1',
        customerId: '1',
        customerName: '고객1',
        designerId: '1', 
        designerName: '김미용',
        date: '2024-01-15',
        time: '10:00',
        service: '헤어컷',
        status: 'confirmed',
        notes: '테스트 예약',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(reservation).toEqual({
        id: '1',
        customerId: '1',
        customerName: '고객1',
        designerId: '1',
        designerName: '김미용', 
        date: '2024-01-15',
        time: '10:00',
        service: '헤어컷',
        status: 'confirmed',
        notes: '테스트 예약',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      });
    });

    it('필수 속성이 모두 포함되어야 한다', () => {
      const reservation: Reservation = {
        id: '2',
        customerId: '2',
        customerName: '고객2',
        designerId: '2',
        designerName: '박스타일',
        date: '2024-01-20',
        time: '14:00',
        service: '펌',
        status: 'pending',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(reservation.id).toBeDefined();
      expect(reservation.customerId).toBeDefined();
      expect(reservation.customerName).toBeDefined();
      expect(reservation.designerId).toBeDefined();
      expect(reservation.designerName).toBeDefined();
      expect(reservation.date).toBeDefined();
      expect(reservation.time).toBeDefined();
      expect(reservation.service).toBeDefined();
      expect(reservation.status).toBeDefined();
      expect(reservation.createdAt).toBeDefined();
      expect(reservation.updatedAt).toBeDefined();
    });

    it('올바른 ReservationStatus 값을 가져야 한다', () => {
      const statuses: ReservationStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];
      
      statuses.forEach(status => {
        const reservation: Reservation = {
          id: `test-${status}`,
          customerId: '1',
          customerName: '테스트',
          designerId: '1',
          designerName: '테스트',
          date: '2024-01-01',
          time: '10:00',
          service: '테스트',
          status,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        };

        expect(['pending', 'confirmed', 'cancelled', 'completed']).toContain(reservation.status);
      });
    });

    it('notes는 선택적 속성이어야 한다', () => {
      const reservationWithNotes: Reservation = {
        id: '3',
        customerId: '1',
        customerName: '고객1',
        designerId: '1',
        designerName: '김미용',
        date: '2024-01-15',
        time: '10:00',
        service: '헤어컷',
        status: 'confirmed',
        notes: '특별한 요청사항',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      const reservationWithoutNotes: Reservation = {
        id: '4',
        customerId: '1', 
        customerName: '고객1',
        designerId: '1',
        designerName: '김미용',
        date: '2024-01-15',
        time: '10:00',
        service: '헤어컷',
        status: 'confirmed',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(reservationWithNotes.notes).toBe('특별한 요청사항');
      expect(reservationWithoutNotes.notes).toBeUndefined();
    });
  });
});