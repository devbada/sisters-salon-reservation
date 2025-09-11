import { Customer } from '../model/types';

export const customerUtils = {
  formatPhone(phone: string): string {
    // 010-1234-5678 형식으로 변환
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phone;
  },

  getAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  getCustomerGrade(customer: Customer): 'bronze' | 'silver' | 'gold' | 'vip' {
    if (customer.isVip) return 'vip';
    if (customer.totalVisits >= 20) return 'gold';
    if (customer.totalVisits >= 10) return 'silver';
    return 'bronze';
  },

  validatePhone(phone: string): boolean {
    const phoneRegex = /^01[0-9]-?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};