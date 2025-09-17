import React from 'react';
import CustomerManagement from '../components/CustomerManagement';

const CustomersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-[80vw] mx-auto">
        <CustomerManagement />
      </div>
    </div>
  );
};

export default CustomersPage;