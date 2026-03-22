"use client";

import AppLayout from "@/components/ui/app-layout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
//   const { user, loading: authLoading } = useAuth();
//   const { hasPin, isLocked, loading: pinLoading } = usePin();
  const router = useRouter();

//   useEffect(() => {
//     if (!authLoading && !user) {
//       router.replace("/login");
//     }
//   }, [user, authLoading, router]);

//   if (authLoading || pinLoading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   if (!user) return null; // will redirect

//   // PIN handling
//   if (!hasPin) return <PinSetupScreen />;
//   if (isLocked) return <PinLockScreen />;

  // ✅ Wrap the children with AppLayout
  return <AppLayout>{children}</AppLayout>;
}
