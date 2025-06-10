import { useMemo, useCallback, useRef } from 'react';

/**
 * Custom hook for expensive calculations with memoization
 */
export function useExpensiveCalculation<T>(
  fn: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(fn, dependencies);
}

/**
 * Custom hook for stable callback references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * Custom hook for debounced callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay, ...dependencies]
  );
}

/**
 * Custom hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  dependencies: React.DependencyList
): T {
  const inThrottle = useRef(false);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    }) as T,
    [callback, limit, ...dependencies]
  );
}

/**
 * Custom hook for managing previous values
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useMemo(() => {
    const previousValue = ref.current;
    ref.current = value;
    return previousValue;
  }, [value]);
  
  return ref.current;
}

/**
 * Custom hook for lazy initialization
 */
export function useLazyRef<T>(init: () => T): React.MutableRefObject<T> {
  const ref = useRef<T>();
  
  if (ref.current === undefined) {
    ref.current = init();
  }
  
  return ref as React.MutableRefObject<T>;
}
