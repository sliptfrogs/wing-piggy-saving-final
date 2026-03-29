// hooks/api/useApi.ts
import { useState, useCallback } from 'react';
import { toast } from './use-toast';

export function useApi<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options?: { showErrorToast?: boolean }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiCall();
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (options?.showErrorToast !== false) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, execute };
}
