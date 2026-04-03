import { useSession } from 'next-auth/react';

export const useUserRole = () => {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';

  const role = session?.user?.roles || [];

  const isAdmin = role.includes('ADMIN');
  const isUser = role.includes('USER');

  return {
    role,
    isAdmin,
    isUser,
    isLoading,
    isAuthenticated: status === 'authenticated',
  };
};
