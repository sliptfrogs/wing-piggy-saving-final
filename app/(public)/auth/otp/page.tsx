import { Suspense } from 'react';
import OtpClient from './otp-client';

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OtpClient />
    </Suspense>
  );
}
