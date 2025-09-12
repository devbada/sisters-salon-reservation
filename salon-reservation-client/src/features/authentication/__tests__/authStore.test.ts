import { useAuthStore } from '../model/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // 각 테스트 전에 store 초기화
    useAuthStore.getState().reset();
    localStorage.clear();
  });

  describe('초기 상태', () => {
    it('초기값이 올바르게 설정되어야 한다', () => {
      const store = useAuthStore.getState();
      
      expect(store.user).toBe(null);
      expect(store.token).toBe(null); // localStorage mock에서 null 반환
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });
  });

  describe('setUser', () => {
    it('사용자 정보를 설정하면 인증 상태가 true가 되어야 한다', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'admin' as const,
        isActive: true
      };

      useAuthStore.getState().setUser(user);
      
      const store = useAuthStore.getState();
      expect(store.user).toEqual(user);
      expect(store.isAuthenticated).toBe(true);
    });

    it('사용자 정보를 null로 설정하면 인증 상태가 false가 되어야 한다', () => {
      useAuthStore.getState().setUser(null);
      
      const store = useAuthStore.getState();
      expect(store.user).toBe(null);
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('setToken', () => {
    it('토큰을 설정하면 localStorage에 저장되어야 한다', () => {
      const token = 'test-jwt-token';
      
      useAuthStore.getState().setToken(token);
      
      const store = useAuthStore.getState();
      expect(store.token).toBe(token);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', token);
    });

    it('토큰을 null로 설정하면 localStorage에서 제거되어야 한다', () => {
      useAuthStore.getState().setToken(null);
      
      const store = useAuthStore.getState();
      expect(store.token).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('setLoading', () => {
    it('로딩 상태를 설정할 수 있어야 한다', () => {
      useAuthStore.getState().setLoading(true);
      
      const store = useAuthStore.getState();
      expect(store.isLoading).toBe(true);
      
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('에러 메시지를 설정할 수 있어야 한다', () => {
      const errorMessage = '로그인 실패';
      
      useAuthStore.getState().setError(errorMessage);
      
      const store = useAuthStore.getState();
      expect(store.error).toBe(errorMessage);
    });

    it('에러를 null로 설정하여 초기화할 수 있어야 한다', () => {
      useAuthStore.getState().setError(null);
      
      const store = useAuthStore.getState();
      expect(store.error).toBe(null);
    });
  });

  describe('logout', () => {
    it('로그아웃 시 토큰이 제거되고 상태가 초기화되어야 한다', () => {
      // 먼저 로그인 상태로 설정
      const user = {
        id: '1',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'admin' as const,
        isActive: true
      };
      
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken('test-token');
      
      // 로그아웃 실행
      useAuthStore.getState().logout();
      
      const store = useAuthStore.getState();
      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('reset', () => {
    it('reset 시 모든 상태가 초기화되어야 한다', () => {
      // 상태 설정
      const user = {
        id: '1',
        email: 'test@example.com',
        name: '테스트 사용자',
        role: 'admin' as const,
        isActive: true
      };
      
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken('test-token');
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError('에러 메시지');
      
      // 리셋 실행
      useAuthStore.getState().reset();
      
      const store = useAuthStore.getState();
      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });
  });
});