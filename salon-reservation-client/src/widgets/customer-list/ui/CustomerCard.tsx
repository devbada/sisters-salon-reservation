import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Customer } from '~/entities/customer';

interface CustomerCardProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isBirthdayThisMonth = (birthdate?: string) => {
    if (!birthdate) return false;
    const birth = new Date(birthdate);
    const today = new Date();
    return birth.getMonth() === today.getMonth();
  };

  const VipBadge: React.FC<{ vipStatus: boolean; vipLevel?: number }> = ({ vipStatus, vipLevel = 0 }) => {
    if (!vipStatus) return null;
    
    const colors = ['bg-gray-500', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700'];
    const bgColor = colors[Math.min(vipLevel, colors.length - 1)];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${bgColor}`}>
        👑 VIP{vipLevel > 0 ? ` ${vipLevel}` : ''}
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
        customer.vipStatus ? 'ring-2 ring-yellow-200' : ''
      }`}
      onClick={() => onSelect(customer)}
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
            <VipBadge vipStatus={customer.vipStatus} vipLevel={customer.vipLevel} />
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
            
            {customer.preferredStylist && (
              <div className="flex items-center gap-2">
                <span>💇</span>
                <span>선호 디자이너: {customer.preferredStylist}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                방문 {customer.totalVisits || 0}회
              </span>
              
              {customer.lastVisitDate && (
                <span className="text-xs text-gray-500">
                  마지막 방문: {formatDistanceToNow(new Date(customer.lastVisitDate), { 
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
              onEdit(customer);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="편집"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(customer.id);
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
};