import React from 'react';
import { StatisticsDashboardWidget } from '~/widgets/statistics-dashboard';

export const StatisticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <StatisticsDashboardWidget className="animate-fadeInUp" />
    </div>
  );
};