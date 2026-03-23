// hooks/auth/useSession.ts
'use client';
import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  return {
    session,
    user: session?.user,
    accessToken: session?.accessToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    update,
  };
}
