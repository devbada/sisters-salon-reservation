import React, { useState, useEffect } from 'react';

export interface AppointmentData {
  _id?: string;
  customerName: string;
  date: string;
  time: string;
  stylist: string;
  serviceType: string;
}

interface AppointmentFormProps {
  onSubmit: (formData: AppointmentData) => void;
  initialData?: AppointmentData;
  onCancelEdit?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, initialData, onCancelEdit }) => {
  const [formData, setFormData] = useState<AppointmentData>({
    customerName: '',
    date: '',
    time: '',
    stylist: '',
    serviceType: '',
  });

  const [errors, setErrors] = useState<Partial<AppointmentData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
      newErrors.stylist = '스타일리스트를 선택해주세요';
    }

    // Service type validation
    if (!formData.serviceType) {
      newErrors.serviceType = '서비스 종류를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          date: '',
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
        {/* Customer Name */}
        <div>
          <label htmlFor="customerName" className="block text-gray-800 text-sm font-semibold mb-2">
            👤 고객 이름
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.customerName 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            placeholder="고객님의 성함을 입력해주세요"
            required
          />
          {errors.customerName && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.customerName}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-gray-800 text-sm font-semibold mb-2">
            📅 날짜
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.date 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            required
          />
          {errors.date && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.date}</p>
          )}
        </div>

        {/* Time */}
        <div>
          <label htmlFor="time" className="block text-gray-800 text-sm font-semibold mb-2">
            ⏰ 시간
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            min="09:00"
            max="18:00"
            step="1800"
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.time 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            required
          />
          {errors.time && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.time}</p>
          )}
        </div>

        {/* Stylist */}
        <div>
          <label htmlFor="stylist" className="block text-gray-800 text-sm font-semibold mb-2">
            ✂️ 스타일리스트
          </label>
          <select
            id="stylist"
            name="stylist"
            value={formData.stylist}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.stylist 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            required
          >
            <option value="" className="bg-gray-800 text-white">스타일리스트 선택</option>
            <option value="John" className="bg-gray-800 text-white">John</option>
            <option value="Sarah" className="bg-gray-800 text-white">Sarah</option>
            <option value="Michael" className="bg-gray-800 text-white">Michael</option>
            <option value="Emma" className="bg-gray-800 text-white">Emma</option>
          </select>
          {errors.stylist && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.stylist}</p>
          )}
        </div>

        {/* Service Type */}
        <div>
          <label htmlFor="serviceType" className="block text-gray-800 text-sm font-semibold mb-2">
            ✨ 서비스 유형
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.serviceType 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
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
            type="submit"
            disabled={isSubmitting}
            className={`${initialData ? 'flex-1' : 'w-full'} bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300`}
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