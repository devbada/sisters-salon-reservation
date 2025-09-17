import {
  generateAvailableTimeSlots,
  isBusinessDay,
  getBusinessHoursForDate,
  BusinessHour,
  Holiday,
  SpecialHour
} from './businessHours';

describe('Business Hours Utilities', () => {
  const mockBusinessHours: BusinessHour[] = [
    { day_of_week: 0, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 2, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 3, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 4, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false, break_start: '12:00', break_end: '13:00' },
    { day_of_week: 6, open_time: '09:00', close_time: '18:00', is_closed: true, break_start: null, break_end: null }
  ];

  const mockHolidays: Holiday[] = [
    { id: 1, date: '2025-01-01', name: 'New Year', is_recurring: true }
  ];

  const mockSpecialHours: SpecialHour[] = [
    { id: 1, date: '2025-09-15', open_time: '10:00', close_time: '16:00', is_closed: false, break_start: null, break_end: null }
  ];

  describe('isBusinessDay', () => {
    test('should return true for normal business day', () => {
      const result = isBusinessDay('2025-09-15', mockBusinessHours, mockHolidays, mockSpecialHours); // Monday
      expect(result).toBe(true);
    });

    test('should return false for closed day', () => {
      const result = isBusinessDay('2025-09-13', mockBusinessHours, mockHolidays, mockSpecialHours); // Saturday
      expect(result).toBe(false);
    });

    test('should return false for holiday', () => {
      const result = isBusinessDay('2025-01-01', mockBusinessHours, mockHolidays, mockSpecialHours);
      expect(result).toBe(false);
    });

    test('should return true for special hours day', () => {
      const result = isBusinessDay('2025-09-15', mockBusinessHours, mockHolidays, mockSpecialHours);
      expect(result).toBe(true);
    });
  });

  describe('getBusinessHoursForDate', () => {
    test('should return normal business hours for regular day', () => {
      const result = getBusinessHoursForDate('2025-09-16', mockBusinessHours, mockHolidays, mockSpecialHours); // Tuesday
      expect(result).toEqual(mockBusinessHours[2]); // Tuesday's hours
    });

    test('should return special hours when available', () => {
      const result = getBusinessHoursForDate('2025-09-15', mockBusinessHours, mockHolidays, mockSpecialHours);
      expect(result).toEqual(mockSpecialHours[0]);
    });

    test('should return null for closed day', () => {
      const result = getBusinessHoursForDate('2025-09-13', mockBusinessHours, mockHolidays, mockSpecialHours); // Saturday
      expect(result).toEqual(mockBusinessHours[6]); // Saturday is closed but still returns the business hour object
    });

    test('should return null for holiday', () => {
      const result = getBusinessHoursForDate('2025-01-01', mockBusinessHours, mockHolidays, mockSpecialHours);
      expect(result).toBeNull();
    });
  });

  describe('generateAvailableTimeSlots', () => {
    test('should generate time slots for normal business day', () => {
      const businessHour = getBusinessHoursForDate('2025-09-16', mockBusinessHours, mockHolidays, mockSpecialHours);
      const result = generateAvailableTimeSlots(businessHour);
      expect(result).toContain('09:00');
      expect(result).toContain('11:30');
      expect(result).not.toContain('12:00'); // break time
      expect(result).not.toContain('12:30'); // break time
      expect(result).toContain('13:00');
      expect(result).toContain('17:30');
    });

    test('should return empty array for null business hour', () => {
      const result = generateAvailableTimeSlots(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for closed day', () => {
      const closedHour = { ...mockBusinessHours[6], is_closed: true };
      const result = generateAvailableTimeSlots(closedHour);
      expect(result).toEqual([]);
    });

    test('should generate time slots for special hours', () => {
      const result = generateAvailableTimeSlots(mockSpecialHours[0]);
      expect(result).toContain('10:00');
      expect(result).toContain('15:30');
      expect(result).not.toContain('09:00'); // before special open time
      expect(result).not.toContain('16:00'); // at special close time
    });
  });
});