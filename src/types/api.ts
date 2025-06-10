export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
