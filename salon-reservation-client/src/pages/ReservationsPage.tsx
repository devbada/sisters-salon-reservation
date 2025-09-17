import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import AppointmentForm from '../components/AppointmentForm';
import ReservationTable from '../components/ReservationTable';
import CalendarComponent from '../components/Calendar';
import SearchFilter from '../components/SearchFilter';
import { AppointmentData } from '../components/AppointmentForm';
import { ReservationStatus } from '../components/ReservationStatusBadge';
import '../styles/Calendar.css';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<AppointmentData[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<AppointmentData[]>([]);
  const [allReservations, setAllReservations] = useState<AppointmentData[]>([]);
  const [activeDesigners, setActiveDesigners] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<AppointmentData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdateLoading, setIsStatusUpdateLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const addToastRef = useRef<(message: string, type?: ToastMessage['type']) => void>(() => {});

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  addToastRef.current = addToast;

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleFilteredResults = useCallback((filteredData: AppointmentData[]) => {
    setFilteredReservations(filteredData);
  }, []);

  const memoizedActiveDesigners = useMemo(() => activeDesigners, [activeDesigners]);
  const memoizedReservations = useMemo(() => reservations, [reservations]);

  const fetchAllReservations = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reservations');
      setAllReservations(response.data);
    } catch (error: any) {
      console.error('Error fetching all reservations:', error);
    }
  }, []);

  const fetchActiveDesigners = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/designers');
      const activeDesignerNames = response.data
        .filter((designer: any) => designer.is_active)
        .map((designer: any) => designer.name);
      setActiveDesigners(activeDesignerNames);
    } catch (error: any) {
      console.error('Error fetching designers:', error);
      setActiveDesigners(['John', 'Sarah', 'Michael', 'Emma']);
    }
  }, []);

  const fetchReservations = useCallback(async (date?: string, shouldSetLoading = false) => {
    if (shouldSetLoading) {
      setIsLoading(true);
    }

    try {
      const url = date
        ? `http://localhost:4000/api/reservations?date=${date}`
        : 'http://localhost:4000/api/reservations';

      const response = await axios.get(url);

      setReservations(response.data);
      setFilteredReservations(response.data);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      if (error.response?.status === 401) {
        addToastRef.current?.('로그인이 필요합니다.', 'error');
      } else if (error.response?.status === 403) {
        addToastRef.current?.('접근 권한이 없습니다.', 'error');
      } else {
        addToastRef.current?.('서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
    } finally {
      if (shouldSetLoading) {
        setIsLoading(false);
      }
    }
  }, [addToastRef]);

  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      try {
        await fetchAllReservations();
        await fetchActiveDesigners();
        await fetchReservations(selectedDate);
      } finally {
        setIsLoading(false);
      }
    };
    initialLoad();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReservations(selectedDate);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedDate]);

  const handleAppointmentSubmit = useCallback(async (formData: AppointmentData) => {
    try {
      if (editingIndex !== null && editingData) {
        await axios.put(`http://localhost:4000/api/reservations/${editingData._id}`, formData);
        setEditingIndex(null);
        setEditingData(null);
        addToast('예약이 성공적으로 수정되었습니다!', 'success');
        await fetchReservations(selectedDate);
        await fetchAllReservations();
      } else {
        await axios.post('http://localhost:4000/api/reservations', formData);
        addToast('예약이 성공적으로 완료되었습니다!', 'success');
        await fetchReservations(selectedDate);
        await fetchAllReservations();
      }
    } catch (error: any) {
      console.error('Error with reservation:', error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.error || error.response.data?.message;

        if (statusCode === 400) {
          addToast(`입력 오류: ${errorMessage}`, 'error');
        } else if (statusCode === 401) {
          addToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (statusCode === 403) {
          addToast('접근 권한이 없습니다.', 'error');
        } else if (statusCode === 404) {
          addToast('예약을 찾을 수 없습니다.', 'error');
        } else if (statusCode === 409) {
          addToast(`충돌 오류: ${errorMessage}`, 'warning');
        } else if (statusCode >= 500) {
          addToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } else {
          addToast(`오류가 발생했습니다: ${errorMessage}`, 'error');
        }
      } else if (error.request) {
        addToast('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', 'error');
      } else {
        addToast('예약 처리 중 오류가 발생했습니다.', 'error');
      }
    }
  }, [editingIndex, editingData, selectedDate, addToast, fetchAllReservations]);

  const handleEdit = useCallback((reservation: AppointmentData, index: number) => {
    setEditingIndex(index);
    setEditingData(reservation);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingData(null);
  }, []);

  const handleDelete = useCallback(async (index: number) => {
    const reservation = reservations[index];
    if (window.confirm(`${reservation.customerName}님의 예약을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:4000/api/reservations/${reservation._id}`);
        addToast('예약이 성공적으로 삭제되었습니다.', 'success');
        await fetchReservations(selectedDate);
        await fetchAllReservations();
      } catch (error: any) {
        console.error('Error deleting reservation:', error);
        if (error.response?.status === 401) {
          addToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (error.response?.status === 403) {
          addToast('접근 권한이 없습니다.', 'error');
        } else if (error.response?.status === 404) {
          addToast('이미 삭제된 예약입니다.', 'warning');
          await fetchReservations(selectedDate);
          await fetchAllReservations();
        } else {
          addToast('예약 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        }
      }
    }
  }, [reservations, addToast, fetchAllReservations, selectedDate]);

  const handleStatusChange = useCallback(async (reservationId: string, newStatus: ReservationStatus, reason?: string, notes?: string) => {
    setIsStatusUpdateLoading(true);
    try {
      const requestData: any = { status: newStatus };
      if (reason) requestData.reason = reason;
      if (notes) requestData.notes = notes;

      const response = await axios.patch(`http://localhost:4000/api/reservations/${reservationId}/status`, requestData);

      addToast(response.data.message || '예약 상태가 성공적으로 변경되었습니다.', 'success');

      await fetchReservations(selectedDate);
      await fetchAllReservations();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.error || error.response.data?.message;

        if (statusCode === 400) {
          addToast(`상태 변경 오류: ${errorMessage}`, 'error');
        } else if (statusCode === 401) {
          addToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (statusCode === 403) {
          addToast('상태 변경 권한이 없습니다.', 'error');
        } else if (statusCode === 404) {
          addToast('예약을 찾을 수 없습니다.', 'error');
        } else {
          addToast(`서버 오류: ${errorMessage}`, 'error');
        }
      } else {
        addToast('상태 변경 중 오류가 발생했습니다. 네트워크를 확인해주세요.', 'error');
      }
    } finally {
      setIsStatusUpdateLoading(false);
    }
  }, [selectedDate, addToast, fetchAllReservations]);

  const handleEditReservation = useCallback((reservation: AppointmentData, index: number) => {
    const originalIndex = reservations.findIndex(r => r._id === reservation._id);
    handleEdit(reservation, originalIndex);
  }, [reservations, handleEdit]);

  const handleDeleteReservation = useCallback((index: number) => {
    const originalIndex = reservations.findIndex(r => r._id === filteredReservations[index]._id);
    handleDelete(originalIndex);
  }, [reservations, filteredReservations, handleDelete]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="glass-card p-8 max-w-sm mx-auto">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">🔄 예약 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: Calendar Selection | Customer Registration */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-[80vw] mx-auto">
        {/* Calendar Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            📅 캘린더 선택
          </h2>
          <CalendarComponent
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            reservations={allReservations}
            isLoading={isLoading}
          />
        </div>

        {/* Customer Registration */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            ✏️ 고객 등록
          </h2>
          <AppointmentForm
            onSubmit={handleAppointmentSubmit}
            initialData={editingData || undefined}
            onCancelEdit={handleCancelEdit}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="w-[80%] mx-auto">
        <SearchFilter
          reservations={memoizedReservations}
          onFilteredResults={handleFilteredResults}
          stylists={memoizedActiveDesigners}
        />
      </div>

      {/* Bottom Section: Reservation List */}
      <div className="w-[80%] mx-auto">
        <ReservationTable
          reservations={filteredReservations}
          onEdit={handleEditReservation}
          onDelete={handleDeleteReservation}
          onStatusChange={handleStatusChange}
          selectedDate={selectedDate}
          isStatusUpdateLoading={isStatusUpdateLoading}
        />
      </div>

      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full glass-card shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'border-l-4 border-green-500' :
              toast.type === 'error' ? 'border-l-4 border-red-500' :
              toast.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 text-lg ${
                  toast.type === 'success' ? 'text-green-500' :
                  toast.type === 'error' ? 'text-red-500' :
                  toast.type === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`}>
                  {toast.type === 'success' && '✓'}
                  {toast.type === 'error' && '✗'}
                  {toast.type === 'warning' && '⚠'}
                  {toast.type === 'info' && 'ℹ'}
                </div>
                <p className="ml-3 text-sm font-medium text-gray-800">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationsPage;