import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Customer, CustomerNote, CustomerHistoryResponse } from '../types/customer';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomerProfileProps {
  customer: Customer;
  onBack: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  onUpdate: (customer: Customer) => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  onBack,
  onEdit,
  onDelete,
  onUpdate
}) => {
  const [visitHistory, setVisitHistory] = useState<CustomerHistoryResponse | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>(customer.notes || []);
  const [newNote, setNewNote] = useState('');
  const [newNoteImportant, setNewNoteImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 방문 이력 조회
  const fetchVisitHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get<CustomerHistoryResponse>(
        `/api/customers/${customer.id}/history?limit=10`
      );
      setVisitHistory(response.data);
    } catch (error) {
      console.error('방문 이력 조회 오류:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 메모 추가
  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/customers/${customer.id}/notes`,
        {
          note: newNote.trim(),
          isImportant: newNoteImportant
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(prev => [response.data.note, ...prev]);
      setNewNote('');
      setNewNoteImportant(false);
    } catch (error: any) {
      console.error('메모 추가 오류:', error);
      alert(error.response?.data?.error || '메모 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 메모 삭제
  const deleteNote = async (noteId: number) => {
    if (!window.confirm('이 메모를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/customers/${customer.id}/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error: any) {
      console.error('메모 삭제 오류:', error);
      alert(error.response?.data?.error || '메모 삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchVisitHistory();
  }, [customer.id]);

  // Escape 키로 뒤로가기
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  // 생일 체크
  const isBirthdayToday = (birthdate?: string) => {
    if (!birthdate) return false;
    const birth = new Date(birthdate);
    const today = new Date();
    return birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate();
  };

  const isBirthdayThisMonth = (birthdate?: string) => {
    if (!birthdate) return false;
    const birth = new Date(birthdate);
    const today = new Date();
    return birth.getMonth() === today.getMonth();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>←</span>
          고객 목록으로 돌아가기
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(customer)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✏️ 정보 수정
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🗑️ 고객 삭제
          </button>
        </div>
      </div>

      {/* 고객 정보 카드 */}
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
        customer.vip_status ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : ''
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {customer.name}
              </h1>
              
              {isBirthdayToday(customer.birthdate) && (
                <span className="text-2xl animate-bounce" title="오늘 생일입니다!">🎉</span>
              )}
              
              {!isBirthdayToday(customer.birthdate) && isBirthdayThisMonth(customer.birthdate) && (
                <span className="text-xl" title="이번 달 생일">🎂</span>
              )}
              
              {customer.vip_status && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                  customer.vip_level === 0 ? 'bg-gray-500' :
                  customer.vip_level === 1 ? 'bg-yellow-500' :
                  customer.vip_level === 2 ? 'bg-yellow-600' :
                  'bg-yellow-700'
                }`}>
                  👑 VIP {customer.vip_level > 0 ? customer.vip_level : ''}
                </span>
              )}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300">
              {format(new Date(customer.created_at), 'yyyy년 MM월 dd일', { locale: ko })} 등록
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {customer.total_visits}회
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">총 방문</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 연락처 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">연락처 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">📞</span>
                <span className="text-gray-900 dark:text-white">{customer.phone}</span>
              </div>
              
              {customer.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">✉️</span>
                  <span className="text-gray-900 dark:text-white">{customer.email}</span>
                </div>
              )}
              
              {customer.birthdate && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">🎂</span>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(customer.birthdate), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
              )}
              
              {customer.gender && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {customer.gender === 'male' ? '👨' : customer.gender === 'female' ? '👩' : '👤'}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {customer.gender === 'male' ? '남성' : customer.gender === 'female' ? '여성' : '기타'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 선호도 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">선호도</h3>
            <div className="space-y-2 text-sm">
              {customer.preferred_stylist && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">💇</span>
                  <span className="text-gray-900 dark:text-white">
                    선호 디자이너: {customer.preferred_stylist}
                  </span>
                </div>
              )}
              
              {customer.preferred_service && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">✂️</span>
                  <span className="text-gray-900 dark:text-white">
                    선호 서비스: {customer.preferred_service}
                  </span>
                </div>
              )}
              
              {customer.last_visit_date && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">📅</span>
                  <span className="text-gray-900 dark:text-white">
                    마지막 방문: {formatDistanceToNow(new Date(customer.last_visit_date), { 
                      addSuffix: true, 
                      locale: ko 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 알레르기 정보 */}
        {customer.allergies && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
              ⚠️ 알레르기 / 주의사항
            </h4>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {customer.allergies}
            </p>
          </div>
        )}
      </div>

      {/* 방문 이력 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📅 방문 이력 ({visitHistory?.pagination.total || 0}회)
        </h2>
        
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">방문 이력을 불러오는 중...</span>
          </div>
        ) : visitHistory && visitHistory.history.length > 0 ? (
          <div className="space-y-3">
            {visitHistory.history.map((visit, index) => (
              <div
                key={visit._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      #{visitHistory.pagination.total - index}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {format(new Date(visit.date), 'yyyy.MM.dd', { locale: ko })}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {visit.time}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {visit.stylist}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {visit.serviceType}
                  </span>
                </div>
              </div>
            ))}
            
            {visitHistory.pagination.hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={fetchVisitHistory}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  더 보기...
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            아직 방문 기록이 없습니다.
          </div>
        )}
      </div>

      {/* 메모 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📝 메모 ({notes.length}개)
        </h2>
        
        {/* 새 메모 추가 */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="새 메모를 작성하세요..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white mb-3"
            rows={3}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important"
                checked={newNoteImportant}
                onChange={(e) => setNewNoteImportant(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="important" className="ml-2 text-sm text-gray-900 dark:text-white">
                중요 메모
              </label>
            </div>
            
            <button
              onClick={addNote}
              disabled={loading || !newNote.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              메모 추가
            </button>
          </div>
        </div>

        {/* 메모 목록 */}
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg ${
                  note.is_important
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`${
                      note.is_important 
                        ? 'text-red-900 dark:text-red-100' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {note.is_important && (
                        <span className="inline-block mr-2 text-red-500">⚠️</span>
                      )}
                      {note.note}
                    </p>
                    
                    <div className={`text-xs mt-2 ${
                      note.is_important 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {note.created_by} • {formatDistanceToNow(new Date(note.created_at), { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                    title="메모 삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            아직 작성된 메모가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;