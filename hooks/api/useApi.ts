// hooks/api/useApi.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from '../use-toast';

interface UseApiOptions<T> {
  /** Called when the operation succeeds */
  onSuccess?: (data: T) => void;
  /** Called when the operation fails */
  onError?: (error: Error) => void;
  /** Show a success toast automatically */
  showSuccessToast?: boolean;
  /** Show an error toast automatically */
  showErrorToast?: boolean;
  /** Custom message for the success toast */
  successMessage?: string;
}

export function useApi<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options: UseApiOptions<T> = {}
    ): Promise<T> => {
      const {
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
      } = options;

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);

        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage || 'Operation completed successfully',
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);

        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorObj.message,
            variant: 'destructive',
          });
        }

        onError?.(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, execute };
}
