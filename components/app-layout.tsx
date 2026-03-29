'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  PiggyBank,
  ArrowLeftRight,
  User,
  Bell,
  ScanLine,
  QrCode,
  History,
} from 'lucide-react';

// Mock notifications – replace with your real hook later
const useNotifications = () => ({
  data: [] as { read: boolean }[],
});

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' }, // Next.js home route
  { icon: PiggyBank, label: 'Piggy', path: '/piggy' },
  // center scan button is rendered separately
  { icon: ArrowLeftRight, label: 'Transfer', path: '/transfer' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: notifications } = useNotifications();
  const unreadCount =
    notifications?.filter((n: { read: boolean }) => !n.read).length || 0;

  const leftNav = navItems.slice(0, 2);
  const rightNav = navItems.slice(2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-lg">
            Piggy
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/qr-generate')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <QrCode className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => router.push('/history')}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <History className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // animate on route change
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border">
        <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto relative">
          {/* Left nav items */}
          {leftNav.map(({ icon: Icon, label, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}

          {/* Center Scan Button */}
          <div className="relative -mt-7">
            <button
              onClick={() => router.push('/qr')}
              className={`w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow transition-transform active:scale-95 ${
                pathname === '/qr'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              <ScanLine className="w-6 h-6 text-primary-foreground" />
            </button>
          </div>

          {/* Right nav items */}
          {rightNav.map(({ icon: Icon, label, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
