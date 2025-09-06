import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Customer, CustomerFormData } from '../types/customer';

interface CustomerFormProps {
  customer?: Customer | null;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    birthdate: '',
    gender: undefined,
    preferredStylist: '',
    preferredService: '',
    allergies: '',
    vipStatus: false,
    vipLevel: 0,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [designers, setDesigners] = useState<string[]>([]);

  // 기존 고객 정보로 폼 초기화
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        birthdate: customer.birthdate || '',
        gender: customer.gender,
        preferredStylist: customer.preferred_stylist || '',
        preferredService: customer.preferred_service || '',
        allergies: customer.allergies || '',
        vipStatus: customer.vip_status,
        vipLevel: customer.vip_level,
        notes: ''
      });
    }
  }, [customer]);

  // 디자이너 목록 조회
  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await axios.get('/api/designers');
        const activeDesigners = response.data
          .filter((designer: any) => designer.isActive && !designer.deleted)
          .map((designer: any) => designer.name);
        setDesigners(activeDesigners);
      } catch (error) {
        console.error('디자이너 목록 조회 오류:', error);
      }
    };

    fetchDesigners();
  }, []);

  // 입력 값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number'
        ? parseInt(value) || 0
        : value
    }));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('전화번호를 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증
    const phoneRegex = /^[0-9-+\s()]{10,15}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError('올바른 이메일 형식을 입력해주세요.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const submitData = {
        ...formData,
        email: formData.email?.trim() || undefined,
        birthdate: formData.birthdate || undefined,
        preferredStylist: formData.preferredStylist || undefined,
        preferredService: formData.preferredService || undefined,
        allergies: formData.allergies?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      };

      let response;
      if (customer) {
        // 수정
        response = await axios.put(`/api/customers/${customer.id}`, submitData, { headers });
      } else {
        // 등록
        response = await axios.post('/api/customers', submitData, { headers });
      }

      onSave(response.data.customer);
    } catch (error: any) {
      console.error('고객 저장 오류:', error);
      setError(error.response?.data?.error || '고객 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Escape 키로 취소
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onCancel]);

  const serviceTypes = [
    '헤어컷', '염색', '펌', '스타일링', '트리트먼트', '클리닉', '업스타일', '기타'
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {customer ? '고객 정보 수정' : '새 고객 등록'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {customer ? '고객 정보를 수정하세요.' : '새로운 고객 정보를 입력하세요.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="고객 이름"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              전화번호 *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="010-0000-0000"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              성별
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">선택 안함</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              생년월일
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="preferredStylist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              선호 디자이너
            </label>
            <select
              id="preferredStylist"
              name="preferredStylist"
              value={formData.preferredStylist}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">선택 안함</option>
              {designers.map(designer => (
                <option key={designer} value={designer}>{designer}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 선호 서비스 */}
        <div>
          <label htmlFor="preferredService" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            선호 서비스
          </label>
          <select
            id="preferredService"
            name="preferredService"
            value={formData.preferredService}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">선택 안함</option>
            {serviceTypes.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        {/* VIP 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="vipStatus"
              name="vipStatus"
              checked={formData.vipStatus}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="vipStatus" className="ml-2 block text-sm text-gray-900 dark:text-white">
              VIP 고객
            </label>
          </div>

          {formData.vipStatus && (
            <div>
              <label htmlFor="vipLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                VIP 등급
              </label>
              <select
                id="vipLevel"
                name="vipLevel"
                value={formData.vipLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>기본</option>
                <option value={1}>실버</option>
                <option value={2}>골드</option>
                <option value={3}>플래티넘</option>
              </select>
            </div>
          )}
        </div>

        {/* 알레르기 정보 */}
        <div>
          <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            알레르기 / 주의사항
          </label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="알레르기나 특별히 주의해야 할 사항을 입력하세요..."
          />
        </div>

        {/* 메모 (등록시에만) */}
        {!customer && (
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              메모
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="고객에 대한 메모를 입력하세요..."
            />
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {customer ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;