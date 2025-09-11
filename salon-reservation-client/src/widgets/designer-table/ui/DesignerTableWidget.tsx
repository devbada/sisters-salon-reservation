import React, { useState, useEffect } from 'react';
import { useDesignerStore } from '~/features/designer-management';
import { useReservationStore } from '~/features/reservation-management';
import { DesignerTableRow } from './DesignerTableRow';
import { DesignerSchedulePreview } from './DesignerSchedulePreview';
import type { Designer } from '~/entities/designer';

interface DesignerTableWidgetProps {
  onEdit: (designer: Designer) => void;
  onDelete: (designer: Designer) => void;
  onAdd: () => void;
}

export const DesignerTableWidget: React.FC<DesignerTableWidgetProps> = ({
  onEdit,
  onDelete,
  onAdd,
}) => {
  const { designers, loading, fetchDesigners, deleteDesigner } = useDesignerStore();
  const { reservations, fetchTodayReservations } = useReservationStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetchDesigners();
    fetchTodayReservations();
  }, [fetchDesigners, fetchTodayReservations]);

  const filteredDesigners = designers.filter(designer => {
    const matchesSearch = designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (designer.specialization && designer.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && designer.isActive) ||
                         (filterActive === 'inactive' && !designer.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (designer: Designer) => {
    await deleteDesigner(designer.id);
    onDelete(designer);
  };

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">디자이너 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-3xl font-bold text-gray-800">
          👨‍🎨 헤어 디자이너 관리 ({designers.length}명)
        </h2>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
        >
          ➕ 새 디자이너 등록
        </button>
      </div>

      {/* Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="디자이너 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 glass-input focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent hover:bg-white/15 transition-all duration-300 w-full sm:w-64"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 glass-input focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent hover:bg-white/15 transition-all duration-300"
            >
              <option value="all">전체</option>
              <option value="active">활성화</option>
              <option value="inactive">비활성화</option>
            </select>
          </div>

          {/* Schedule Toggle */}
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSchedule 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/20 text-gray-700 hover:bg-white/30'
            }`}
          >
            📅 일정 미리보기
          </button>
        </div>
      </div>

      {/* Designer List */}
      <div className="glass-card p-8 rounded-2xl shadow-2xl">
        {filteredDesigners.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '등록된 디자이너가 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '다른 검색어를 시도해보세요' : '새로운 디자이너를 등록해보세요'}
            </p>
            {!searchTerm && (
              <button
                onClick={onAdd}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
              >
                ➕ 디자이너 등록하기
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">이름</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">전문분야</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">경력</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">연락처</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">상태</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigners.map((designer) => (
                    <React.Fragment key={designer.id}>
                      <DesignerTableRow
                        designer={designer}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                      />
                      {showSchedule && (
                        <tr>
                          <td colSpan={6} className="px-4 py-2">
                            <DesignerSchedulePreview
                              designer={designer}
                              todayReservations={reservations}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredDesigners.map((designer) => (
                <div key={designer.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {designer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{designer.name}</h3>
                        <p className="text-sm text-gray-600">{designer.specialization || '-'}</p>
                        {designer.experienceYears && (
                          <p className="text-xs text-gray-500">{designer.experienceYears}년 경력</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(designer)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(designer)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {showSchedule && (
                    <DesignerSchedulePreview
                      designer={designer}
                      todayReservations={reservations}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};