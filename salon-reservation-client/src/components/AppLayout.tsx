import React from 'react';
import NavigationTabs from './NavigationTabs';
import AppRouter from '../AppRouter';

const AppLayout: React.FC = () => {
  return (
    <div className="App-content space-y-6">
      {/* Navigation Tabs */}
      <NavigationTabs />

      {/* Tab Content - Handled by Router */}
      <AppRouter />
    </div>
  );
};

export default AppLayout;