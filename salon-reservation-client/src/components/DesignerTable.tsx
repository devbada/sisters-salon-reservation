import React, { useState } from 'react';
import { DesignerData } from './DesignerForm';

interface DesignerTableProps {
  designers: DesignerData[];
  onEdit: (designer: DesignerData) => void;
  onDelete: (designer: DesignerData) => void;
  isLoading?: boolean;
}

const DesignerTable: React.FC<DesignerTableProps> = ({ 
  designers, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter designers based on search term and active status
  const filteredDesigners = designers.filter(designer => {
    const matchesSearch = designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (designer.specialization && designer.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && designer.is_active) ||
                         (filterActive === 'inactive' && !designer.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (designer: DesignerData) => {
    if (window.confirm(`정말로 "${designer.name}" 디자이너를 삭제하시겠습니까?`)) {
      onDelete(designer);
    }
  };

  if (isLoading) {
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
    <div className="glass-card p-8 rounded-2xl shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">
          👨‍🎨 헤어 디자이너 관리 ({designers.length}명)
        </h2>
        
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
            <option value="all" className="bg-gray-800 text-white">전체</option>
            <option value="active" className="bg-gray-800 text-white">활성화</option>
            <option value="inactive" className="bg-gray-800 text-white">비활성화</option>
          </select>
        </div>
      </div>

      {filteredDesigners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 디자이너가 없습니다'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? '다른 검색어를 시도해보세요' : '새로운 디자이너를 등록해보세요'}
          </p>
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
                  <tr 
                    key={designer._id} 
                    className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {designer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{designer.name}</div>
                          {designer.email && (
                            <div className="text-sm text-gray-600">{designer.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {designer.specialization || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {designer.experience_years ? `${designer.experience_years}년` : '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {designer.phone || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        designer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {designer.is_active ? '✅ 활성화' : '❌ 비활성화'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onEdit(designer)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                        >
                          ✏️ 수정
                        </button>
                        <button
                          onClick={() => handleDelete(designer)}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredDesigners.map((designer) => (
              <div 
                key={designer._id}
                className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {designer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{designer.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        designer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {designer.is_active ? '✅ 활성화' : '❌ 비활성화'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {designer.specialization && (
                    <div>⭐ <span className="font-medium">전문분야:</span> {designer.specialization}</div>
                  )}
                  {designer.experience_years !== undefined && designer.experience_years > 0 && (
                    <div>🏆 <span className="font-medium">경력:</span> {designer.experience_years}년</div>
                  )}
                  {designer.phone && (
                    <div>📞 <span className="font-medium">전화:</span> {designer.phone}</div>
                  )}
                  {designer.email && (
                    <div>📧 <span className="font-medium">이메일:</span> {designer.email}</div>
                  )}
                  {designer.bio && (
                    <div className="mt-2">
                      <span className="font-medium">📝 소개:</span>
                      <p className="mt-1 text-gray-700">{designer.bio}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(designer)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => handleDelete(designer)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DesignerTable;