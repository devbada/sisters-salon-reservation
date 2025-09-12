import React from 'react';
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

interface ChartData {
  trendData: Array<{ date: string; fullDate: string; 예약수: number }>;
  stylistChartData: Array<{ name: string; count: number }>;
  serviceChartData: Array<{ name: string; value: number }>;
}

interface StatisticsChartsProps {
  data: ChartData;
  colors: string[];
}

export const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ data, colors }) => {
  const { trendData, stylistChartData, serviceChartData } = data;

  const getServiceDisplayName = (service: string) => {
    const serviceNames: Record<string, string> = {
      'Haircut': '헤어컷',
      'Coloring': '염색',
      'Styling': '스타일링',
      'Treatment': '트리트먼트'
    };
    return serviceNames[service] || service;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Daily Trend Chart */}
      <div className="glass-card p-6 rounded-2xl col-span-1 xl:col-span-2">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          📈 일별 예약 추이
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return `${payload[0].payload.fullDate}`;
                  }
                  return value;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="예약수" 
                stroke="#A855F7" 
                fillOpacity={1} 
                fill="url(#colorUv)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stylist Performance Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          👨‍🎨 디자이너별 성과
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stylistChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#6B7280" 
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#EC4899"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Type Distribution */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          ✨ 서비스 유형별 분포
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${getServiceDisplayName(name)} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [value, getServiceDisplayName(name as string)]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};