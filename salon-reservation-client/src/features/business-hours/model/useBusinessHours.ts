import { useState, useEffect } from 'react';
import { BusinessHours, businessHoursApi } from '~/entities/business-hours';

export const useBusinessHours = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await businessHoursApi.getBusinessHours();
        setBusinessHours(data);
      } catch (error) {
        setError('영업시간 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  const updateBusinessHour = async (id: string, businessHourData: any) => {
    try {
      setIsLoading(true);
      const updated = await businessHoursApi.updateBusinessHours(id, businessHourData);
      setBusinessHours(prev => prev.map(bh => 
        bh.id === id ? updated : bh
      ));
      return updated;
    } catch (error) {
      setError('영업시간 수정에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    businessHours,
    isLoading,
    error,
    updateBusinessHour,
  };
};