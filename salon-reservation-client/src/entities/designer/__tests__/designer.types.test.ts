import type { Designer } from '../types';

describe('Designer Entity Types', () => {
  describe('Designer 타입 검증', () => {
    it('올바른 Designer 객체를 생성할 수 있어야 한다', () => {
      const designer: Designer = {
        id: '1',
        name: '김미용',
        specialties: ['헤어컷', '염색'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(designer).toEqual({
        id: '1',
        name: '김미용',
        specialties: ['헤어컷', '염색'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      });
    });

    it('필수 속성이 모두 포함되어야 한다', () => {
      const designer: Designer = {
        id: '2',
        name: '박스타일',
        specialties: ['펌'],
        isActive: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(designer.id).toBeDefined();
      expect(designer.name).toBeDefined();
      expect(designer.specialties).toBeDefined();
      expect(typeof designer.isActive).toBe('boolean');
      expect(designer.createdAt).toBeDefined();
      expect(designer.updatedAt).toBeDefined();
    });

    it('specialties는 문자열 배열이어야 한다', () => {
      const designer: Designer = {
        id: '3',
        name: '이컷팅',
        specialties: ['헤어컷', '스타일링', '트리트먼트'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      expect(Array.isArray(designer.specialties)).toBe(true);
      expect(designer.specialties.every(specialty => typeof specialty === 'string')).toBe(true);
    });
  });
});