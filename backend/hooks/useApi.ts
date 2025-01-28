import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ApiError } from '../types/mentorship';

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>
): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(
        error.response?.data?.message || 
        'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, loading, error, execute };
} 