import React, { useState, useEffect } from 'react';
import type { Designer, DesignerFormData, WorkSchedule, DaySchedule } from '~/entities/designer';

interface DesignerFormProps {
  onSubmit: (formData: DesignerFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<Designer>;
  availableServices: string[];
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: '월요일' },
  { key: 'tuesday', label: '화요일' },
  { key: 'wednesday', label: '수요일' },
  { key: 'thursday', label: '목요일' },
  { key: 'friday', label: '금요일' },
  { key: 'saturday', label: '토요일' },
  { key: 'sunday', label: '일요일' }
] as const;

export const DesignerForm: React.FC<DesignerFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  availableServices,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<DesignerFormData>({
    name: '',
    phone: '',
    email: '',
    specialties: [],
    workSchedule: {}
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        specialties: initialData.specialties || [],
        workSchedule: initialData.workSchedule || {}
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleScheduleChange = (day: keyof WorkSchedule, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [day]: {
          ...prev.workSchedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleDayToggle = (day: keyof WorkSchedule) => {
    setFormData(prev => {
      const newSchedule = { ...prev.workSchedule };
      if (newSchedule[day]) {
        delete newSchedule[day];
      } else {
        newSchedule[day] = { start: '09:00', end: '18:00' };
      }
      return { ...prev, workSchedule: newSchedule };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '디자이너명은 필수입니다.';
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

    if (formData.specialties.length === 0) {
      newErrors.specialties = '최소 1개 이상의 전문 분야를 선택해주세요.';
    }

    // 근무 스케줄 검증
    const workingDays = Object.keys(formData.workSchedule);
    if (workingDays.length === 0) {
      newErrors.workSchedule = '최소 1일 이상의 근무일을 설정해주세요.';
    }

    // 각 근무일의 시간 검증
    for (const day of workingDays) {
      const schedule = formData.workSchedule[day as keyof WorkSchedule];
      if (schedule && schedule.start && schedule.end) {
        if (schedule.start >= schedule.end) {
          newErrors[`schedule_${day}`] = '종료 시간은 시작 시간보다 늦어야 합니다.';
        }
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
      {/* 기본 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">기본 정보</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              디자이너명 *
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

          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="designer@salon.com"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                errors.email ? 'border-red-300' : ''
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* 전문 분야 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">전문 분야 *</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableServices.map(service => (
            <label key={service} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.specialties.includes(service)}
                onChange={() => handleSpecialtyToggle(service)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">{service}</span>
            </label>
          ))}
        </div>
        {errors.specialties && (
          <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>
        )}
      </div>

      {/* 근무 스케줄 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">근무 스케줄 *</h3>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const daySchedule = formData.workSchedule[key as keyof WorkSchedule];
            const isWorking = !!daySchedule;
            
            return (
              <div key={key} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                <label className="flex items-center min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isWorking}
                    onChange={() => handleDayToggle(key as keyof WorkSchedule)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 w-16">
                    {label}
                  </span>
                </label>

                {isWorking && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={daySchedule?.start || '09:00'}
                      onChange={(e) => handleScheduleChange(key as keyof WorkSchedule, 'start', e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-500">~</span>
                    <input
                      type="time"
                      value={daySchedule?.end || '18:00'}
                      onChange={(e) => handleScheduleChange(key as keyof WorkSchedule, 'end', e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {errors[`schedule_${key}`] && (
                  <p className="text-sm text-red-600">{errors[`schedule_${key}`]}</p>
                )}
              </div>
            );
          })}
        </div>
        {errors.workSchedule && (
          <p className="mt-1 text-sm text-red-600">{errors.workSchedule}</p>
        )}
      </div>

      {/* 버튼들 */}
      <div className="flex justify-end space-x-3 pt-4">
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