import React from 'react';
import { Customer } from '../types/customer';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerEdit: (customer: Customer) => void;
  onCustomerDelete: (customerId: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  onCustomerSelect,
  onCustomerEdit,
  onCustomerDelete,
  onLoadMore,
  hasMore
}) => {
  // 생일 체크 (이번 달)
  const isBirthdayThisMonth = (birthdate?: string) => {
    if (!birthdate) return false;
    const birth = new Date(birthdate);
    const today = new Date();
    return birth.getMonth() === today.getMonth();
  };

  // VIP 배지 컴포넌트
  const VipBadge: React.FC<{ vipStatus: boolean; vipLevel: number }> = ({ vipStatus, vipLevel }) => {
    if (!vipStatus) return null;
    
    const colors = ['bg-gray-500', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700'];
    const bgColor = colors[Math.min(vipLevel, colors.length - 1)];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${bgColor}`}>
        👑 VIP{vipLevel > 0 ? ` ${vipLevel}` : ''}
      </span>
    );
  };

  // 고객 카드 컴포넌트
  const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
        customer.vip_status ? 'ring-2 ring-yellow-200' : ''
      }`}
      onClick={() => onCustomerSelect(customer)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h3>
            {isBirthdayThisMonth(customer.birthdate) && (
              <span className="text-pink-500" title="이번 달 생일">🎂</span>
            )}
            <VipBadge vipStatus={customer.vip_status} vipLevel={customer.vip_level} />
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{customer.phone}</span>
            </div>
            
            {customer.email && (
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>{customer.email}</span>
              </div>
            )}
            
            {customer.preferred_stylist && (
              <div className="flex items-center gap-2">
                <span>💇</span>
                <span>선호 디자이너: {customer.preferred_stylist}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                방문 {customer.total_visits}회
              </span>
              
              {customer.last_visit_date && (
                <span className="text-xs text-gray-500">
                  마지막 방문: {formatDistanceToNow(new Date(customer.last_visit_date), { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomerEdit(customer);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="편집"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomerDelete(customer.id);
            }}
            className="text-red-600 hover:text-red-800"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">고객 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (!loading && customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          등록된 고객이 없습니다
        </h3>
        <p className="text-gray-600">
          첫 번째 고객을 등록해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 데스크톱용 테이블 뷰 */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    방문 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIP
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onCustomerSelect(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {isBirthdayThisMonth(customer.birthdate) && (
                              <span className="text-pink-500" title="이번 달 생일">🎂</span>
                            )}
                          </div>
                          {customer.preferred_stylist && (
                            <div className="text-sm text-gray-500">
                              선호: {customer.preferred_stylist}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.total_visits}회 방문
                      </div>
                      {customer.last_visit_date && (
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(customer.last_visit_date), { 
                            addSuffix: true, 
                            locale: ko 
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <VipBadge vipStatus={customer.vip_status} vipLevel={customer.vip_level} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomerEdit(customer);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="편집"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomerDelete(customer.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 모바일용 카드 뷰 */}
      <div className="lg:hidden space-y-4">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                로딩 중...
              </span>
            ) : (
              '더 보기'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerList;