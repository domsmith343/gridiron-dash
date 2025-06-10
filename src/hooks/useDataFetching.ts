import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useUtilities';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { validateApiResponse, typeGuards } from '../utils/validation';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface DataFetchingOptions<T> {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  validator?: (data: unknown) => data is T;
  dependencies?: any[];
  enabled?: boolean;
}

export interface DataFetchingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
}

export interface DataFetchingActions {
  refetch: () => Promise<void>;
  invalidateCache: () => void;
  clearError: () => void;
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Enhanced data fetching hook with caching, retry logic, and validation
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: DataFetchingOptions<T> = {}
): DataFetchingState<T> & DataFetchingActions {
  const {
    cacheKey,
    cacheDuration = DEFAULT_CACHE_DURATION,
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
    retryDelay = DEFAULT_RETRY_DELAY,
    validator,
    dependencies = [],
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const [cachedData, setCachedData] = useLocalStorage<Record<string, CacheEntry<T>>>(
    STORAGE_KEYS.CACHED_DATA,
    {}
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get cached data
  const getCachedData = useCallback((key: string): T | null => {
    if (!cacheKey) return null;
    
    const cached = cachedData[key];
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.expiresAt) {
      // Cache expired, remove it
      const newCache = { ...cachedData };
      delete newCache[key];
      setCachedData(newCache);
      return null;
    }
    
    return cached.data;
  }, [cachedData, setCachedData, cacheKey]);

  // Set cached data
  const setCacheData = useCallback((key: string, newData: T) => {
    if (!cacheKey) return;
    
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data: newData,
      timestamp: now,
      expiresAt: now + cacheDuration,
    };
    
    setCachedData(prev => ({
      ...prev,
      [key]: entry,
    }));
  }, [cacheKey, cacheDuration, setCachedData]);

  // Check if cached data is stale
  const checkStaleData = useCallback((key: string): boolean => {
    if (!cacheKey) return false;
    
    const cached = cachedData[key];
    if (!cached) return false;
    
    const now = Date.now();
    const staleThreshold = cached.timestamp + (cacheDuration * 0.8); // 80% of cache duration
    
    return now > staleThreshold;
  }, [cachedData, cacheKey, cacheDuration]);

  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(
    async (fn: () => Promise<T>, attempt: number): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        if (attempt >= retryAttempts) {
          throw err;
        }
        
        const delay = retryDelay * Math.pow(2, attempt);
        
        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await retryWithBackoff(fn, attempt + 1);
              resolve(result);
            } catch (retryErr) {
              reject(retryErr);
            }
          }, delay);
        });
      }
    },
    [retryAttempts, retryDelay]
  );

  // Main fetch function
  const fetchData = useCallback(async (useCache = true): Promise<void> => {
    if (!enabled) return;

    // Check cache first
    if (useCache && cacheKey) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached);
        setIsStale(checkStaleData(cacheKey));
        setLastUpdated(cachedData[cacheKey]?.timestamp || null);
        setError(null);
        
        // If not stale, return early
        if (!checkStaleData(cacheKey)) {
          return;
        }
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const wrappedFetchFn = async (): Promise<T> => {
        const signal = abortControllerRef.current?.signal;
        
        // Add timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Request timeout'));
          }, API_CONFIG.TIMEOUT);
        });

        const fetchPromise = Promise.resolve(fetchFn());
        
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Validate response if validator provided
        if (validator) {
          const validatedResult = validateApiResponse(result, validator);
          if (!validatedResult) {
            throw new Error('Invalid response format');
          }
          return validatedResult;
        }
        
        return result;
      };

      const result = await retryWithBackoff(wrappedFetchFn, 0);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      setIsStale(false);
      setLastUpdated(Date.now());
      
      // Cache the result
      if (cacheKey) {
        setCacheData(cacheKey, result);
      }
      
    } catch (err) {
      // Don't set error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      
      // Try to use stale cache data on error
      if (cacheKey) {
        const cached = getCachedData(cacheKey);
        if (cached && !data) {
          setData(cached);
          setIsStale(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    cacheKey,
    getCachedData,
    checkStaleData,
    cachedData,
    fetchFn,
    validator,
    retryWithBackoff,
    setCacheData,
    data,
  ]);

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    await fetchData(false); // Skip cache
  }, [fetchData]);

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    if (!cacheKey) return;
    
    const newCache = { ...cachedData };
    delete newCache[cacheKey];
    setCachedData(newCache);
    setIsStale(true);
  }, [cacheKey, cachedData, setCachedData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Effect to fetch data
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [enabled, ...dependencies]);

  // Background refresh for stale data
  useEffect(() => {
    if (isStale && enabled && !isLoading) {
      const timer = setTimeout(() => {
        fetchData();
      }, 1000); // Refresh stale data after 1 second

      return () => clearTimeout(timer);
    }
  }, [isStale, enabled, isLoading, fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    lastUpdated,
    refetch,
    invalidateCache,
    clearError,
  };
}

/**
 * Hook for fetching multiple data sources concurrently
 */
export function useConcurrentDataFetching<T extends Record<string, any>>(
  fetchers: {
    [K in keyof T]: {
      fetchFn: () => Promise<T[K]>;
      options?: DataFetchingOptions<T[K]>;
    };
  }
): {
  [K in keyof T]: DataFetchingState<T[K]> & DataFetchingActions;
} & {
  isAllLoading: boolean;
  hasAnyError: boolean;
  refetchAll: () => Promise<void>;
} {
  const results = {} as {
    [K in keyof T]: DataFetchingState<T[K]> & DataFetchingActions;
  };

  // Create individual hooks for each fetcher
  for (const [key, { fetchFn, options }] of Object.entries(fetchers)) {
    results[key as keyof T] = useDataFetching(fetchFn, options);
  }

  const isAllLoading = Object.values(results).some((result: any) => result.isLoading);
  const hasAnyError = Object.values(results).some((result: any) => result.error);

  const refetchAll = useCallback(async () => {
    const promises = Object.values(results).map((result: any) => result.refetch());
    await Promise.all(promises);
  }, [results]);

  return {
    ...results,
    isAllLoading,
    hasAnyError,
    refetchAll,
  };
}
