import React from 'react';
import DesignerManagement from '../components/DesignerManagement';

const DesignersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-[80vw] mx-auto">
        <DesignerManagement />
      </div>
    </div>
  );
};

export default DesignersPage;