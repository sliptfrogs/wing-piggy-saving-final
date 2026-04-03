// app/unauthorized/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-8 md:p-12 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to view this page. Please contact an
          administrator if you believe this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button
            variant="hero"
            onClick={() => router.push('/dashboard')}
            className="gap-2"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
