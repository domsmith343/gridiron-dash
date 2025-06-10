import { useState, useEffect } from 'react';
import type { ApiResponse, ApiError, ApiStatus } from '../types/api';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  status: ApiStatus;
  execute: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(
  url: string | (() => string), 
  options: RequestInit & UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [status, setStatus] = useState<ApiStatus>('idle');

  const { immediate = true, onSuccess, onError, ...fetchOptions } = options;

  const execute = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      setError(null);

      const finalUrl = typeof url === 'function' ? url() : url;
      const response = await fetch(finalUrl, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code
        } as ApiError;
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success && result.error) {
        throw {
          message: result.error,
          code: 'API_ERROR'
        } as ApiError;
      }

      setData(result.data);
      setStatus('success');
      onSuccess?.(result.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      setStatus('error');
      onError?.(apiError);
      console.error('API Error:', apiError);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setStatus('idle');
    setLoading(false);
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [url]);

  return { data, loading, error, status, execute, reset };
}
