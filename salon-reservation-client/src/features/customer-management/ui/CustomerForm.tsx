import React, { useState, useEffect } from 'react';
import type { Customer } from '~/entities/customer';

export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  isVip: boolean;
  preferences: {
    preferredDesigner?: string;
    preferredServices: string[];
  };
  notes?: string;
}

interface CustomerFormProps {
  onSubmit: (formData: CustomerFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<Customer>;
  designers: string[];
  services: string[];
  isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  designers,
  services,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    isVip: false,
    preferences: {
      preferredDesigner: '',
      preferredServices: []
    },
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        birthDate: initialData.birthDate || '',
        isVip: initialData.isVip || false,
        preferences: {
          preferredDesigner: initialData.preferences?.preferredDesigner || '',
          preferredServices: initialData.preferences?.preferredServices || []
        },
        notes: ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferenceChange = (key: keyof CustomerFormData['preferences'], value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredServices: prev.preferences.preferredServices.includes(service)
          ? prev.preferences.preferredServices.filter(s => s !== service)
          : [...prev.preferences.preferredServices, service]
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '고객명은 필수입니다.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처는 필수입니다.';
    } else {
      const phoneRegex = /^01[0-9]-?\d{4}-?\d{4}$/;
      if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
        newErrors.phone = '올바른 휴대폰 번호 형식이 아닙니다.';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = '올바른 이메일 형식이 아닙니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            고객명 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.name ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            연락처 *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="010-1234-5678"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.phone ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="customer@example.com"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.email ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            생년월일
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* VIP 상태 */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isVip"
          name="isVip"
          checked={formData.isVip}
          onChange={handleInputChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          disabled={isLoading}
        />
        <label htmlFor="isVip" className="ml-2 block text-sm text-gray-700">
          VIP 고객
        </label>
      </div>

      {/* 선호 사항 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">선호 사항</h3>
        
        <div>
          <label htmlFor="preferredDesigner" className="block text-sm font-medium text-gray-700">
            선호 디자이너
          </label>
          <select
            id="preferredDesigner"
            value={formData.preferences.preferredDesigner}
            onChange={(e) => handlePreferenceChange('preferredDesigner', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          >
            <option value="">선호 디자이너 없음</option>
            {designers.map(designer => (
              <option key={designer} value={designer}>{designer}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선호 서비스
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {services.map(service => (
              <label key={service} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.preferredServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          메모
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="특이사항, 알레르기 정보 등을 입력하세요"
          disabled={isLoading}
        />
      </div>

      {/* 버튼들 */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : (initialData?.id ? '수정하기' : '등록하기')}
        </button>
      </div>
    </form>
  );
};