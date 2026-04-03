import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './antd/dist/reset.css';
import { cn } from '@/lib/utils';
import Providers from './providers';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

// 🔥 Banking App Font Setup
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Piggy Saving — Your Trusted Saving Partner',
  description:
    'Track your savings goals, accept contributions, and reach your dreams faster.',
  icons: { icon: '/piggy-icon.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, mono.variable)}>
      <body className="bg-background text-foreground antialiased font-sans">
        <Providers>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
