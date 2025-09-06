import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // 시스템 테마 감지
  const getSystemTheme = (): EffectiveTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 실제 적용될 테마 계산
  const calculateEffectiveTheme = (currentTheme: Theme): EffectiveTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme as EffectiveTheme;
  };

  // 테마 변경 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // DOM에 테마 클래스 적용
  useEffect(() => {
    const effective = calculateEffectiveTheme(theme);
    setEffectiveTheme(effective);
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const effective = getSystemTheme();
        setEffectiveTheme(effective);
        
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(effective);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // 초기 테마 설정
  useEffect(() => {
    const effective = calculateEffectiveTheme(theme);
    setEffectiveTheme(effective);
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}