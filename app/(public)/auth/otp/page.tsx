'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import OTPVerificationScreen from './otp-verification-screen';
import { Button, Result } from 'antd';

export default function OtpPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const router = useRouter();

    // If no email, show error (should not happen normally)
    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Result
                    status="warning"
                    title="Missing Information"
                    subTitle="No email provided. Please go back and start the registration process again."
                    extra={
                        <Button type="primary" onClick={() => router.push('/auth/sign-up')}>
                            Go to Sign Up
                        </Button>
                    }
                />
            </div>
        )
    }

    // Verify OTP using NextAuth's otp provider
    const verifyOtp = async (otp: string) => {
        const result = await signIn('otp', {
            email,
            otpCode: otp,
            redirect: false,
        });
        return !result?.error; // return true if successful
    };

    // Resend OTP via backend
    const resendOtp = async () => {
        const res = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to resend');
        }
    };

    const handleSuccess = () => {
        router.push('/dashboard');
    };

    return (
        <OTPVerificationScreen
            onSuccess={handleSuccess}
            destination={email}
            verifyOtp={verifyOtp}
            resendOtp={resendOtp}
        />
    );
}
