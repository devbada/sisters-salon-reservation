import React from 'react';
import { useLoadingStore } from '~/shared/lib/store/loadingStore';

export const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <p className="text-gray-700 font-medium">처리 중...</p>
      </div>
    </div>
  );
};