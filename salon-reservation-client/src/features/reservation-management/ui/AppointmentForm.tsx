import React, { useState, useEffect } from 'react';
import { ReservationFormData } from '~/entities/reservation';
import { useReservations } from '../model/useReservations';

interface AppointmentFormProps {
  onSubmit: (formData: ReservationFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ReservationFormData>;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData 
}) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    designerName: '',
    service: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
    price: 0,
    ...initialData
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { isLoading } = useReservations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ReservationFormData) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: { [key: string]: string }) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = '고객명은 필수입니다.';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '연락처는 필수입니다.';
    } else {
      const phoneRegex = /^01[0-9]-?\d{4}-?\d{4}$/;
      if (!phoneRegex.test(formData.customerPhone.replace(/-/g, ''))) {
        newErrors.customerPhone = '올바른 휴대폰 번호 형식이 아닙니다.';
      }
    }

    if (!formData.designerName) {
      newErrors.designerName = '디자이너를 선택해주세요.';
    }

    if (!formData.service) {
      newErrors.service = '서비스를 선택해주세요.';
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    }

    if (!formData.time) {
      newErrors.time = '시간을 선택해주세요.';
    }

    if (formData.duration <= 0) {
      newErrors.duration = '소요시간을 입력해주세요.';
    }

    if (formData.price < 0) {
      newErrors.price = '가격은 0원 이상이어야 합니다.';
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
        {/* 고객 정보 */}
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
            고객명 *
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.customerName ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
            연락처 *
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="010-1234-5678"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.customerPhone ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        {/* 예약 정보 */}
        <div>
          <label htmlFor="designerName" className="block text-sm font-medium text-gray-700">
            디자이너 *
          </label>
          <select
            id="designerName"
            name="designerName"
            value={formData.designerName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.designerName ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          >
            <option value="">디자이너를 선택하세요</option>
            <option value="김수진">김수진</option>
            <option value="이민정">이민정</option>
            <option value="박서영">박서영</option>
          </select>
          {errors.designerName && (
            <p className="mt-1 text-sm text-red-600">{errors.designerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">
            서비스 *
          </label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.service ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          >
            <option value="">서비스를 선택하세요</option>
            <option value="컷">컷</option>
            <option value="컷+염색">컷+염색</option>
            <option value="펌">펌</option>
            <option value="트리트먼트">트리트먼트</option>
          </select>
          {errors.service && (
            <p className="mt-1 text-sm text-red-600">{errors.service}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            날짜 *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.date ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            시간 *
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.time ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            소요시간 (분) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="30"
            step="30"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.duration ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            가격 (원)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.price ? 'border-red-300' : ''
            }`}
            disabled={isLoading}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          메모
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="특별한 요청사항이나 메모를 입력하세요"
          disabled={isLoading}
        />
      </div>

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
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '예약하기'}
        </button>
      </div>
    </form>
  );
};