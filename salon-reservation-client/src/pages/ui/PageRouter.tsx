import React from 'react';
import { usePageStore, PageType } from '../model/pageStore';
import { Header } from '~/widgets/header';
import { ReservationsPage } from '../reservations/ui/ReservationsPage';
import { CustomersPage } from '../customers/ui/CustomersPage';
import { DesignersPage } from '../designers/ui/DesignersPage';
import { BusinessHoursPage } from '../business-hours/ui/BusinessHoursPage';
import { StatisticsPage } from '../statistics/ui/StatisticsPage';

export const PageRouter: React.FC = () => {
  const { currentPage, isLoading, navigateToPage } = usePageStore();

  const handleTabChange = (tab: PageType) => {
    navigateToPage(tab);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'reservations':
        return <ReservationsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'designers':
        return <DesignersPage />;
      case 'business-hours':
        return <BusinessHoursPage />;
      case 'statistics':
        return <StatisticsPage />;
      default:
        return <ReservationsPage />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <Header activeTab={currentPage} onTabChange={handleTabChange} />
      
      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
};