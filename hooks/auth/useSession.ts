// hooks/auth/useSession.ts
'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

/**
 * Extended session type with our custom fields.
 */
interface ExtendedSession {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    roles?: string[];
  };
  accessToken?: string;
  refreshToken?: string;
  expires?: string;
  error?: string;
}

/**
 * Hook that returns the current session and authentication state.
 */
export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  return {
    session: session as ExtendedSession | null,
    user: session?.user,
    accessToken: (session as ExtendedSession)?.accessToken,
    refreshToken: (session as ExtendedSession)?.refreshToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    update, // allows manual session update if needed
  };
}
