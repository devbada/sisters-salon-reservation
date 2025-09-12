import { useState, useEffect } from 'react';
import type { BusinessHour, SpecialHour, BusinessHoliday } from '~/shared/lib/types';
import { showToast } from '~/shared/ui/Toast';
import { useLoadingStore, LOADING_KEYS } from '~/shared/lib/store/loadingStore';
import { logError } from '~/shared/lib/store/errorStore';

export const useBusinessHours = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [holidays, setHolidays] = useState<BusinessHoliday[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { startLoading, stopLoading, isRequestLoading } = useLoadingStore();
  
  const isLoading = isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.FETCH) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.UPDATE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_CREATE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_UPDATE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_DELETE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_CREATE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_UPDATE) ||
                   isRequestLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_DELETE);

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        startLoading(LOADING_KEYS.BUSINESS_HOURS.FETCH);
        
        const [businessHoursRes, specialHoursRes, holidaysRes] = await Promise.all([
          fetch('/api/business-hours'),
          fetch('/api/special-hours'),
          fetch('/api/holidays')
        ]);

        if (!businessHoursRes.ok || !specialHoursRes.ok || !holidaysRes.ok) {
          throw new Error('데이터 로드 실패');
        }

        const [businessHoursData, specialHoursData, holidaysData] = await Promise.all([
          businessHoursRes.json(),
          specialHoursRes.json(),
          holidaysRes.json()
        ]);

        setBusinessHours(businessHoursData);
        setSpecialHours(specialHoursData);
        setHolidays(holidaysData);
        setError(null);
      } catch (error: any) {
        const errorMessage = '데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
        logError(errorMessage, 'useBusinessHours.loadInitialData', error?.code || 'FETCH_ERROR');
        console.error('Failed to load business hours data:', error);
      } finally {
        stopLoading(LOADING_KEYS.BUSINESS_HOURS.FETCH);
      }
    };

    loadInitialData();
  }, [startLoading, stopLoading]);

  const updateBusinessHour = async (updatedData: BusinessHour[]) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.UPDATE);
      
      const response = await fetch('/api/business-hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('영업시간 수정 실패');
      }

      const savedData = await response.json();
      setBusinessHours(savedData);
      setError(null);
      showToast('영업시간이 성공적으로 저장되었습니다.', 'success');
      return savedData;
    } catch (error: any) {
      const errorMessage = '영업시간 수정에 실패했습니다.';
      setError(errorMessage);
      logError(errorMessage, 'useBusinessHours.updateBusinessHour', error?.code || 'UPDATE_ERROR');
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.UPDATE);
    }
  };

  // Special Hours management
  const createSpecialHour = async (data: Omit<SpecialHour, 'id'>) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_CREATE);
      
      const response = await fetch('/api/special-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('특별 영업시간 생성 실패');
      }

      const newSpecialHour = await response.json();
      setSpecialHours(prev => [...prev, newSpecialHour]);
      setError(null);
      showToast('특별 영업시간이 추가되었습니다.', 'success');
      return newSpecialHour;
    } catch (error) {
      const errorMessage = '특별 영업시간 생성에 실패했습니다.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_CREATE);
    }
  };

  const updateSpecialHour = async (id: string, data: Partial<SpecialHour>) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_UPDATE);
      
      const response = await fetch(`/api/special-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('특별 영업시간 수정 실패');
      }

      const updatedSpecialHour = await response.json();
      setSpecialHours(prev => 
        prev.map(hour => 
          hour.id === id ? updatedSpecialHour : hour
        )
      );
      setError(null);
      showToast('특별 영업시간이 수정되었습니다.', 'success');
      return updatedSpecialHour;
    } catch (error) {
      setError('특별 영업시간 수정에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_UPDATE);
    }
  };

  const deleteSpecialHour = async (id: string) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_DELETE);
      
      const response = await fetch(`/api/special-hours/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('특별 영업시간 삭제 실패');
      }

      setSpecialHours(prev => prev.filter(hour => hour.id !== id));
      setError(null);
      showToast('특별 영업시간이 삭제되었습니다.', 'success');
    } catch (error) {
      setError('특별 영업시간 삭제에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.SPECIAL_HOURS_DELETE);
    }
  };

  // Holidays management
  const createHoliday = async (data: Omit<BusinessHoliday, 'id'>) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_CREATE);
      
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('공휴일 생성 실패');
      }

      const newHoliday = await response.json();
      setHolidays(prev => [...prev, newHoliday]);
      setError(null);
      showToast('공휴일이 추가되었습니다.', 'success');
      return newHoliday;
    } catch (error) {
      const errorMessage = '공휴일 생성에 실패했습니다.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_CREATE);
    }
  };

  const updateHoliday = async (id: string, data: Partial<BusinessHoliday>) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_UPDATE);
      
      const response = await fetch(`/api/holidays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('공휴일 수정 실패');
      }

      const updatedHoliday = await response.json();
      setHolidays(prev => 
        prev.map(holiday => 
          holiday.id === id ? updatedHoliday : holiday
        )
      );
      setError(null);
      showToast('공휴일이 수정되었습니다.', 'success');
      return updatedHoliday;
    } catch (error) {
      setError('공휴일 수정에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_UPDATE);
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      startLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_DELETE);
      
      const response = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('공휴일 삭제 실패');
      }

      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      setError(null);
      showToast('공휴일이 삭제되었습니다.', 'success');
    } catch (error) {
      setError('공휴일 삭제에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.BUSINESS_HOURS.HOLIDAYS_DELETE);
    }
  };

  return {
    businessHours,
    specialHours,
    holidays,
    isLoading,
    error,
    updateBusinessHour,
    createSpecialHour,
    updateSpecialHour,
    deleteSpecialHour,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  };
};