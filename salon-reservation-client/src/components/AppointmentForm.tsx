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
      setErrors({});
    }
  }, [initialData]);

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentData> = {};
    
    // Customer name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = '고객 이름을 입력해주세요.';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = '고객 이름은 2글자 이상이어야 합니다.';
    } else if (formData.customerName.trim().length > 50) {
      newErrors.customerName = '고객 이름은 50글자 이하여야 합니다.';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = '예약 날짜를 선택해주세요.';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = '과거 날짜는 선택할 수 없습니다.';
      }
      
      // 3개월 이후 예약 제한
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (selectedDate > maxDate) {
        newErrors.date = '3개월 이후 예약은 불가능합니다.';
      }
    }

    // Time validation
    if (!formData.time) {
      newErrors.time = '예약 시간을 선택해주세요.';
    } else {
      const [hours, minutes] = formData.time.split(':').map(Number);
      if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
        newErrors.time = '영업시간은 09:00-18:00입니다.';
      }
    }

    // Stylist validation
    if (!formData.stylist) {
      newErrors.stylist = '스타일리스트를 선택해주세요.';
    }

    // Service type validation
    if (!formData.serviceType) {
      newErrors.serviceType = '서비스 유형을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
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
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg reservation-form backdrop-blur-sm bg-opacity-95">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? '예약 수정' : '예약하기'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-gray-700 text-sm font-bold mb-2">
            고객 이름
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.customerName 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
            날짜
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.date 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="time" className="block text-gray-700 text-sm font-bold mb-2">
            시간
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.time 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            min="09:00"
            max="18:00"
            required
          />
          {errors.time && (
            <p className="text-red-500 text-sm mt-1">{errors.time}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="stylist" className="block text-gray-700 text-sm font-bold mb-2">
            스타일리스트
          </label>
          <select
            id="stylist"
            name="stylist"
            value={formData.stylist}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.stylist 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          >
            <option value="">스타일리스트 선택</option>
            <option value="John">John</option>
            <option value="Sarah">Sarah</option>
            <option value="Michael">Michael</option>
            <option value="Emma">Emma</option>
          </select>
          {errors.stylist && (
            <p className="text-red-500 text-sm mt-1">{errors.stylist}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="serviceType" className="block text-gray-700 text-sm font-bold mb-2">
            서비스 유형
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.serviceType 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          >
            <option value="">서비스 선택</option>
            <option value="Haircut">헤어컷</option>
            <option value="Coloring">염색</option>
            <option value="Styling">스타일링</option>
            <option value="Treatment">트리트먼트</option>
          </select>
          {errors.serviceType && (
            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
          )}
        </div>

        <div className={initialData ? "flex space-x-4" : ""}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${initialData ? 'flex-1' : 'w-full'} bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isSubmitting ? '처리 중...' : (initialData ? '예약 업데이트' : '예약하기')}
          </button>

          {initialData && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
