// hooks/auth/usePermissions.ts
import { useSession } from './useSession';

export function usePermissions() {
  const { user } = useSession();
  const roles = user?.roles ?? [];

  const hasRole = (role: string) => roles.includes(role);
  const hasAnyRole = (roleList: string[]) =>
    roleList.some((r) => roles.includes(r));
  const isAdmin = () => roles.includes('ADMIN');

  return { roles, hasRole, hasAnyRole, isAdmin };
}
