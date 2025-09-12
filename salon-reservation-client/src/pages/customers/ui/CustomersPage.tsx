import React, { useState } from 'react';
import { CustomerListWidget } from '~/widgets/customer-list';
import { CustomerForm, CustomerFormData } from '~/features/customer-management/ui/CustomerForm';
import { useCustomers } from '~/features/customer-management';
import { useDesigners } from '~/features/designer-management';
import type { Customer } from '~/entities/customer';

export const CustomersPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const { createCustomer, updateCustomer, deleteCustomer, isLoading } = useCustomers();
  const { designers } = useDesigners();
  
  const designerNames = designers.filter(d => d.isActive).map(d => d.name);
  const availableServices = ['컷', '컷+염색', '펌', '트리트먼트', '스타일링', '케어'];

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    // 고객 상세 정보 모달 열기 등
    console.log('고객 선택:', customer.name);
  };

  const handleCustomerEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
    console.log('고객 편집:', customer.name);
  };

  const handleCustomerDelete = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      console.log('고객 삭제 완료:', customerId);
    } catch (error) {
      console.error('고객 삭제 실패:', error);
    }
  };

  const handleCustomerAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
    console.log('새 고객 등록');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleFormSubmit = async (formData: CustomerFormData) => {
    try {
      if (editingCustomer) {
        // 수정 모드
        const updatedCustomer = await updateCustomer(editingCustomer.id, formData);
        console.log('고객 정보 수정 완료:', updatedCustomer);
      } else {
        // 생성 모드
        const newCustomer = await createCustomer(formData);
        console.log('새 고객 등록 완료:', newCustomer);
      }
      handleFormClose();
    } catch (error) {
      console.error('고객 정보 처리 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      <CustomerListWidget
        onCustomerSelect={handleCustomerSelect}
        onCustomerEdit={handleCustomerEdit}
        onCustomerDelete={handleCustomerDelete}
        onCustomerAdd={handleCustomerAdd}
      />

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              고객 상세 정보
            </h3>
            <div className="space-y-3">
              <p><strong>이름:</strong> {selectedCustomer.name}</p>
              <p><strong>연락처:</strong> {selectedCustomer.phone}</p>
              {selectedCustomer.email && (
                <p><strong>이메일:</strong> {selectedCustomer.email}</p>
              )}
              {selectedCustomer.birthDate && (
                <p><strong>생년월일:</strong> {selectedCustomer.birthDate}</p>
              )}
              <p><strong>총 방문:</strong> {selectedCustomer.totalVisits || 0}회</p>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingCustomer ? '고객 정보 수정' : '새 고객 등록'}
            </h3>
            <CustomerForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              initialData={editingCustomer || undefined}
              designers={designerNames}
              services={availableServices}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};