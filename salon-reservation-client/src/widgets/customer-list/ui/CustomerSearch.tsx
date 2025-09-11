import React from 'react';

interface CustomerSearchProps {
  searchTerm: string;
  vipFilter: string;
  onSearchChange: (term: string) => void;
  onVipFilterChange: (filter: string) => void;
  onSearch: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchTerm,
  vipFilter,
  onSearchChange,
  onVipFilterChange,
  onSearch,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 고객 검색</h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            이름 또는 전화번호로 검색
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="고객 이름 또는 전화번호를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        
        <div className="md:w-48">
          <label htmlFor="vip-filter" className="block text-sm font-medium text-gray-700 mb-2">
            VIP 필터
          </label>
          <select
            id="vip-filter"
            value={vipFilter}
            onChange={(e) => onVipFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">전체</option>
            <option value="true">VIP만</option>
            <option value="false">일반 고객만</option>
          </select>
        </div>
        
        <div className="md:w-24 flex items-end">
          <button
            onClick={onSearch}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
};