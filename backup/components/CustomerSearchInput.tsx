import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useDebounce } from '../hooks/useDebounce';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  total_visits: number;
}

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

const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
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
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/customers', {
        params: { 
          search: searchTerm,
          limit: 10 // 최대 10개까지만 표시
        },
        headers: { Authorization: `Bearer ${token}` }
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

  // 키보드 네비게이션 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || customers.length === 0) {
      if (onKeyDown) {
        onKeyDown(e);
      }
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
        } else if (onKeyDown) {
          onKeyDown(e);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      
      case 'Tab':
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onKeyDown) {
          onKeyDown(e);
        }
        break;
      
      default:
        if (onKeyDown) {
          onKeyDown(e);
        }
        break;
    }
  };

  // 고객 선택 처리
  const handleCustomerSelect = (customer: Customer) => {
    onChange(customer.name);
    onCustomerSelect(customer);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // 값이 변경되었을 때 고객 선택 해제
    if (newValue !== value) {
      onCustomerSelect(null);
    }
    
    // 빈 값이면 드롭다운 숨기기
    if (!newValue.trim()) {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // 입력 필드 포커스 시 드롭다운 표시
  const handleInputFocus = () => {
    if (customers.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
          error 
            ? 'border-red-400 focus:ring-red-400' 
            : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
        } ${className}`}
        disabled={disabled}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        autoComplete="off"
      />
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
        </div>
      )}

      {/* 드롭다운 */}
      {showDropdown && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto animate-fadeInUp"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-600 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
              검색 중...
            </div>
          ) : customers.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50/50 border-b border-gray-200/50">
                👥 등록된 고객 {customers.length}명
              </div>
              {customers.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-200 border-b border-gray-100/50 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-purple-100/70 text-purple-800'
                      : 'hover:bg-gray-100/50 text-gray-800'
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="font-medium">
                    {customer.name}
                    <span className="ml-2 text-sm text-gray-600">
                      ({customer.phone})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    방문 {customer.total_visits}회
                    {customer.email && ` • ${customer.email}`}
                  </div>
                </div>
              ))}
            </>
          ) : hasSearched && debouncedSearchTerm.length >= 2 ? (
            <div className="px-4 py-6 text-center">
              <div className="text-gray-400 text-4xl mb-2">👤</div>
              <div className="text-gray-600 text-sm font-medium mb-1">
                "{debouncedSearchTerm}" 검색 결과가 없습니다
              </div>
              <div className="text-gray-500 text-xs">
                💡 새 고객으로 예약이 진행됩니다
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {error}</p>
      )}

      {/* 도움말 텍스트 */}
      {!error && !showDropdown && value.trim().length > 0 && value.trim().length < 2 && (
        <p className="text-gray-500 text-xs mt-1">
          💡 2글자 이상 입력하면 고객을 검색할 수 있습니다
        </p>
      )}
    </div>
  );
};

export default CustomerSearchInput;