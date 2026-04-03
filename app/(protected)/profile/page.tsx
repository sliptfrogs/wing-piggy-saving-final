'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Calendar } from 'lucide-react';
import { LogoutConfirmDialog } from '@/components/ui/logout-confirm-dialog';
import { useUserRole } from '@/hooks/api/useUserRole';
import { useMainAccount } from '@/hooks/api/useAccount';
import Loading from '@/components/ui/loading-custom';
import ErrorPage from '@/components/ui/error-custom';

// Mock profile data (replace with real data later)
const mockProfile = {
  full_name: 'Alex Johnson',
  phone: '+855 12 345 678',
  email: 'alex@example.com',
  joined: 'January 2024',
  avatar_initials: 'AJ',
};

export default function Profile() {
  const { isAdmin } = useUserRole();
  const { data: mainAccount, isLoading, error, isError } = useMainAccount();
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ErrorPage error={error} reset={() => window.location.reload()} />;
  }

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-md mx-auto"
      >
        {/* Identity card */}
        <div className="glass rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="text-3xl font-bold text-primary-foreground">
              {mockProfile.avatar_initials}
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">
            {mockProfile.full_name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mockProfile.email}
          </p>
          <p className="text-sm text-muted-foreground">{mockProfile.phone}</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" /> Joined {mockProfile.joined}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 glass rounded-2xl p-4 space-y-2">
          {isAdmin && (
            <Button
              variant="glass"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/admin')}
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </motion.div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </div>
  );
}
