import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppointmentData } from './AppointmentForm';

interface SearchFilterProps {
  reservations: AppointmentData[];
  onFilteredResults: (filtered: AppointmentData[]) => void;
  stylists?: string[];
  serviceTypes?: string[];
}

interface FilterState {
  searchTerm: string;
  selectedStylist: string;
  selectedService: string;
  startDate: string;
  endDate: string;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchFilter: React.FC<SearchFilterProps> = ({
  reservations,
  onFilteredResults,
  stylists = ['John', 'Sarah', 'Michael', 'Emma'],
  serviceTypes = ['Haircut', 'Coloring', 'Styling', 'Treatment']
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedStylist: '',
    selectedService: '',
    startDate: '',
    endDate: ''
  });

  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const filteredResults = useMemo(() => {
    let filtered = [...reservations];

    // 검색어 필터
    if (debouncedSearchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // 스타일리스트 필터
    if (filters.selectedStylist) {
      filtered = filtered.filter(reservation =>
        reservation.stylist === filters.selectedStylist
      );
    }

    // 서비스 종류 필터
    if (filters.selectedService) {
      filtered = filtered.filter(reservation =>
        reservation.serviceType === filters.selectedService
      );
    }

    // 날짜 범위 필터
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        return reservationDate >= start && reservationDate <= end;
      });
    }

    return filtered;
  }, [reservations, debouncedSearchTerm, filters.selectedStylist, filters.selectedService, filters.startDate, filters.endDate]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      onFilteredResults(filteredResults);
      setIsSearching(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredResults, onFilteredResults]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      searchTerm: '',
      selectedStylist: '',
      selectedService: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  const getServiceDisplayName = (service: string) => {
    const names = {
      'Haircut': '헤어컷',
      'Coloring': '염색',
      'Styling': '스타일링',
      'Treatment': '트리트먼트'
    };
    return names[service as keyof typeof names] || service;
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="max-w-5xl mx-auto glass-card p-6 mb-6 animate-fadeInUp">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🔍</span>
          예약 검색 및 필터
        </h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="glass-button px-4 py-2 text-gray-800 text-sm rounded-lg hover:scale-105 transition-all duration-200"
          >
            🔄 초기화
          </button>
        )}
      </div>

      {/* 검색 바 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">👤</span>
          </div>
          <input
            type="text"
            placeholder="고객 이름으로 검색..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-card border-none rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* 필터 옵션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 스타일리스트 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-1">✂️</span>
            담당 스타일리스트
          </label>
          <select
            value={filters.selectedStylist}
            onChange={(e) => handleFilterChange('selectedStylist', e.target.value)}
            className="w-full glass-card border-none rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          >
            <option value="">전체</option>
            {stylists.map(stylist => (
              <option key={stylist} value={stylist}>
                {stylist}
              </option>
            ))}
          </select>
        </div>

        {/* 서비스 종류 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-1">✨</span>
            서비스 종류
          </label>
          <select
            value={filters.selectedService}
            onChange={(e) => handleFilterChange('selectedService', e.target.value)}
            className="w-full glass-card border-none rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          >
            <option value="">전체</option>
            {serviceTypes.map(service => (
              <option key={service} value={service}>
                {getServiceDisplayName(service)}
              </option>
            ))}
          </select>
        </div>

        {/* 시작 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-1">📅</span>
            시작 날짜
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full glass-card border-none rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          />
        </div>

        {/* 종료 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-1">📅</span>
            종료 날짜
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full glass-card border-none rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* 검색 결과 정보 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-1">📊</span>
          검색 결과: <strong className="text-gray-800 ml-1">{filteredResults.length}건</strong>
          {reservations.length > 0 && (
            <span className="ml-1">
              (전체 {reservations.length}건 중)
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            {filters.searchTerm && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                검색: "{filters.searchTerm}"
              </span>
            )}
            {filters.selectedStylist && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                담당자: {filters.selectedStylist}
              </span>
            )}
            {filters.selectedService && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                서비스: {getServiceDisplayName(filters.selectedService)}
              </span>
            )}
            {filters.startDate && filters.endDate && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                기간: {filters.startDate} ~ {filters.endDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;