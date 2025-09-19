import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '~/shared/api/base';
import { useDebounce } from '~/shared/lib/useDebounce';
import type { Customer, CustomerListResponse } from '../../../types/customer';

interface CustomerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onCustomerSelect: (customer: Customer | null) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  error?: string;
}

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  value,
  onChange,
  onCustomerSelect,
  onKeyDown,
  placeholder = "고객명을 입력하세요",
  className = "",
  disabled = false,
  autoFocus = false,
  tabIndex,
  error
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 디바운싱된 검색어
  const debouncedSearchTerm = useDebounce(value.trim(), 300);

  // API를 통한 고객 검색
  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setCustomers([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.get<CustomerListResponse>('/customers', {
        params: {
          search: searchTerm,
          limit: 10 // 최대 10개까지만 표시
        }
      });

      setCustomers(response.data.customers || []);
      setHasSearched(true);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('고객 검색 중 오류 발생:', error);
      setCustomers([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운싱된 검색어가 변경될 때 검색 실행
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchCustomers(debouncedSearchTerm);
    } else {
      setCustomers([]);
      setShowDropdown(false);
      setHasSearched(false);
      setSelectedIndex(-1);
    }
  }, [debouncedSearchTerm, searchCustomers]);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 고객 선택 처리
  const handleCustomerSelect = (customer: Customer) => {
    onChange(customer.name);
    onCustomerSelect(customer);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // 키보드 네비게이션 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || customers.length === 0) {
      onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < customers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < customers.length) {
          handleCustomerSelect(customers[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        onKeyDown?.(e);
        break;
    }
  };

  // 입력 값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // 검색어를 지우면 고객 선택도 초기화
    if (newValue === '') {
      onCustomerSelect(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (customers.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
        />

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* 검색 결과 드롭다운 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-center text-gray-500">
              검색 중...
            </div>
          ) : customers.length > 0 ? (
            customers.map((customer, index) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleCustomerSelect(customer)}
                className={`
                  w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                  ${index === selectedIndex ? 'bg-blue-100' : ''}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {customer.total_visits}회 방문
                  </div>
                </div>
              </button>
            ))
          ) : hasSearched && debouncedSearchTerm.length >= 2 ? (
            <div className="px-4 py-2 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};