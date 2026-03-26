'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

export function SessionRefresher({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === 'authenticated') {
      // User just logged in – refresh all data
      queryClient.invalidateQueries();
    } else if (status === 'unauthenticated') {
      // User logged out – clear cache to avoid stale data
      queryClient.clear();
    }
  }, [status, queryClient]);

  return <>{children}</>;
}
