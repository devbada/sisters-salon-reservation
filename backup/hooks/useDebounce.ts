import { useState, useEffect } from 'react';

/**
 * 디바운싱 커스텀 훅
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 지연 시간 후에 값을 업데이트하는 핸들러
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 컴포넌트가 언마운트되거나 value나 delay가 변경되면 타임아웃을 클리어
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}