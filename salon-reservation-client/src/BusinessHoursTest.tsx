import React from 'react';
import BusinessHoursManagement from './components/BusinessHours';

const BusinessHoursTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏪 Business Hours Management Test
          </h1>
          <p className="text-gray-600">영업시간 관리 기능 테스트</p>
        </div>
        
        <BusinessHoursManagement />
      </div>
    </div>
  );
};

export default BusinessHoursTest;