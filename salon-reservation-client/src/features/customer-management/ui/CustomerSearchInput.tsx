import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '~/entities/customer';
import { useCustomers } from '../model/useCustomers';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { customers, searchQuery, setSearchQuery, isLoading } = useCustomers();

  useEffect(() => {
    setSearchQuery(value);
  }, [value, setSearchQuery]);

  useEffect(() => {
    if (customers.length > 0) {
      setShowDropdown(true);
      setHasSearched(true);
    } else if (hasSearched && !isLoading) {
      setShowDropdown(false);
    }
  }, [customers, hasSearched, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
    setHasSearched(false);
  };

  const handleCustomerSelect = (customer: Customer) => {
    onChange(customer.name);
    onCustomerSelect(customer);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }

    if (!showDropdown) return;

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
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (customers.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // 드롭다운 항목 클릭을 위해 약간의 지연
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-red-300' : ''}`}
        disabled={disabled}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {showDropdown && customers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className={`px-4 py-2 cursor-pointer ${
                index === selectedIndex 
                  ? 'bg-indigo-100 text-indigo-900' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleCustomerSelect(customer)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </div>
                <div className="text-xs text-gray-400">
                  방문 {customer.totalVisits}회
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSearched && customers.length === 0 && !isLoading && searchQuery.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            검색 결과가 없습니다
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};