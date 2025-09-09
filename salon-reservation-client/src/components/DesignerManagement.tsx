import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DesignerForm, { DesignerData } from './DesignerForm';
import DesignerTable from './DesignerTable';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const DesignerManagement: React.FC = () => {
  const [designers, setDesigners] = useState<DesignerData[]>([]);
  const [editingDesigner, setEditingDesigner] = useState<DesignerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Toast message functions
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Function to fetch designers
  const fetchDesigners = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/designers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDesigners(response.data);
    } catch (error: any) {
      console.error('Error fetching designers:', error);
      addToast(
        error.response?.data?.error || 'Failed to fetch designers', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial data fetch
  useEffect(() => {
    fetchDesigners();
  }, [fetchDesigners]);

  // Handle creating new designer
  const handleCreateDesigner = async (formData: DesignerData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/designers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDesigners(prev => [...prev, response.data]);
      setShowForm(false);
      addToast(`${formData.name} 디자이너가 성공적으로 등록되었습니다!`, 'success');
    } catch (error: any) {
      console.error('Error creating designer:', error);
      addToast(
        error.response?.data?.details?.[0] || 
        error.response?.data?.error || 
        'Failed to create designer', 
        'error'
      );
    }
  };

  // Handle updating designer
  const handleUpdateDesigner = async (formData: DesignerData) => {
    if (!editingDesigner?._id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/designers/${editingDesigner._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDesigners(prev => 
        prev.map(designer => 
          designer._id === editingDesigner._id ? response.data : designer
        )
      );
      
      setEditingDesigner(null);
      addToast(`${formData.name} 디자이너 정보가 성공적으로 수정되었습니다!`, 'success');
    } catch (error: any) {
      console.error('Error updating designer:', error);
      addToast(
        error.response?.data?.details?.[0] || 
        error.response?.data?.error || 
        'Failed to update designer', 
        'error'
      );
    }
  };

  // Handle deleting designer (logical delete)
  const handleDeleteDesigner = async (designer: DesignerData) => {
    if (!designer._id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/designers/${designer._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDesigners(prev => prev.filter(d => d._id !== designer._id));
      addToast(`${designer.name} 디자이너가 성공적으로 삭제되었습니다.`, 'success');
    } catch (error: any) {
      console.error('Error deleting designer:', error);
      addToast(
        error.response?.data?.error || 'Failed to delete designer', 
        'error'
      );
    }
  };

  // Handle editing designer
  const handleEditDesigner = (designer: DesignerData) => {
    setEditingDesigner(designer);
    setShowForm(true);
  };

  // Handle form submission
  const handleFormSubmit = (formData: DesignerData) => {
    if (editingDesigner) {
      handleUpdateDesigner(formData);
    } else {
      handleCreateDesigner(formData);
    }
  };

  // Handle canceling form
  const handleCancelForm = () => {
    setEditingDesigner(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Toast Messages */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-500 transform ${
              toast.type === 'success'
                ? 'bg-green-100/90 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-100/90 border-red-200 text-red-800'
                : toast.type === 'warning'
                ? 'bg-yellow-100/90 border-yellow-200 text-yellow-800'
                : 'bg-blue-100/90 border-blue-200 text-blue-800'
            }`}
          >
            <span className="mr-2">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <span className="flex-grow">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-lg hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👨‍🎨 헤어 디자이너 관리</h1>
          <p className="text-gray-600 mt-1">살롱의 헤어 디자이너를 관리하세요</p>
        </div>
        
        <button
          onClick={() => {
            setEditingDesigner(null);
            setShowForm(!showForm);
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
        >
          {showForm ? '📋 목록으로' : '➕ 새 디자이너 등록'}
        </button>
      </div>

      {/* Form or Table */}
      {showForm ? (
        <DesignerForm
          onSubmit={handleFormSubmit}
          initialData={editingDesigner || undefined}
          onCancel={handleCancelForm}
          isEditing={!!editingDesigner}
        />
      ) : (
        <DesignerTable
          designers={designers}
          onEdit={handleEditDesigner}
          onDelete={handleDeleteDesigner}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DesignerManagement;