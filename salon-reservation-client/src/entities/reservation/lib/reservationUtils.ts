import { Reservation, ReservationStatus } from '../model/types';

export const reservationUtils = {
  isConflicting(reservation1: Reservation, reservation2: Reservation): boolean {
    if (reservation1.date !== reservation2.date) return false;
    if (reservation1.designerName !== reservation2.designerName) return false;
    
    const start1 = new Date(`${reservation1.date}T${reservation1.time}`);
    const end1 = new Date(start1.getTime() + reservation1.duration * 60000);
    
    const start2 = new Date(`${reservation2.date}T${reservation2.time}`);
    const end2 = new Date(start2.getTime() + reservation2.duration * 60000);
    
    return (start1 < end2) && (start2 < end1);
  },

  getStatusColor(status: ReservationStatus): string {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#10b981', 
      completed: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  },

  getStatusLabel(status: ReservationStatus): string {
    const labels = {
      pending: '대기중',
      confirmed: '확정',
      completed: '완료',
      cancelled: '취소'
    };
    return labels[status] || status;
  },

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  },

  calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
};