import { create } from 'zustand';

export type PageType = 'reservations' | 'customers' | 'designers' | 'business-hours' | 'statistics';

interface PageState {
  currentPage: PageType;
  previousPage: PageType | null;
  isLoading: boolean;
}

interface PageActions {
  setCurrentPage: (page: PageType) => void;
  navigateToPage: (page: PageType) => void;
  goBack: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: PageState = {
  currentPage: 'reservations',
  previousPage: null,
  isLoading: false,
};

export const usePageStore = create<PageState & PageActions>((set, get) => ({
  ...initialState,

  setCurrentPage: (page) => {
    const { currentPage } = get();
    set({
      previousPage: currentPage,
      currentPage: page,
    });
  },

  navigateToPage: (page) => {
    const { setCurrentPage, setLoading } = get();
    setLoading(true);
    
    // 페이지 전환 애니메이션이나 데이터 로딩을 위한 약간의 지연
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 100);
  },

  goBack: () => {
    const { previousPage, setCurrentPage } = get();
    if (previousPage) {
      setCurrentPage(previousPage);
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));