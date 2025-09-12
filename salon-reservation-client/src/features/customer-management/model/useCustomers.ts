import { useState, useEffect } from 'react';
import { Customer, customerApi } from '~/entities/customer';
import { useDebounce } from '~/shared/lib/hooks';
import { useLoadingStore, LOADING_KEYS } from '~/shared/lib/store/loadingStore';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { startLoading, stopLoading, isRequestLoading } = useLoadingStore();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const isLoading = isRequestLoading(LOADING_KEYS.CUSTOMERS.SEARCH) ||
                   isRequestLoading(LOADING_KEYS.CUSTOMERS.CREATE) ||
                   isRequestLoading(LOADING_KEYS.CUSTOMERS.UPDATE) ||
                   isRequestLoading(LOADING_KEYS.CUSTOMERS.DELETE);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!debouncedSearchQuery) {
        setCustomers([]);
        return;
      }

      try {
        startLoading(LOADING_KEYS.CUSTOMERS.SEARCH);
        setError(null);
        const results = await customerApi.searchCustomers(debouncedSearchQuery);
        setCustomers(results);
      } catch (error) {
        setError('고객 검색에 실패했습니다.');
      } finally {
        stopLoading(LOADING_KEYS.CUSTOMERS.SEARCH);
      }
    };

    searchCustomers();
  }, [debouncedSearchQuery, startLoading, stopLoading]);

  const createCustomer = async (customerData: any) => {
    try {
      startLoading(LOADING_KEYS.CUSTOMERS.CREATE);
      const newCustomer = await customerApi.createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      setError('고객 생성에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.CUSTOMERS.CREATE);
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<any>) => {
    try {
      startLoading(LOADING_KEYS.CUSTOMERS.UPDATE);
      const updatedCustomer = await customerApi.updateCustomer(id, customerData);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? updatedCustomer : customer
      ));
      return updatedCustomer;
    } catch (error) {
      setError('고객 정보 수정에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.CUSTOMERS.UPDATE);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      startLoading(LOADING_KEYS.CUSTOMERS.DELETE);
      await customerApi.deleteCustomer(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      setError('고객 삭제에 실패했습니다.');
      throw error;
    } finally {
      stopLoading(LOADING_KEYS.CUSTOMERS.DELETE);
    }
  };

  return {
    customers,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};