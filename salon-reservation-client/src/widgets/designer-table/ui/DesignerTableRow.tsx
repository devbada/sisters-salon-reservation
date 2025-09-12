import React from 'react';
import type { Designer } from '~/entities/designer';

interface DesignerTableRowProps {
  designer: Designer;
  onEdit: (designer: Designer) => void;
  onDelete: (designer: Designer) => void;
}

export const DesignerTableRow: React.FC<DesignerTableRowProps> = ({
  designer,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    if (window.confirm(`정말로 "${designer.name}" 디자이너를 삭제하시겠습니까?`)) {
      onDelete(designer);
    }
  };

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {designer.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{designer.name}</div>
            {designer.email && (
              <div className="text-sm text-gray-600">{designer.email}</div>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-700">
        {designer.specialties?.join(', ') || '-'}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {/* TODO: experienceYears 속성이 Designer 타입에 없음 */}
        -
      </td>
      <td className="py-4 px-4 text-gray-700">
        {designer.phone || '-'}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          designer.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {designer.isActive ? '✅ 활성화' : '❌ 비활성화'}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(designer)}
            className="glass-card px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm hover:scale-105"
            title="편집"
          >
            ✏️ 편집
          </button>
          <button
            onClick={handleDelete}
            className="glass-card px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm hover:scale-105"
            title="삭제"
          >
            🗑️ 삭제
          </button>
        </div>
      </td>
    </tr>
  );
};