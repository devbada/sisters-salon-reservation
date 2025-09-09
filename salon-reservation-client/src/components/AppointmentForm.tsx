import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  fetchBusinessHoursData,
  generateAvailableTimeSlots,
  getBusinessHoursForDate,
  isBusinessDay,
  BusinessHour,
  Holiday,
  SpecialHour
} from '../utils/businessHours';
import CustomerSearchInput from './CustomerSearchInput';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export interface AppointmentData {
  _id?: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string; // 상태 변경 메모
  status_updated_at?: string; // 상태 변경 시간
  status_updated_by?: string; // 상태 변경자
}

interface Designer {
  _id: string;
  name: string;
  specialization?: string;
  is_active: boolean;
}

interface AppointmentFormProps {
  onSubmit: (formData: AppointmentData) => void;
  initialData?: AppointmentData;
  onCancelEdit?: () => void;
  selectedDate: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, initialData, onCancelEdit, selectedDate }) => {
  const [formData, setFormData] = useState<AppointmentData>({
    customerName: '',
    customerPhone: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '',
    stylist: '',
    serviceType: '',
  });

  const [errors, setErrors] = useState<Partial<AppointmentData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loadingDesigners, setLoadingDesigners] = useState(true);
  
  // 영업시간 관련 상태
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [businessHoursLoading, setBusinessHoursLoading] = useState(true);
  const [enableDirectDateInput, setEnableDirectDateInput] = useState(false);
  
  // Refs for keyboard navigation
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeSelectRef = useRef<HTMLSelectElement>(null);
  const stylistSelectRef = useRef<HTMLSelectElement>(null);
  const serviceSelectRef = useRef<HTMLSelectElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch designers on component mount
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/designers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDesigners(response.data.filter((designer: Designer) => designer.is_active));
      } catch (error) {
        console.error('Error fetching designers:', error);
      } finally {
        setLoadingDesigners(false);
      }
    };

    fetchDesigners();
  }, []);

  // Fetch business hours data on component mount
  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const { businessHours, holidays, specialHours } = await fetchBusinessHoursData();
        setBusinessHours(businessHours);
        setHolidays(holidays);
        setSpecialHours(specialHours);
      } catch (error) {
        console.error('Error fetching business hours:', error);
      } finally {
        setBusinessHoursLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  // Update available time slots when date or business hours change
  useEffect(() => {
    if (businessHoursLoading || !selectedDate) return;

    const businessHour = getBusinessHoursForDate(selectedDate, businessHours, holidays, specialHours);
    const slots = generateAvailableTimeSlots(businessHour);
    setAvailableTimeSlots(slots);
  }, [selectedDate, businessHours, holidays, specialHours, businessHoursLoading]);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Update date when selectedDate changes (from calendar)
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      date: selectedDate || new Date().toISOString().split('T')[0]
    }));
  }, [selectedDate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentData> = {};

    // Customer name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = '고객 이름은 필수입니다';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = '고객 이름은 2글자 이상이어야 합니다';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = '예약 날짜는 필수입니다';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = '과거 날짜는 선택할 수 없습니다';
      }
    }

    // Time validation
    if (!formData.time) {
      newErrors.time = '예약 시간은 필수입니다';
    }

    // Stylist validation
    if (!formData.stylist) {
      newErrors.stylist = '디자이너를 선택해주세요';
    } else if (!designers.find(designer => designer.name === formData.stylist)) {
      newErrors.stylist = '유효하지 않은 디자이너입니다';
    }

    // Service type validation
    if (!formData.serviceType) {
      newErrors.serviceType = '서비스 종류를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format date input as user types (YYYY-MM-DD)
  const formatDateInput = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as YYYY-MM-DD
    if (numbers.length >= 8) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
    } else if (numbers.length >= 6) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length >= 4) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    }
    return numbers;
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedDate = formatDateInput(value);
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
    }));
    
    // Clear error for date field
    if (errors.date) {
      setErrors(prevErrors => ({
        ...prevErrors,
        date: undefined,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof AppointmentData]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  // Keyboard navigation handlers
  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: any) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
    
    // Ctrl+S to submit form
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission (only for new appointments)
      if (!initialData) {
        setFormData({
          customerName: '',
          customerPhone: '',
          date: selectedDate || new Date().toISOString().split('T')[0],
          time: '',
          stylist: '',
          serviceType: '',
        });
        setErrors({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-8 reservation-form animate-fadeInUp">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {initialData ? '✏️ 예약 수정' : '✨ 예약하기'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-sm text-gray-600 mb-4 p-3 glass-card bg-blue-50/50 rounded-lg">
          💡 <strong>키보드 단축키:</strong><br/>
          • Tab: 다음 필드로 이동<br/>
          • Enter: 다음 필드로 이동 (입력 필드에서)<br/>
          • Ctrl+S: 폼 제출<br/>
          • 날짜는 숫자만 입력하면 자동으로 YYYY-MM-DD 형식으로 변환됩니다
        </div>
        {/* Customer Name */}
        <div>
          <label htmlFor="customerName" className="block text-gray-800 text-sm font-semibold mb-2">
            👤 고객 이름
          </label>
          <CustomerSearchInput
            value={formData.customerName}
            onChange={(value) => setFormData(prev => ({ ...prev, customerName: value }))}
            onCustomerSelect={(customer) => {
              if (customer) {
                setFormData(prev => ({ 
                  ...prev, 
                  customerName: customer.name,
                  customerPhone: customer.phone
                }));
              } else {
                setFormData(prev => ({ ...prev, customerPhone: '' }));
              }
              
              // Clear error for customerName field
              if (errors.customerName) {
                setErrors(prevErrors => ({
                  ...prevErrors,
                  customerName: undefined,
                }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                const nextRef = enableDirectDateInput ? dateInputRef : timeSelectRef;
                if (nextRef?.current) {
                  e.preventDefault();
                  nextRef.current.focus();
                }
              }
              // Ctrl+S to submit form
              if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="고객님의 성함을 입력해주세요"
            autoFocus
            tabIndex={1}
            error={errors.customerName}
          />
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-gray-800 text-sm font-semibold mb-2">
            📅 예약 날짜
          </label>
          <div className="space-y-2">
            {enableDirectDateInput ? (
              <input
                ref={dateInputRef}
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleDateInputChange}
                onKeyDown={(e) => handleKeyDown(e, timeSelectRef)}
                className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
                  errors.date 
                    ? 'border-red-400 focus:ring-red-400' 
                    : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
                }`}
                placeholder="YYYY-MM-DD (예: 20241225)"
                maxLength={10}
                tabIndex={2}
              />
            ) : (
              <div className="w-full px-4 py-3 glass-card bg-white/10 border border-white/20 rounded-lg cursor-pointer" 
                   onClick={() => setEnableDirectDateInput(true)}
                   tabIndex={2}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                       e.preventDefault();
                       setEnableDirectDateInput(true);
                       setTimeout(() => dateInputRef.current?.focus(), 100);
                     }
                   }}>
                <p className="text-gray-800 font-medium">
                  {formData.date ? 
                    new Date(formData.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    }) : '날짜를 선택하세요'
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  📝 직접 입력하려면 클릭하거나 Enter 키를 누르세요
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setEnableDirectDateInput(!enableDirectDateInput)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
              tabIndex={-1}
            >
              {enableDirectDateInput ? '📅 캘린더 모드로' : '⌨️ 키보드 입력 모드로'}
            </button>
          </div>
          {errors.date && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.date}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label htmlFor="time" className="block text-gray-800 text-sm font-semibold mb-2">
            ⏰ 예약 시간
          </label>
          {businessHoursLoading ? (
            <div className="w-full px-4 py-3 glass-input bg-gray-100 border border-gray-300 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
              <span className="text-gray-500">영업시간 로딩 중...</span>
            </div>
          ) : !isBusinessDay(selectedDate, businessHours, holidays, specialHours) ? (
            <div className="w-full px-4 py-3 glass-input bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">🚫 선택하신 날짜는 휴무일입니다.</p>
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="w-full px-4 py-3 glass-input bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-yellow-700 text-sm">⚠️ 선택하신 날짜에 예약 가능한 시간이 없습니다.</p>
            </div>
          ) : (
            <select
              ref={timeSelectRef}
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, stylistSelectRef)}
              className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.time 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
              }`}
              tabIndex={3}
              required
            >
              <option value="" className="bg-gray-800 text-white">시간을 선택하세요</option>
              {availableTimeSlots.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot} className="bg-gray-800 text-white">
                  {timeSlot}
                </option>
              ))}
            </select>
          )}
          {errors.time && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.time}</p>
          )}
        </div>

        {/* Designer */}
        <div>
          <label htmlFor="stylist" className="block text-gray-800 text-sm font-semibold mb-2">
            👨‍🎨 헤어 디자이너
          </label>
          <select
            ref={stylistSelectRef}
            id="stylist"
            name="stylist"
            value={formData.stylist}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, serviceSelectRef)}
            disabled={loadingDesigners}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.stylist 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            } ${loadingDesigners ? 'opacity-50 cursor-not-allowed' : ''}`}
            tabIndex={4}
            required
          >
            <option value="" className="bg-gray-800 text-white">
              {loadingDesigners ? '디자이너 목록 로딩 중...' : '디자이너 선택'}
            </option>
            {designers.map((designer) => (
              <option key={designer._id} value={designer.name} className="bg-gray-800 text-white">
                {designer.name}{designer.specialization ? ` (${designer.specialization})` : ''}
              </option>
            ))}
          </select>
          {errors.stylist && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.stylist}</p>
          )}
          {designers.length === 0 && !loadingDesigners && (
            <p className="text-yellow-600 text-sm mt-1 font-medium">⚠️ 활성화된 디자이너가 없습니다. 관리자에게 문의하세요.</p>
          )}
        </div>

        {/* Service Type */}
        <div>
          <label htmlFor="serviceType" className="block text-gray-800 text-sm font-semibold mb-2">
            ✨ 서비스 유형
          </label>
          <select
            ref={serviceSelectRef}
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, submitButtonRef)}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.serviceType 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            tabIndex={5}
            required
          >
            <option value="" className="bg-gray-800 text-white">서비스 선택</option>
            <option value="Haircut" className="bg-gray-800 text-white">💇‍♀️ 헤어컷</option>
            <option value="Coloring" className="bg-gray-800 text-white">🎨 염색</option>
            <option value="Styling" className="bg-gray-800 text-white">💫 스타일링</option>
            <option value="Treatment" className="bg-gray-800 text-white">🧴 트리트먼트</option>
          </select>
          {errors.serviceType && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.serviceType}</p>
          )}
        </div>

        {/* Buttons */}
        <div className={initialData ? "flex space-x-4" : ""}>
          <button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            className={`${initialData ? 'flex-1' : 'w-full'} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300`}
            tabIndex={6}
          >
            {isSubmitting ? '🔄 처리 중...' : (initialData ? '✏️ 예약 업데이트' : '✨ 예약하기')}
          </button>

          {initialData && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 glass-button text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              ❌ 취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;