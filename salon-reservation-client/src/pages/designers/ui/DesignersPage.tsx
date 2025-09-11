import React, { useState } from 'react';
import { DesignerTableWidget } from '~/widgets/designer-table';
import { useDesignerStore } from '~/features/designer-management';
import type { Designer } from '~/entities/designer';

export const DesignersPage: React.FC = () => {
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { deleteDesigner } = useDesignerStore();

  const handleDesignerEdit = (designer: Designer) => {
    setEditingDesigner(designer);
    setShowForm(true);
    console.log('디자이너 편집:', designer.name);
  };

  const handleDesignerDelete = async (designer: Designer) => {
    if (window.confirm(`정말로 "${designer.name}" 디자이너를 삭제하시겠습니까?`)) {
      try {
        await deleteDesigner(designer.id);
        console.log('디자이너 삭제 완료:', designer.name);
      } catch (error) {
        console.error('디자이너 삭제 실패:', error);
      }
    }
  };

  const handleDesignerAdd = () => {
    setEditingDesigner(null);
    setShowForm(true);
    console.log('새 디자이너 등록');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDesigner(null);
  };

  const handleFormSubmit = async (designerData: Partial<Designer>) => {
    try {
      if (editingDesigner) {
        // 수정 로직
        console.log('디자이너 수정:', designerData);
      } else {
        // 추가 로직
        console.log('디자이너 추가:', designerData);
      }
      handleFormClose();
    } catch (error) {
      console.error('디자이너 저장 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      <DesignerTableWidget
        onEdit={handleDesignerEdit}
        onDelete={handleDesignerDelete}
        onAdd={handleDesignerAdd}
      />

      {/* Designer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingDesigner ? '디자이너 정보 수정' : '새 디자이너 등록'}
            </h3>
            
            {/* 임시 폼 - DesignerForm 위젯이 생성되면 대체 */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  defaultValue={editingDesigner?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전문분야
                </label>
                <input
                  type="text"
                  defaultValue={editingDesigner?.specialization || ''}
                  placeholder="예: 컷트, 펌, 염색"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경력 (년)
                </label>
                <input
                  type="number"
                  defaultValue={editingDesigner?.experienceYears || ''}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처
                </label>
                <input
                  type="tel"
                  defaultValue={editingDesigner?.phone || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  defaultValue={editingDesigner?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={editingDesigner?.isActive ?? true}
                  className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  활성화
                </label>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleFormClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => handleFormSubmit({})}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
              >
                {editingDesigner ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};