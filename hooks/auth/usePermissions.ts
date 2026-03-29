// hooks/auth/usePermissions.ts
'use client';

import { useSession } from 'next-auth/react';

export function usePermissions() {
  const { data: session, status } = useSession();
  const userRoles = session?.user?.roles ?? [];

  /**
   * Check if the user has a specific role.
   */
  const hasRole = (role: string) => userRoles.includes(role);

  /**
   * Check if the user has at least one of the given roles.
   */
  const hasAnyRole = (roles: string[]) =>
    roles.some((r) => userRoles.includes(r));

  /**
   * Check if the user has all of the given roles.
   */
  const hasAllRoles = (roles: string[]) =>
    roles.every((r) => userRoles.includes(r));

  /**
   * Shortcut for admin role.
   */
  const isAdmin = () => userRoles.includes('ADMIN');

  /**
   * Shortcut for regular user role.
   */
  const isUser = () => userRoles.includes('USER');

  return {
    roles: userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isUser,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
