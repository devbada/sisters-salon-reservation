import React, { useState, useEffect } from 'react';
import type { BusinessHoliday } from '~/shared/lib/types';
import { ConfirmModal } from '~/shared/ui/ConfirmModal';

interface HolidaysWidgetProps {
  holidays: BusinessHoliday[];
  onAdd: (holiday: Omit<BusinessHoliday, 'id'>) => void;
  onUpdate: (id: string, holiday: Partial<BusinessHoliday>) => void;
  onDelete: (id: string) => void;
  onImportPublicHolidays?: (year: number) => Promise<BusinessHoliday[]>;
  isLoading?: boolean;
}

// 한국의 주요 공휴일 (매년 반복)
const KOREAN_PUBLIC_HOLIDAYS = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '성탄절' }
];

export const HolidaysWidget: React.FC<HolidaysWidgetProps> = ({
  holidays,
  onAdd,
  onUpdate,
  onDelete,
  onImportPublicHolidays,
  isLoading = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; holiday: BusinessHoliday | null }>({
    isOpen: false,
    holiday: null
  });
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    type: 'public' as 'public' | 'custom',
    isRecurring: false,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      type: 'public',
      isRecurring: false,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const holidayData = {
        date: formData.date,
        name: formData.name,
        type: formData.type,
        isRecurring: formData.isRecurring,
        isClosed: true,
        isSubstitute: false,
        notes: formData.notes || undefined
      };

      if (editingId) {
        await onUpdate(editingId, holidayData);
      } else {
        await onAdd(holidayData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save holiday:', error);
    }
  };

  const handleEdit = (holiday: BusinessHoliday) => {
    setFormData({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
      isRecurring: holiday.isRecurring || false,
      notes: holiday.notes || ''
    });
    setEditingId(holiday.id);
    setShowForm(true);
  };

  const handleDeleteClick = (holiday: BusinessHoliday) => {
    setDeleteConfirm({ isOpen: true, holiday });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.holiday) {
      try {
        await onDelete(deleteConfirm.holiday.id);
      } catch (error) {
        console.error('Failed to delete holiday:', error);
      } finally {
        setDeleteConfirm({ isOpen: false, holiday: null });
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, holiday: null });
  };

  const handleImportKoreanHolidays = async () => {
    if (window.confirm(`${selectedYear}년 한국 공휴일을 가져오시겠습니까?\n기존 공휴일과 중복될 수 있습니다.`)) {
      try {
        const koreanHolidays = KOREAN_PUBLIC_HOLIDAYS.map(holiday => ({
          date: `${selectedYear}-${holiday.month.toString().padStart(2, '0')}-${holiday.day.toString().padStart(2, '0')}`,
          name: holiday.name,
          type: 'public' as const,
          isRecurring: true,
          isClosed: true,
          isSubstitute: false
        }));

        for (const holiday of koreanHolidays) {
          // Check if holiday already exists
          const exists = holidays.some(h => h.date === holiday.date && h.name === holiday.name);
          if (!exists) {
            await onAdd(holiday);
          }
        }
      } catch (error) {
        console.error('Failed to import Korean holidays:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'public': return '국경일/공휴일';
      case 'custom': return '사용자 정의';
      default: return type;
    }
  };

  // Sort holidays by date
  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const today = new Date().toISOString().split('T')[0];
  const upcomingHolidays = sortedHolidays.filter(h => h.date >= today);
  const pastHolidays = sortedHolidays.filter(h => h.date < today);

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">공휴일 관리</h3>
          <p className="text-sm text-gray-600">공휴일과 사용자 정의 휴무일을 관리하세요</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <button
            onClick={handleImportKoreanHolidays}
            className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            한국 공휴일 가져오기
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
            disabled={isLoading}
          >
            + 공휴일 추가
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? '공휴일 수정' : '공휴일 추가'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  공휴일명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 추석, 설날, 직원 워크샵"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'public' | 'custom' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="public">국경일/공휴일</option>
                  <option value="custom">사용자 정의</option>
                </select>
              </div>

              {/* Recurring */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                  매년 반복
                </label>
              </div>

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

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{holidays.filter(h => h.type === 'public').length}</div>
          <div className="text-sm text-gray-600">국경일/공휴일</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{holidays.filter(h => h.type === 'custom').length}</div>
          <div className="text-sm text-gray-600">사용자 정의</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{upcomingHolidays.length}</div>
          <div className="text-sm text-gray-600">다가오는 공휴일</div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900">다가오는 공휴일</h4>
          {upcomingHolidays.map(holiday => (
            <div key={holiday.id} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {new Date(holiday.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(holiday.type)}`}>
                      {getTypeLabel(holiday.type)}
                    </span>
                    {holiday.isRecurring && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        매년 반복
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{holiday.name}</p>
                  {holiday.notes && (
                    <p className="text-sm text-gray-500 italic">{holiday.notes}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(holiday)}
                    className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    disabled={isLoading}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteClick(holiday)}
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

      {/* Past Holidays (collapsed view) */}
      {pastHolidays.length > 0 && (
        <details className="space-y-3">
          <summary className="cursor-pointer text-md font-medium text-gray-500 hover:text-gray-700">
            지난 공휴일 ({pastHolidays.length}개)
          </summary>
          {pastHolidays.slice(-10).map(holiday => (
            <div key={holiday.id} className="glass-card p-3 opacity-75">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('ko-KR')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(holiday.type)}`}>
                      {getTypeLabel(holiday.type)}
                    </span>
                    {holiday.isRecurring && (
                      <span className="px-1 py-0.5 rounded text-xs bg-yellow-100 text-yellow-600">반복</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{holiday.name}</p>
                </div>
                <button
                  onClick={() => handleDeleteClick(holiday)}
                  className="px-2 py-1 text-xs text-red-400 hover:bg-red-50 rounded"
                  disabled={isLoading}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </details>
      )}

      {/* Empty State */}
      {holidays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">공휴일이 설정되지 않았습니다</h3>
          <p className="text-gray-600 mb-4">국경일이나 사업장 휴무일을 설정해보세요</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleImportKoreanHolidays}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={isLoading}
            >
              한국 공휴일 가져오기
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
              disabled={isLoading}
            >
              직접 추가하기
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="공휴일 삭제"
        message={`"${deleteConfirm.holiday?.name}" 공휴일을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};