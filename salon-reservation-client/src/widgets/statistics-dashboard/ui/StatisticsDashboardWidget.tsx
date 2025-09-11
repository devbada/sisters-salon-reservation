import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
// import { useStatisticsStore } from '~/features/statistics-reporting'; // TODO: Create statistics-reporting feature
import { StatCard } from './StatCard';
import { StatisticsCharts } from './StatisticsCharts';

interface StatisticsDashboardWidgetProps {
  className?: string;
}

export const StatisticsDashboardWidget: React.FC<StatisticsDashboardWidgetProps> = ({
  className = '',
}) => {
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  
  // TODO: Replace with real statistics store
  const summaryStats = {
    totalReservations: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageServiceTime: 0
  };
  const dailyStats: any[] = [];
  const loading = false;
  const error = null;
  const fetchStatistics = () => {};

  const periodLabels = {
    '7days': '최근 7일',
    '30days': '최근 30일',
    '90days': '최근 90일'
  };

  const colors = ['#A855F7', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  useEffect(() => {
    fetchStatistics(period);
  }, [fetchStatistics, period]);

  const processChartData = () => {
    const trendData = dailyStats.map(day => ({
      date: format(parseISO(day.date), 'MM/dd', { locale: ko }),
      fullDate: day.date,
      예약수: day.totalReservations
    }));

    const stylistData: Record<string, number> = {};
    dailyStats.forEach(day => {
      Object.entries(day.byStyler).forEach(([stylist, count]) => {
        stylistData[stylist] = (stylistData[stylist] || 0) + count;
      });
    });

    const stylistChartData = Object.entries(stylistData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const serviceData: Record<string, number> = {};
    dailyStats.forEach(day => {
      Object.entries(day.byService).forEach(([service, count]) => {
        serviceData[service] = (serviceData[service] || 0) + count;
      });
    });

    const serviceChartData = Object.entries(serviceData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { trendData, stylistChartData, serviceChartData };
  };

  if (error) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${className}`}>
        <div className="bg-red-100/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white"></div>
          <span className="ml-4 text-gray-700">통계 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  const chartData = processChartData();

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-800">📊 통계 대시보드</h1>
        
        <div className="flex space-x-2">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key as typeof period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'glass-card text-gray-700 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="총 예약 수"
              value={summaryStats.totalReservations}
              icon="📅"
              trend={summaryStats.growthRate !== 0 ? {
                value: summaryStats.growthRate,
                isPositive: summaryStats.growthRate > 0
              } : undefined}
              subtitle={`${periodLabels[period]} 동안`}
            />
            
            <StatCard
              title="일평균 예약"
              value={summaryStats.averagePerDay.toFixed(1)}
              icon="📈"
              subtitle="건/일"
            />
            
            <StatCard
              title="최고 인기 디자이너"
              value={summaryStats.topStyler || '-'}
              icon="👨‍🎨"
              subtitle={summaryStats.topStylerCount ? `${summaryStats.topStylerCount}건` : undefined}
            />
            
            <StatCard
              title="인기 서비스"
              value={summaryStats.topService === 'Haircut' ? '헤어컷' :
                     summaryStats.topService === 'Coloring' ? '염색' :
                     summaryStats.topService === 'Styling' ? '스타일링' :
                     summaryStats.topService === 'Treatment' ? '트리트먼트' :
                     summaryStats.topService || '-'}
              icon="✨"
              subtitle={summaryStats.topServiceCount ? `${summaryStats.topServiceCount}건` : undefined}
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="가장 바쁜 요일"
              value={summaryStats.busiestDay || '-'}
              icon="📆"
              subtitle={summaryStats.busiestDayCount ? `${summaryStats.busiestDayCount}건` : undefined}
            />
            
            <StatCard
              title="피크 시간대"
              value={summaryStats.busiestHour || '-'}
              icon="⏰"
              subtitle={summaryStats.busiestHourCount ? `${summaryStats.busiestHourCount}건` : undefined}
            />
            
            <StatCard
              title="성장률"
              value={summaryStats.growthRate !== 0 ? `${summaryStats.growthRate > 0 ? '+' : ''}${summaryStats.growthRate.toFixed(1)}%` : '0%'}
              icon={summaryStats.growthRate > 0 ? '🚀' : summaryStats.growthRate < 0 ? '📉' : '➖'}
              subtitle="전 기간 대비"
              className={
                summaryStats.growthRate > 0 ? 'border-green-200 bg-green-50/20' :
                summaryStats.growthRate < 0 ? 'border-red-200 bg-red-50/20' : ''
              }
            />
          </div>
        </>
      )}

      {/* Charts */}
      {dailyStats.length > 0 && (
        <StatisticsCharts data={chartData} colors={colors} />
      )}
    </div>
  );
};