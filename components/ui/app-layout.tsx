"use client";

import { ReactNode, useState } from 'react';
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
  LogOut,
} from 'lucide-react';
import { LogoutConfirmDialog } from './logout-confirm-dialog';

// Navigation items used in both mobile bottom nav and desktop sidebar
const mainNavItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: PiggyBank, label: 'Piggy', path: '/piggy' },
  { icon: ArrowLeftRight, label: 'Transfer', path: '/transfer' },
  { icon: User, label: 'Profile', path: '/profile' },
];

// Additional actions that appear in desktop sidebar (and mobile header)
const secondaryNavItems = [
  { icon: ScanLine, label: 'Scan', path: '/qr' },
  { icon: QrCode, label: 'Generate QR', path: '/qr-generate' },
  { icon: History, label: 'History', path: '/history' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);


  // Mock notifications – replace with real hook when ready
  // const { data: notifications } = useNotifications();
  // const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const unreadCount = 0; // placeholder

  const isActive = (path: string) => pathname === path;


  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ================== DESKTOP SIDEBAR ================== */}
      <aside className="hidden md:rounded-none md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-40 glass-strong border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="px-4 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground text-lg">
                Piggy
              </span>
            </div>
          </div>

          {/* Main navigation */}
          <nav className="flex-1 px-3 py-6  space-y-1">
            {mainNavItems.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive(path)
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}

            <div className="h-px bg-border my-4" />

            {/* Secondary actions (scan, qr, history) */}
            {secondaryNavItems.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive(path)
                    ? 'gradient-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>

          {/* Optional bottom section (user info / notifications) */}
          <div>
            <div className="px-3 py-4 border-t !rounded-none border-border">
              <button
                onClick={() => setDialogOpen(true)}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group"
              >
                <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>

            <LogoutConfirmDialog open={dialogOpen} onOpenChange={setDialogOpen} />
          </div>
        </div>
      </aside>

      {/* ================== MAIN CONTENT AREA ================== */}
      <div className="flex-1  flex flex-col md:ml-64 lg:ml-72 min-h-screen">
        {/* Header – visible on all screens */}
        <header className="sticky !rounded-none top-0 z-30 glass-strong px-4 py-3  flex items-center justify-between border-b border-border">
          <div className="flex  items-center gap-2 md:hidden">
            {/* Mobile logo (visible only on small screens) */}
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg">
              Piggy
            </span>
          </div>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Mobile-only actions: QR and History (hidden on desktop, as they're in sidebar) */}
            <div className="flex md:hidden">
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
            </div>

            {/* Notification bell – visible on all screens */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative rounded-lg hover:bg-secondary transition-colors"
            >
              {/* FIX: inner button replaced with div to avoid nesting */}
              <div className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content with animations */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ================== MOBILE BOTTOM NAVIGATION ================== */}
        <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border">
          <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto relative">
            {/* Left part of bottom nav: Home & Piggy */}
            {mainNavItems.slice(0, 2).map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${isActive(path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}

            {/* Center scan button (mobile only) */}
            <div className="relative -mt-7">
              <button
                onClick={() => router.push('/qr')}
                className={`w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-glow transition-transform active:scale-95 ${pathname === '/qr'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : ''
                  }`}
              >
                <ScanLine className="w-6 h-6 text-primary-foreground" />
              </button>
            </div>

            {/* Right part of bottom nav: Transfer & Profile */}
            {mainNavItems.slice(2).map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${isActive(path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Add bottom padding on mobile to prevent content from hiding behind nav */}
        <div className="block md:hidden h-20" />
      </div>
    </div>
  );
}
