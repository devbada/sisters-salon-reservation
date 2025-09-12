import React, { useState } from 'react';
import { DesignerTableWidget } from '~/widgets/designer-table';
import { DesignerForm } from '~/features/designer-management/ui/DesignerForm';
import { useDesigners } from '~/features/designer-management';
import type { Designer, DesignerFormData } from '~/entities/designer';

export const DesignersPage: React.FC = () => {
  const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const { createDesigner, updateDesigner, deleteDesigner, isLoading } = useDesigners();
  
  const availableServices = ['컷', '컷+염색', '펌', '트리트먼트', '스타일링', '케어'];

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

  const handleFormSubmit = async (formData: DesignerFormData) => {
    try {
      if (editingDesigner) {
        // 수정 모드
        const updatedDesigner = await updateDesigner(editingDesigner.id, formData);
        console.log('디자이너 정보 수정 완료:', updatedDesigner);
      } else {
        // 생성 모드
        const newDesigner = await createDesigner(formData);
        console.log('새 디자이너 등록 완료:', newDesigner);
      }
      handleFormClose();
    } catch (error) {
      console.error('디자이너 정보 처리 실패:', error);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingDesigner ? '디자이너 정보 수정' : '새 디자이너 등록'}
            </h3>
            <DesignerForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              initialData={editingDesigner || undefined}
              availableServices={availableServices}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};