import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import StatCard from './StatCard';

interface SummaryStats {
  totalReservations: number;
  averagePerDay: number;
  busiestDay: string | null;
  busiestDayCount: number;
  busiestHour: string | null;
  busiestHourCount: number;
  topStyler: string | null;
  topStylerCount: number;
  topService: string | null;
  topServiceCount: number;
  growthRate: number;
  period: string;
  dateRange: { startDate: string; endDate: string };
}

interface DailyStats {
  date: string;
  totalReservations: number;
  byStyler: Record<string, number>;
  byService: Record<string, number>;
  byHour: Record<string, number>;
}

// Removed unused HeatmapData interface

const StatisticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for different data types
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  // Removed unused heatmapData state

  const periodLabels = {
    '7days': '최근 7일',
    '30days': '최근 30일',
    '90days': '최근 90일'
  };

  // Colors for charts
  const colors = ['#A855F7', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Fetch all required data in parallel
      const [summaryResponse, dailyResponse] = await Promise.all([
        axios.get(`http://localhost:4000/api/statistics/summary?period=${period}`, config),
        axios.get(`http://localhost:4000/api/statistics/daily?period=${period}`, config)
      ]);

      setSummaryStats(summaryResponse.data);
      setDailyStats(dailyResponse.data.data || []);
    } catch (err: any) {
      setError('통계 데이터를 가져오는데 실패했습니다.');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Process data for charts
  const processChartData = () => {
    // Daily trend data
    const trendData = dailyStats.map(day => ({
      date: format(parseISO(day.date), 'MM/dd', { locale: ko }),
      fullDate: day.date,
      예약수: day.totalReservations
    }));

    // Stylist performance data
    const stylistData: Record<string, number> = {};
    dailyStats.forEach(day => {
      Object.entries(day.byStyler).forEach(([stylist, count]) => {
        stylistData[stylist] = (stylistData[stylist] || 0) + count;
      });
    });

    const stylistChartData = Object.entries(stylistData)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 stylists

    // Service type data
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

  const { trendData, stylistChartData, serviceChartData } = processChartData();

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 예약 통계 대시보드</h1>
          <p className="text-gray-600">비즈니스 인사이트와 성과 분석</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-white/30 backdrop-blur-md rounded-xl p-1 border border-white/20">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key as typeof period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === key
                  ? 'bg-white/50 text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 예약 수"
          value={summaryStats?.totalReservations || 0}
          change={summaryStats?.growthRate}
          icon="📅"
          loading={loading}
        />
        <StatCard
          title="일평균 예약"
          value={summaryStats?.averagePerDay || 0}
          icon="📊"
          loading={loading}
        />
        <StatCard
          title="최고 실적 스타일리스트"
          value={summaryStats?.topStyler || '-'}
          icon="💇‍♀️"
          loading={loading}
        />
        <StatCard
          title="인기 서비스"
          value={summaryStats?.topService || '-'}
          icon="✨"
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 일별 예약 추이</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-500">차트 로딩 중...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="예약수"
                  stroke="#A855F7"
                  fill="url(#colorGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stylist Performance Chart */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 스타일리스트별 성과</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-500">차트 로딩 중...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stylistChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#EC4899"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Service Distribution Chart */}
      <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 서비스 종류별 분포</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">차트 로딩 중...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Info */}
      {summaryStats && !loading && (
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 주요 인사이트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <span className="font-medium">가장 바쁜 날:</span>
              <p className="text-gray-700">
                {summaryStats.busiestDay 
                  ? `${format(parseISO(summaryStats.busiestDay), 'yyyy년 MM월 dd일', { locale: ko })} (${summaryStats.busiestDayCount}건)`
                  : '데이터 없음'
                }
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <span className="font-medium">피크 타임:</span>
              <p className="text-gray-700">
                {summaryStats.busiestHour 
                  ? `${summaryStats.busiestHour} (${summaryStats.busiestHourCount}건)`
                  : '데이터 없음'
                }
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <span className="font-medium">기간:</span>
              <p className="text-gray-700">
                {format(parseISO(summaryStats.dateRange.startDate), 'MM/dd', { locale: ko })} - {' '}
                {format(parseISO(summaryStats.dateRange.endDate), 'MM/dd', { locale: ko })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsDashboard;