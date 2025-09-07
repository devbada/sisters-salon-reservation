import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Customer, CustomerListResponse } from '../types/customer';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import CustomerProfile from './CustomerProfile';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  // 고객 목록 조회
  const fetchCustomers = async (search = '', vip = 'all', offset = 0) => {
    try {
      setLoading(true);
      const params: any = { 
        limit: pagination.limit, 
        offset,
        sortBy: 'name',
        order: 'ASC'
      };
      
      if (search.trim()) params.search = search.trim();
      if (vip !== 'all') params.vip = vip === 'true';
      
      const response = await axios.get<CustomerListResponse>('/api/customers', { params });
      
      if (offset === 0) {
        setCustomers(response.data.customers);
      } else {
        setCustomers(prev => [...prev, ...response.data.customers]);
      }
      
      setPagination(response.data.pagination);
      setError(null);
    } catch (error) {
      console.error('고객 목록 조회 오류:', error);
      setError('고객 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 고객 삭제
  const deleteCustomer = async (customerId: number) => {
    if (!window.confirm('정말로 이 고객을 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
      alert('고객이 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      console.error('고객 삭제 오류:', error);
      alert(error.response?.data?.error || '고객 삭제 중 오류가 발생했습니다.');
    }
  };

  // 고객 등록/수정 성공 처리
  const handleCustomerSave = (customer: Customer) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    } else {
      setCustomers(prev => [customer, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    }
    setShowForm(false);
    setEditingCustomer(null);
  };

  // 검색 실행
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchCustomers(searchTerm, vipFilter, 0);
  };

  // 더 많이 로드
  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchCustomers(searchTerm, vipFilter, pagination.offset + pagination.limit);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n' && !showForm) {
        e.preventDefault();
        setShowForm(true);
        setEditingCustomer(null);
      } else if (e.key === 'Escape') {
        if (showForm) {
          setShowForm(false);
          setEditingCustomer(null);
        } else if (selectedCustomer) {
          setSelectedCustomer(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showForm, selectedCustomer]);

  if (selectedCustomer) {
    return (
      <CustomerProfile
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onEdit={(customer) => {
          setEditingCustomer(customer);
          setShowForm(true);
        }}
        onDelete={deleteCustomer}
        onUpdate={(customer) => {
          setSelectedCustomer(customer);
          setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
        }}
      />
    );
  }

  if (showForm) {
    return (
      <CustomerForm
        customer={editingCustomer}
        onSave={handleCustomerSave}
        onCancel={() => {
          setShowForm(false);
          setEditingCustomer(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👥 고객 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            총 {pagination.total}명의 고객이 등록되어 있습니다
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCustomer(null);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>+</span>
          새 고객 등록 (Ctrl+N)
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="이름 또는 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">전체 고객</option>
            <option value="true">VIP 고객</option>
            <option value="false">일반 고객</option>
          </select>
          
          <button
            onClick={handleSearch}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* 고객 목록 */}
      <CustomerList
        customers={customers}
        loading={loading}
        onCustomerSelect={setSelectedCustomer}
        onCustomerEdit={(customer) => {
          setEditingCustomer(customer);
          setShowForm(true);
        }}
        onCustomerDelete={deleteCustomer}
        onLoadMore={loadMore}
        hasMore={pagination.hasMore}
      />
    </div>
  );
};

export default CustomerManagement;