import { useState, useEffect } from 'react';
import { Customer, customerApi } from '~/entities/customer';
import { useDebounce } from '~/shared/lib/hooks';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!debouncedSearchQuery) {
        setCustomers([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const results = await customerApi.searchCustomers(debouncedSearchQuery);
        setCustomers(results);
      } catch (error) {
        setError('고객 검색에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    searchCustomers();
  }, [debouncedSearchQuery]);

  const createCustomer = async (customerData: any) => {
    try {
      setIsLoading(true);
      const newCustomer = await customerApi.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      setError('고객 생성에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customers,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    createCustomer,
  };
};