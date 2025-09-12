import { useState, useEffect } from 'react';
import { Designer, designerApi } from '~/entities/designer';

export const useDesigners = () => {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await designerApi.getDesigners();
        setDesigners(data.filter(designer => designer.isActive));
      } catch (error) {
        setError('디자이너 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigners();
  }, []);

  const createDesigner = async (designerData: any) => {
    try {
      setIsLoading(true);
      const newDesigner = await designerApi.createDesigner(designerData);
      setDesigners(prev => [...prev, newDesigner]);
      return newDesigner;
    } catch (error) {
      setError('디자이너 생성에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDesigner = async (id: string, designerData: any) => {
    try {
      setIsLoading(true);
      const updatedDesigner = await designerApi.updateDesigner(id, designerData);
      setDesigners(prev => prev.map(designer => 
        designer.id === id ? updatedDesigner : designer
      ));
      return updatedDesigner;
    } catch (error) {
      setError('디자이너 수정에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDesigner = async (id: string) => {
    try {
      setIsLoading(true);
      await designerApi.deleteDesigner(id);
      setDesigners(prev => prev.filter(designer => designer.id !== id));
    } catch (error) {
      setError('디자이너 삭제에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    designers,
    isLoading,
    error,
    createDesigner,
    updateDesigner,
    deleteDesigner,
  };
};