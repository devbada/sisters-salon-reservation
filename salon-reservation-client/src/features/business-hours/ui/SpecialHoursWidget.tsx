import React, { useState } from 'react';
import type { SpecialHour } from '~/shared/lib/types';

interface SpecialHoursWidgetProps {
  specialHours: SpecialHour[];
  onAdd: (specialHour: Omit<SpecialHour, 'id'>) => void;
  onUpdate: (id: string, specialHour: Partial<SpecialHour>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const SpecialHoursWidget: React.FC<SpecialHoursWidgetProps> = ({
  specialHours,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
    type: 'modified' as 'closed' | 'modified',
    openTime: '09:00',
    closeTime: '18:00',
    breakStart: '',
    breakEnd: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      date: '',
      reason: '',
      type: 'modified',
      openTime: '09:00',
      closeTime: '18:00',
      breakStart: '',
      breakEnd: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const specialHourData = {
        date: formData.date,
        reason: formData.reason,
        type: formData.type,
        openTime: formData.type === 'closed' ? undefined : formData.openTime,
        closeTime: formData.type === 'closed' ? undefined : formData.closeTime,
        breakStart: formData.breakStart || undefined,
        breakEnd: formData.breakEnd || undefined,
        notes: formData.notes || undefined,
        isActive: true
      };

      if (editingId) {
        await onUpdate(editingId, specialHourData);
      } else {
        await onAdd(specialHourData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save special hours:', error);
    }
  };

  const handleEdit = (specialHour: SpecialHour) => {
    setFormData({
      date: specialHour.date,
      reason: specialHour.reason,
      type: specialHour.type,
      openTime: specialHour.openTime || '09:00',
      closeTime: specialHour.closeTime || '18:00',
      breakStart: specialHour.breakStart || '',
      breakEnd: specialHour.breakEnd || '',
      notes: specialHour.notes || ''
    });
    setEditingId(specialHour.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('이 특별 영업시간을 삭제하시겠습니까?')) {
      await onDelete(id);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'closed': return '휴무';
      case 'modified': return '시간 변경';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'closed': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort special hours by date
  const sortedSpecialHours = [...specialHours].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = new Date().toISOString().split('T')[0];
  const upcomingHours = sortedSpecialHours.filter(h => h.date >= today);
  const pastHours = sortedSpecialHours.filter(h => h.date < today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">특별 영업시간</h3>
          <p className="text-sm text-gray-600">특정 날짜의 영업시간 변경이나 휴무를 설정하세요</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
          disabled={isLoading}
        >
          + 특별 영업시간 추가
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? '특별 영업시간 수정' : '특별 영업시간 추가'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사유 *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="예: 공휴일, 직원 교육, 특별 이벤트"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유형 *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'closed' | 'modified' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="modified">영업시간 변경</option>
                  <option value="closed">휴무</option>
                </select>
              </div>

              {/* Operating Hours (only if not closed) */}
              {formData.type === 'modified' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      영업시간
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={formData.openTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <input
                        type="time"
                        value={formData.closeTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Break Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      휴게시간 (선택사항)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={formData.breakStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, breakStart: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <input
                        type="time"
                        value={formData.breakEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, breakEnd: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모 (선택사항)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="추가 설명이나 참고사항을 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? '처리 중...' : (editingId ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Special Hours */}
      {upcomingHours.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900">예정된 특별 영업시간</h4>
          {upcomingHours.map(hour => (
            <div key={hour.id} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {new Date(hour.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hour.type)}`}>
                      {getTypeLabel(hour.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{hour.reason}</p>
                  {hour.type === 'modified' && hour.openTime && hour.closeTime && (
                    <p className="text-sm text-gray-500">
                      {hour.openTime} ~ {hour.closeTime}
                      {hour.breakStart && hour.breakEnd && (
                        <span className="ml-2">(휴게: {hour.breakStart}~{hour.breakEnd})</span>
                      )}
                    </p>
                  )}
                  {hour.notes && (
                    <p className="text-sm text-gray-500 italic mt-1">{hour.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(hour)}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    disabled={isLoading}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(hour.id)}
                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    disabled={isLoading}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Special Hours */}
      {pastHours.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-500">지난 특별 영업시간</h4>
          {pastHours.slice(-5).map(hour => (
            <div key={hour.id} className="glass-card p-3 opacity-75">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-600">
                      {new Date(hour.date).toLocaleDateString('ko-KR')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(hour.type)}`}>
                      {getTypeLabel(hour.type)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{hour.reason}</p>
                </div>
                <button
                  onClick={() => handleDelete(hour.id)}
                  className="px-2 py-1 text-xs text-red-400 hover:bg-red-50 rounded"
                  disabled={isLoading}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {pastHours.length > 5 && (
            <p className="text-xs text-gray-500 text-center">
              {pastHours.length - 5}개 더 있음
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {specialHours.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">특별 영업시간이 없습니다</h3>
          <p className="text-gray-600 mb-4">공휴일이나 특별한 날의 영업시간을 설정해보세요</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
            disabled={isLoading}
          >
            첫 번째 특별 영업시간 추가하기
          </button>
        </div>
      )}
    </div>
  );
};