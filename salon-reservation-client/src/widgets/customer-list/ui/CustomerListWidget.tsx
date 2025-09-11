import React, { useState, useEffect } from 'react';
import { useCustomers } from '~/features/customer-management';
import { CustomerCard } from './CustomerCard';
import { CustomerSearch } from './CustomerSearch';
import type { Customer } from '~/entities/customer';

interface CustomerListWidgetProps {
  onCustomerSelect: (customer: Customer) => void;
  onCustomerEdit: (customer: Customer) => void;
  onCustomerDelete: (customerId: string) => void;
  onCustomerAdd: () => void;
}

export const CustomerListWidget: React.FC<CustomerListWidgetProps> = ({
  onCustomerSelect,
  onCustomerEdit,
  onCustomerDelete,
  onCustomerAdd,
}) => {
  const { 
    customers, 
    loading, 
    error, 
    pagination,
    fetchCustomers, 
    deleteCustomer 
  } = useCustomers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState<string>('all');

  useEffect(() => {
    fetchCustomers({ search: '', vip: 'all', offset: 0 });
  }, [fetchCustomers]);

  const handleSearch = () => {
    fetchCustomers({ search: searchTerm, vip: vipFilter, offset: 0 });
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchCustomers({ 
        search: searchTerm, 
        vip: vipFilter, 
        offset: pagination.offset + pagination.limit 
      });
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      await deleteCustomer(customerId);
      onCustomerDelete(customerId);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">고객 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchCustomers({ search: '', vip: 'all', offset: 0 })}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 고객 관리</h2>
        <button
          onClick={onCustomerAdd}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
        >
          ➕ 새 고객 등록
        </button>
      </div>

      {/* Search */}
      <CustomerSearch
        searchTerm={searchTerm}
        vipFilter={vipFilter}
        onSearchChange={setSearchTerm}
        onVipFilterChange={setVipFilter}
        onSearch={handleSearch}
      />

      {/* Customer List */}
      {!loading && customers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            등록된 고객이 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            첫 번째 고객을 등록해보세요.
          </p>
          <button
            onClick={onCustomerAdd}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
          >
            ➕ 고객 등록하기
          </button>
        </div>
      ) : (
        <>
          {/* Results Stats */}
          <div className="glass-card px-4 py-2 text-gray-800 text-sm">
            📊 총 {pagination.total}명의 고객 ({customers.length}명 표시 중)
          </div>

          {/* Customer Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onSelect={onCustomerSelect}
                onEdit={onCustomerEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 inline-block mr-2"></div>
                    불러오는 중...
                  </>
                ) : (
                  '더 보기'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};