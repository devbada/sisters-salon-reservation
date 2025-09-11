import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-white/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/20 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon && (
          <div className="w-8 h-8 bg-purple-100/50 rounded-lg flex items-center justify-center text-purple-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center">
          <span className={`text-sm font-medium ${getChangeColor(change)} flex items-center`}>
            {getChangeIcon(change)} {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500 ml-2">전월 대비</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;