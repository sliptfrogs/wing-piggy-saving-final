// app/(auth)/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/app/hooks/use-toast';
import { signIn } from 'next-auth/react';


// Define Zod schema for login
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {

        // Use NextAuth signIn with credentials
        const result = await signIn("credentials", {
            redirect: false, // handle redirects manually
            email: data.email,
            password: data.password,
        });

        if (result?.ok) {
            toast({
                title: "Welcome back!",
                description: "Login successful.",
            });
            router.push("/dashboard"); // redirect after login
        } else {
            toast({
                title: "Login failed",
                description: result?.error || "Invalid email or password.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
                    <p className="text-muted-foreground mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                {...register('email')}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="password"
                                type="password"
                                {...register('password')}
                                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Link to Register Page */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don not have an account?{' '}
                        <Link
                            href="/auth/register"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
