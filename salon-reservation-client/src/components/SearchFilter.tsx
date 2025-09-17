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


const SearchFilter: React.FC<SearchFilterProps> = ({
  reservations,
  onFilteredResults,
  stylists = ['John', 'Sarah', 'Michael', 'Emma'],
  serviceTypes = ['Haircut', 'Coloring', 'Styling', 'Treatment']
}) => {
  // 검색 폼 상태 (입력용)
  const [searchForm, setSearchForm] = useState<FilterState>({
    searchTerm: '',
    selectedStylist: '',
    selectedService: '',
    startDate: '',
    endDate: ''
  });

  // 현재 적용된 검색 조건
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    searchTerm: '',
    selectedStylist: '',
    selectedService: '',
    startDate: '',
    endDate: ''
  });

  // 검색 실행 함수
  const handleSearch = useCallback(() => {
    let filtered = [...reservations];

    // 검색어 필터
    if (searchForm.searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(searchForm.searchTerm.toLowerCase())
      );
    }

    // 스타일리스트 필터
    if (searchForm.selectedStylist) {
      filtered = filtered.filter(reservation =>
        reservation.stylist === searchForm.selectedStylist
      );
    }

    // 서비스 종류 필터
    if (searchForm.selectedService) {
      filtered = filtered.filter(reservation =>
        reservation.serviceType === searchForm.selectedService
      );
    }

    // 날짜 범위 필터
    if (searchForm.startDate && searchForm.endDate) {
      filtered = filtered.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        const start = new Date(searchForm.startDate);
        const end = new Date(searchForm.endDate);
        return reservationDate >= start && reservationDate <= end;
      });
    }

    // 적용된 필터 업데이트
    setAppliedFilters(searchForm);
    onFilteredResults(filtered);
  }, [searchForm, reservations, onFilteredResults]);

  // 폼 필드 변경 핸들러
  const handleFormChange = useCallback((key: keyof FilterState, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    const initialState = {
      searchTerm: '',
      selectedStylist: '',
      selectedService: '',
      startDate: '',
      endDate: ''
    };
    setSearchForm(initialState);
    setAppliedFilters(initialState);
    onFilteredResults(reservations); // 전체 데이터 표시
  }, [reservations, onFilteredResults]);

  // 엔터키 지원
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const getServiceDisplayName = (service: string) => {
    const names = {
      'Haircut': '헤어컷',
      'Coloring': '염색',
      'Styling': '스타일링',
      'Treatment': '트리트먼트'
    };
    return names[service as keyof typeof names] || service;
  };

  // 적용된 필터 여부 확인
  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== '');

  return (
    <div className="w-full mx-auto glass-card p-6 mb-6 animate-fadeInUp">
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

      {/* 검색 폼 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">👤</span>
          </div>
          <input
            type="text"
            placeholder="고객 이름으로 검색..."
            value={searchForm.searchTerm}
            onChange={(e) => handleFormChange('searchTerm', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-4 py-3 glass-card border-none rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          />
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
            value={searchForm.selectedStylist}
            onChange={(e) => handleFormChange('selectedStylist', e.target.value)}
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
            value={searchForm.selectedService}
            onChange={(e) => handleFormChange('selectedService', e.target.value)}
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
            value={searchForm.startDate}
            onChange={(e) => handleFormChange('startDate', e.target.value)}
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
            value={searchForm.endDate}
            onChange={(e) => handleFormChange('endDate', e.target.value)}
            className="w-full glass-card border-none rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* 검색 버튼 */}
      <div className="mt-6 mb-6 flex justify-end space-x-4">
        <button
          onClick={handleSearch}
          className="glass-button px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 font-semibold rounded-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <span>🔍</span>
          <span>검색</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="glass-button px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-700 font-semibold rounded-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>전체보기</span>
          </button>
        )}
      </div>

      {/* 검색 결과 정보 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-1">📊</span>
          {hasActiveFilters ? '검색 결과:' : '전체 예약:'} <strong className="text-gray-800 ml-1">{reservations.filter(r => {
            if (!hasActiveFilters) return true;
            let match = true;
            if (appliedFilters.searchTerm) {
              match = match && r.customerName.toLowerCase().includes(appliedFilters.searchTerm.toLowerCase());
            }
            if (appliedFilters.selectedStylist) {
              match = match && r.stylist === appliedFilters.selectedStylist;
            }
            if (appliedFilters.selectedService) {
              match = match && r.serviceType === appliedFilters.selectedService;
            }
            if (appliedFilters.startDate && appliedFilters.endDate) {
              const reservationDate = new Date(r.date);
              const start = new Date(appliedFilters.startDate);
              const end = new Date(appliedFilters.endDate);
              match = match && reservationDate >= start && reservationDate <= end;
            }
            return match;
          }).length}건</strong>
          {reservations.length > 0 && (
            <span className="ml-1">
              (전체 {reservations.length}건 중)
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            {appliedFilters.searchTerm && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                검색: "{appliedFilters.searchTerm}"
              </span>
            )}
            {appliedFilters.selectedStylist && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                담당자: {appliedFilters.selectedStylist}
              </span>
            )}
            {appliedFilters.selectedService && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                서비스: {getServiceDisplayName(appliedFilters.selectedService)}
              </span>
            )}
            {appliedFilters.startDate && appliedFilters.endDate && (
              <span className="glass-card px-2 py-1 rounded text-xs text-gray-800">
                기간: {appliedFilters.startDate} ~ {appliedFilters.endDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// SearchFilter의 불필요한 리렌더링을 방지하는 비교 함수
const arePropsEqual = (prevProps: SearchFilterProps, nextProps: SearchFilterProps) => {
  // reservations 배열 길이가 다르면 리렌더링
  if (prevProps.reservations.length !== nextProps.reservations.length) {
    return false;
  }

  // reservations 배열 내용이 다르면 리렌더링 (얕은 비교)
  for (let i = 0; i < prevProps.reservations.length; i++) {
    if (prevProps.reservations[i]._id !== nextProps.reservations[i]._id) {
      return false;
    }
    // 상태나 내용이 변경된 경우도 체크
    if (prevProps.reservations[i].status !== nextProps.reservations[i].status ||
        prevProps.reservations[i].customerName !== nextProps.reservations[i].customerName ||
        prevProps.reservations[i].date !== nextProps.reservations[i].date) {
      return false;
    }
  }

  // onFilteredResults 함수 참조가 다르면 리렌더링
  if (prevProps.onFilteredResults !== nextProps.onFilteredResults) {
    return false;
  }

  // stylists 배열 비교
  if (prevProps.stylists?.length !== nextProps.stylists?.length) {
    return false;
  }

  if (prevProps.stylists && nextProps.stylists) {
    for (let i = 0; i < prevProps.stylists.length; i++) {
      if (prevProps.stylists[i] !== nextProps.stylists[i]) {
        return false;
      }
    }
  }

  // serviceTypes 배열 비교 (기본값이므로 크게 중요하지 않음)
  if (prevProps.serviceTypes?.length !== nextProps.serviceTypes?.length) {
    return false;
  }

  return true; // 모든 조건이 같으면 리렌더링 방지
};

export default React.memo(SearchFilter, arePropsEqual);