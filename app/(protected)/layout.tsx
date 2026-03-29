'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/ui/app-layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.replace('/login');
    }
  }, [session, status, router]);

  // If not authenticated, don't render anything (redirect will happen)
  if (!session) return null;

  // PIN handling

  // Authenticated and PIN verified – render the layout with children
  return <AppLayout>{children}</AppLayout>;
}
