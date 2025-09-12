import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '🚨',
          confirmBg: 'from-red-500 to-red-600',
          confirmHover: 'from-red-600 to-red-700'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmBg: 'from-yellow-500 to-orange-500',
          confirmHover: 'from-yellow-600 to-orange-600'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmBg: 'from-blue-500 to-blue-600',
          confirmHover: 'from-blue-600 to-blue-700'
        };
      default:
        return {
          icon: '⚠️',
          confirmBg: 'from-yellow-500 to-orange-500',
          confirmHover: 'from-yellow-600 to-orange-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">{colors.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 bg-gradient-to-r ${colors.confirmBg} text-white rounded-lg hover:bg-gradient-to-r hover:${colors.confirmHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};