import React, { useState } from 'react';
import type { ReservationStatus } from '~/entities/reservation';

export interface ReservationSearchFilters {
  customerName?: string;
  designerName?: string;
  status?: ReservationStatus | '';
  service?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ReservationSearchProps {
  onSearch: (filters: ReservationSearchFilters) => void;
  onReset: () => void;
  designers: string[];
  services: string[];
  isLoading?: boolean;
}

export const ReservationSearch: React.FC<ReservationSearchProps> = ({
  onSearch,
  onReset,
  designers,
  services,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<ReservationSearchFilters>({
    customerName: '',
    designerName: '',
    status: '',
    service: '',
    dateFrom: '',
    dateTo: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (key: keyof ReservationSearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key as keyof ReservationSearchFilters] = value;
      }
      return acc;
    }, {} as ReservationSearchFilters);
    
    onSearch(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      customerName: '',
      designerName: '',
      status: '',
      service: '',
      dateFrom: '',
      dateTo: ''
    });
    onReset();
  };

  const statusOptions = [
    { value: '', label: '전체 상태' },
    { value: 'confirmed', label: '예약 확정' },
    { value: 'pending', label: '예약 대기' },
    { value: 'cancelled', label: '예약 취소' },
    { value: 'completed', label: '서비스 완료' },
    { value: 'no_show', label: '노쇼' }
  ];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          🔍 예약 검색 및 필터
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          {isExpanded ? '접기 ▲' : '펼치기 ▼'}
        </button>
      </div>

      <form onSubmit={handleSearch}>
        {/* 기본 검색바 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="고객명 검색..."
              value={filters.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <select
              value={filters.designerName}
              onChange={(e) => handleInputChange('designerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">전체 디자이너</option>
              {designers.map(designer => (
                <option key={designer} value={designer}>{designer}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 상세 필터 (확장 시에만 표시) */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                서비스
              </label>
              <select
                value={filters.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">전체 서비스</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 날짜
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 날짜
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                검색 중...
              </>
            ) : (
              '검색'
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            초기화
          </button>

          {/* 현재 활성화된 필터 표시 */}
          <div className="flex-1 flex flex-wrap items-center gap-2 min-h-[2.5rem]">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === '') return null;
              
              const labels: Record<string, string> = {
                customerName: '고객명',
                designerName: '디자이너',
                status: '상태',
                service: '서비스',
                dateFrom: '시작일',
                dateTo: '종료일'
              };

              const displayValue = key === 'status' 
                ? statusOptions.find(opt => opt.value === value)?.label || value
                : value;

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
                >
                  {labels[key]}: {displayValue}
                  <button
                    type="button"
                    onClick={() => handleInputChange(key as keyof ReservationSearchFilters, '')}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};