import React from 'react';
import BusinessHoursManagement from '../components/BusinessHours';

const BusinessHoursPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-[80vw] mx-auto">
        <BusinessHoursManagement />
      </div>
    </div>
  );
};

export default BusinessHoursPage;