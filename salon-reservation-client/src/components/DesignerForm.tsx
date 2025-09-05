import React, { useState, useEffect } from 'react';

export interface DesignerData {
  _id?: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
  experience_years?: number;
  profile_image?: string;
  bio?: string;
  is_active?: boolean;
}

interface DesignerFormProps {
  onSubmit: (formData: DesignerData) => void;
  initialData?: DesignerData;
  onCancel?: () => void;
  isEditing?: boolean;
}

const DesignerForm: React.FC<DesignerFormProps> = ({ 
  onSubmit, 
  initialData, 
  onCancel, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<DesignerData>({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experience_years: 0,
    profile_image: '',
    bio: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<DesignerData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        specialization: initialData.specialization || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        experience_years: initialData.experience_years || 0,
        profile_image: initialData.profile_image || '',
        bio: initialData.bio || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<DesignerData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '디자이너 이름은 필수입니다';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '디자이너 이름은 2글자 이상이어야 합니다';
    } else if (formData.name.trim().length > 30) {
      newErrors.name = '디자이너 이름은 30글자 이하여야 합니다';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)';
      }
    }

    // Email validation (optional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = '올바른 이메일 형식이 아닙니다';
      }
    }

    // Experience years validation
    if (formData.experience_years !== undefined && 
        (formData.experience_years < 0 || formData.experience_years > 50)) {
      newErrors.experience_years = '경력은 0-50년 사이여야 합니다';
    }

    // Bio validation (optional)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '소개는 500글자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'number') {
      processedValue = parseInt(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof DesignerData]) {
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
      // Clean up form data - remove empty strings
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        specialization: formData.specialization?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        profile_image: formData.profile_image?.trim() || null,
        bio: formData.bio?.trim() || null,
      };
      
      await onSubmit(cleanedData);
      
      if (!isEditing) {
        // Reset form after successful submission (for new designer)
        setFormData({
          name: '',
          specialization: '',
          phone: '',
          email: '',
          experience_years: 0,
          profile_image: '',
          bio: '',
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    
    if (!isEditing) {
      // Reset form for new designer
      setFormData({
        name: '',
        specialization: '',
        phone: '',
        email: '',
        experience_years: 0,
        profile_image: '',
        bio: '',
        is_active: true,
      });
    }
    setErrors({});
  };

  return (
    <div className="glass-card p-8 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {isEditing ? '✏️ 디자이너 수정' : '👨‍🎨 새 디자이너 등록'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-gray-800 text-sm font-semibold mb-2">
            👤 디자이너 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.name 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            placeholder="예: 김민수"
            required
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.name}</p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <label htmlFor="specialization" className="block text-gray-800 text-sm font-semibold mb-2">
            ⭐ 전문분야
          </label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent hover:bg-white/15 transition-all duration-300"
            placeholder="예: 헤어컷, 염색, 펌 전문"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-gray-800 text-sm font-semibold mb-2">
              📞 전화번호
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.phone 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
              }`}
              placeholder="010-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.phone}</p>
            )}
          </div>

          {/* Experience Years */}
          <div>
            <label htmlFor="experience_years" className="block text-gray-800 text-sm font-semibold mb-2">
              🏆 경력 (년)
            </label>
            <input
              type="number"
              id="experience_years"
              name="experience_years"
              value={formData.experience_years || 0}
              onChange={handleChange}
              min="0"
              max="50"
              className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
                errors.experience_years 
                  ? 'border-red-400 focus:ring-red-400' 
                  : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
              }`}
              placeholder="5"
            />
            {errors.experience_years && (
              <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.experience_years}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-800 text-sm font-semibold mb-2">
            📧 이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 ${
              errors.email 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            placeholder="designer@salon.com"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.email}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-gray-800 text-sm font-semibold mb-2">
            📝 소개
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-3 glass-input focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
              errors.bio 
                ? 'border-red-400 focus:ring-red-400' 
                : 'focus:ring-purple-400 focus:border-transparent hover:bg-white/15'
            }`}
            placeholder="디자이너에 대한 간단한 소개를 작성해주세요..."
          />
          {errors.bio && (
            <p className="text-red-600 text-sm mt-1 font-medium">⚠️ {errors.bio}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active || false}
            onChange={handleChange}
            className="w-5 h-5 text-purple-600 bg-white/20 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="is_active" className="text-gray-800 text-sm font-semibold">
            ✅ 활성화 상태 (고객이 선택할 수 있는 디자이너)
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </span>
            ) : (
              <>
                {isEditing ? '💾 수정하기' : '✨ 등록하기'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-white/20 text-gray-700 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default DesignerForm;