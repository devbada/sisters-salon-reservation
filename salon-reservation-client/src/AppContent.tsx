import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentForm from './components/AppointmentForm';
import ReservationTable from './components/ReservationTable';
import { AppointmentData } from './components/AppointmentForm';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

function AppContent() {
  const [reservations, setReservations] = useState<AppointmentData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<AppointmentData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast message functions
  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    setIsLoading(true);
    axios.get('http://localhost:3000/api/reservations')
      .then(response => {
        setReservations(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching reservations:', error);
        if (error.response?.status === 401) {
          addToast('로그인이 필요합니다.', 'error');
        } else if (error.response?.status === 403) {
          addToast('접근 권한이 없습니다.', 'error');
        } else {
          addToast('서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
        setIsLoading(false);
      });
  }, []);

  const handleAppointmentSubmit = async (formData: AppointmentData) => {
    try {
      if (editingIndex !== null && editingData) {
        // Update existing reservation via API
        const response = await axios.put(`http://localhost:3000/api/reservations/${editingData._id}`, formData);
        const updatedReservations = [...reservations];
        updatedReservations[editingIndex] = response.data;
        setReservations(updatedReservations);
        setEditingIndex(null);
        setEditingData(null);
        addToast('예약이 성공적으로 수정되었습니다!', 'success');
      } else {
        // Add new reservation
        const response = await axios.post('http://localhost:3000/api/reservations', formData);
        setReservations([...reservations, response.data]);
        addToast('예약이 성공적으로 완료되었습니다!', 'success');
      }
    } catch (error: any) {
      console.error('Error with reservation:', error);
      
      if (error.response) {
        // Server responded with error status
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
        // Network error
        addToast('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', 'error');
      } else {
        // Other error
        addToast('예약 처리 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  const handleEdit = (reservation: AppointmentData, index: number) => {
    setEditingIndex(index);
    setEditingData(reservation);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleDelete = async (index: number) => {
    const reservation = reservations[index];
    if (window.confirm(`${reservation.customerName}님의 예약을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/reservations/${reservation._id}`);
        const updatedReservations = reservations.filter((_, i) => i !== index);
        setReservations(updatedReservations);
        addToast('예약이 성공적으로 삭제되었습니다.', 'success');
      } catch (error: any) {
        console.error('Error deleting reservation:', error);
        if (error.response?.status === 401) {
          addToast('로그인이 필요합니다. 다시 로그인해주세요.', 'error');
        } else if (error.response?.status === 403) {
          addToast('접근 권한이 없습니다.', 'error');
        } else if (error.response?.status === 404) {
          addToast('이미 삭제된 예약입니다.', 'warning');
          // Remove from local state as well
          const updatedReservations = reservations.filter((_, i) => i !== index);
          setReservations(updatedReservations);
        } else {
          addToast('예약 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">예약 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AppointmentForm
          onSubmit={handleAppointmentSubmit}
          initialData={editingData || undefined}
          onCancelEdit={handleCancelEdit}
        />
        <ReservationTable
          reservations={reservations}
          onEdit={(reservation, index) => handleEdit(reservation, index)}
          onDelete={handleDelete}
        />
      </div>

      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out ${
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
                <p className="ml-3 text-sm font-medium text-gray-900">{toast.message}</p>
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
}

export default AppContent;