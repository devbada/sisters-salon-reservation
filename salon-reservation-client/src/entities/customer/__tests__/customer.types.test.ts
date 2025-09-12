import type { Customer } from '../types';

describe('Customer Entity Types', () => {
  describe('Customer 타입 검증', () => {
    it('올바른 Customer 객체를 생성할 수 있어야 한다', () => {
      const customer: Customer = {
        id: '1',
        name: '고객1',
        phone: '010-1234-5678',
        email: 'customer1@test.com',
        isVip: false,
        birthDate: '1990-01-01',
        preferences: {
          preferredDesigner: '김미용'
        },
        visitHistory: [],
        lastVisit: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(customer).toEqual({
        id: '1',
        name: '고객1', 
        phone: '010-1234-5678',
        email: 'customer1@test.com',
        isVip: false,
        birthDate: '1990-01-01',
        preferences: {
          preferredDesigner: '김미용'
        },
        visitHistory: [],
        lastVisit: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      });
    });

    it('필수 속성이 모두 포함되어야 한다', () => {
      const customer: Customer = {
        id: '2',
        name: '고객2',
        phone: '010-9876-5432',
        email: 'customer2@test.com',
        isVip: true,
        birthDate: '1985-05-15',
        preferences: {},
        visitHistory: [],
        lastVisit: '2024-01-15',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(customer.id).toBeDefined();
      expect(customer.name).toBeDefined();
      expect(customer.phone).toBeDefined();
      expect(customer.email).toBeDefined();
      expect(typeof customer.isVip).toBe('boolean');
      expect(customer.birthDate).toBeDefined();
      expect(customer.preferences).toBeDefined();
      expect(Array.isArray(customer.visitHistory)).toBe(true);
      expect(customer.createdAt).toBeDefined();
      expect(customer.updatedAt).toBeDefined();
    });

    it('VIP 상태를 올바르게 나타내야 한다', () => {
      const vipCustomer: Customer = {
        id: '3',
        name: 'VIP고객',
        phone: '010-1111-2222',
        email: 'vip@test.com',
        isVip: true,
        birthDate: '1980-01-01',
        preferences: {},
        visitHistory: [],
        lastVisit: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(vipCustomer.isVip).toBe(true);
    });

    it('preferences는 객체여야 한다', () => {
      const customer: Customer = {
        id: '4',
        name: '고객4',
        phone: '010-3333-4444',
        email: 'customer4@test.com',
        isVip: false,
        birthDate: '1995-12-31',
        preferences: {
          preferredDesigner: '박스타일',
          preferredTime: '오후'
        },
        visitHistory: [],
        lastVisit: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(typeof customer.preferences).toBe('object');
      expect(customer.preferences.preferredDesigner).toBe('박스타일');
    });
  });
});