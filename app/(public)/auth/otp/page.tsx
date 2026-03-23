"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, RefreshCw } from 'lucide-react';

// import PinInput from './PinInput';

import OTPInput from '@/components/ui/otp-input';
import { toast } from '@/app/hooks/use-toast';

interface OTPVerificationScreenProps {
    /** Called when OTP is successfully verified */
    onSuccess: () => void;
    /** Phone or email where the OTP was sent */
    destination?: string;
    /** Time in seconds before resend becomes available (default: 30) */
    resendCooldown?: number;
    /** Async function to verify the OTP – should return true if valid */
    verifyOtp: (otp: string) => Promise<boolean>;
    /** Async function to resend the OTP */
    resendOtp: () => Promise<void>;
}

export default function OTPVerificationScreen({
    onSuccess,
    destination,
    resendCooldown = 30,
    verifyOtp,
    resendOtp,
}: OTPVerificationScreenProps) {
    const [error, setError] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(resendCooldown);
    const [canResend, setCanResend] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    // Trigger resend manually
    const handleResend = async () => {
        if (!canResend || resending) return;

        setResending(true);
        try {
            await resendOtp();
            toast({
                title: 'Success',
                description: 'Code resent!',
            });

            setTimeLeft(resendCooldown);
            setCanResend(false);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to resend code. Try again later.',
                variant: 'destructive',
            });

        } finally {
            setResending(false);
        }
    };

    // Called when all 6 digits are entered
    const handleComplete = async (otp: string) => {
        if (verifying) return;

        setVerifying(true);
        setError(false);

        try {
            const valid = await verifyOtp(otp);
            if (valid) {
                toast({
                    title: 'Success',
                    description: 'Verification successful!',
                });
                onSuccess();
            } else {
                setError(true);
                toast({
                    title: 'Error',
                    description: 'Invalid code. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch {
            setError(true);
            toast({
                title: 'Error',
                description: 'Verification failed. Check your connection.',
                variant: 'destructive',
            });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 max-w-sm w-full"
            >
                {/* Animated icon */}
                <motion.div
                    className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center"
                    animate={error ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <KeyRound className="w-10 h-10 text-primary-foreground" />
                </motion.div>

                {/* Title and description */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-display font-bold text-foreground">
                        Verification Code
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {destination
                            ? `Enter the 6‑digit code sent to ${destination}`
                            : 'Enter the 6‑digit code sent to your device'}
                    </p>
                </div>

                {/* OTP input field */}
                <OTPInput
                    length={6}
                    onComplete={handleComplete}
                    error={error}
                    disabled={verifying}
                />

                {/* Error message */}
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive font-medium"
                    >
                        Invalid code. Please try again.
                    </motion.p>
                )}

                {/* Resend section */}
                <div className="flex flex-col items-center gap-2 mt-4">
                    <button
                        onClick={handleResend}
                        disabled={!canResend || resending}
                        className={`
              flex items-center gap-2 text-sm font-medium transition-colors
              ${canResend && !resending
                                ? 'text-primary hover:text-primary/80'
                                : 'text-muted-foreground cursor-not-allowed'
                            }
            `}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                        {canResend ? 'Resend code' : `Resend code in ${timeLeft}s`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
