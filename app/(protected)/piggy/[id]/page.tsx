"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    ArrowLeft, QrCode, PiggyBank, Hammer, ArrowUpRight,
    Lock, EyeOff, AlertTriangle, Info, TrendingUp, Calendar, Target, ChevronRight,
    Sparkles, Clock, Gift, Shield, Zap, DollarSign, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ── Static mock ──────────────────────────────────────────────────────────────

const mockGoal = {
    id: '2',
    name: 'Vacation Fund',
    target_amount: 3000,
    status: 'active' as 'active' | 'completed' | 'broken',
    hide_balance: false,
    lock_period_days: 90,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    accounts: [{ id: 'acc2', balance: 1250.00 }],
};

const mockMainAccountBalance = 1250.50;

const mockInterestHistory = [
    { id: 'i1', amount: 2.50, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: 'i2', amount: 2.48, created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'i3', amount: 2.45, created_at: new Date(Date.now() - 21 * 86400000).toISOString() },
    { id: 'i4', amount: 2.40, created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function PiggyDetail() {
    const router = useRouter();
    const [showQR, setShowQR] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [adding, setAdding] = useState(false);
    const [breaking, setBreaking] = useState(false);

    const goal = mockGoal;
    const account = goal.accounts?.[0];
    const balance = account?.balance || 0;
    const isHidden = goal.hide_balance && goal.status === 'active';

    const lockExpiry = goal.lock_period_days
        ? new Date(new Date(goal.created_at).getTime() + goal.lock_period_days * 86400000)
        : null;
    const isLockExpired = lockExpiry ? new Date() > lockExpiry : true;

    const daysRemaining = lockExpiry
        ? Math.max(0, Math.ceil((lockExpiry.getTime() - Date.now()) / 86400000))
        : 0;

    let progress = 0;
    if (goal.lock_period_days) {
        const elapsed = Date.now() - new Date(goal.created_at).getTime();
        progress = Math.min((elapsed / (goal.lock_period_days * 86400000)) * 100, 100);
    } else {
        progress = goal.target_amount > 0 ? Math.min((balance / goal.target_amount) * 100, 100) : 0;
    }

    const penaltyPct = 5;
    const penaltyAmount = balance * (penaltyPct / 100);
    const returnAfterPenalty = balance - penaltyAmount;

    const totalInterest = mockInterestHistory.reduce((s, i) => s + i.amount, 0);
    const isNearComplete = progress >= 80;
    const isHalfway = progress >= 50 && progress < 80;

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        setTimeout(() => { setAddAmount(''); setAdding(false); }, 800);
    };

    const executeBreak = () => {
        setBreaking(true);
        setTimeout(() => { setBreaking(false); router.push('/piggy'); }, 800);
    };

    const qrPayload = `piggy:${goal.id}:${goal.name}`;

    const quickAddAmounts = [25, 50, 100, 250];

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Back button */}
            <button
                onClick={() => router.push('/piggy')}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Goals
            </button>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >

                {/* ── LEFT COLUMN: hero card + actions ── */}
                <div className="space-y-4 lg:col-span-1">

                    {/* Hero card */}
                    <div className="relative overflow-hidden glass rounded-2xl p-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />

                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                                isNearComplete ? "gradient-primary" : "gradient-accent"
                            )}>
                                <PiggyBank className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-display font-bold text-foreground">{goal.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn(
                                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                                        goal.status === 'active' ? 'bg-primary/10 text-primary' :
                                            goal.status === 'completed' ? 'bg-success/10 text-success' :
                                                'bg-destructive/10 text-destructive'
                                    )}>
                                        {goal.status === 'active' && <Zap className="w-2.5 h-2.5" />}
                                        {goal.status}
                                    </span>
                                    {goal.lock_period_days && !isLockExpired && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                                            <Lock className="w-2.5 h-2.5" /> Locked
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="mb-5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Balance</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-display font-bold text-foreground">
                                    {isHidden ? '••••••' : formatCurrency(balance)}
                                </span>
                                {isHidden && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="mb-1.5 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                                <Info className="w-3 h-3" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent side="top" className="max-w-[240px] text-center p-3">
                                            <p className="text-sm font-medium mb-1">Balance is hidden</p>
                                            <p className="text-xs text-muted-foreground">Visible once the piggy is broken or completed.</p>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {isHidden ? 'of ••••••' : `of ${formatCurrency(goal.target_amount)}`}
                            </p>
                        </div>

                        {/* Progress bar with animation */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className={cn(
                                    "font-semibold",
                                    isNearComplete ? "text-primary" : isHalfway ? "text-accent" : ""
                                )}>
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={cn(
                                        "h-full rounded-full",
                                        isNearComplete ? "bg-gradient-to-r from-primary to-accent" : "gradient-primary"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Lock status */}
                        {goal.lock_period_days && !isLockExpired && (
                            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-foreground">Locked until {lockExpiry?.toLocaleDateString()}</p>
                                    <p className="text-[10px] text-muted-foreground">{daysRemaining} days remaining</p>
                                </div>
                                <Shield className="w-4 h-4 text-amber-500/60" />
                            </div>
                        )}

                        {isLockExpired && goal.lock_period_days && (
                            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-success/5 border border-success/20">
                                <CheckCircle2 className="w-4 h-4 text-success" />
                                <p className="text-xs font-medium text-success">Lock period completed! You can now break without penalty.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick add section */}
                    {goal.status === 'active' && (
                        <form onSubmit={handleQuickAdd} className="glass rounded-2xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <Label className="text-sm font-semibold text-foreground">Add Money</Label>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground select-none">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    required
                                    min="1"
                                    step="0.01"
                                    className="pl-8 bg-secondary border-border text-foreground text-2xl  font-bold h-14 tabular-nums
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                        [-moz-appearance:textfield] focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex gap-2  justify-center flex-wrap">
                                {quickAddAmounts.map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setAddAmount(String(amount))}
                                        className="px-4 py-2  rounded-lg  font-medium bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Available: {formatCurrency(mockMainAccountBalance)}
                            </p>
                        </form>
                    )}

                    {/* Action buttons */}
                    {goal.status === 'active' && (
                        <div className="flex flex-col gap-3">
                            <Button
                                variant="glass"
                                className="w-full gap-2"
                                onClick={() => setShowQR(!showQR)}
                            >
                                <QrCode className="w-4 h-4" />
                                {showQR ? 'Hide QR Code' : 'Show QR Code for Contributions'}
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                                        disabled={breaking}
                                    >
                                        <Hammer className="w-4 h-4" />
                                        {isLockExpired ? 'Break Piggy' : 'Force Break (Penalty Applied)'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            {!isLockExpired && <AlertTriangle className="w-5 h-5 text-destructive" />}
                                            Break {goal.name}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="space-y-3">
                                                {!isLockExpired ? (
                                                    <>
                                                        <p>
                                                            Still locked until{' '}
                                                            <span className="font-semibold text-foreground">{lockExpiry?.toLocaleDateString()}</span>
                                                            {' '}({daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining).
                                                        </p>
                                                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>Current balance</span>
                                                                <span className="font-semibold text-foreground">{isHidden ? '••••••' : formatCurrency(balance)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-destructive">
                                                                <span>Penalty ({penaltyPct}%)</span>
                                                                <span className="font-semibold">{isHidden ? '••••••' : `-${formatCurrency(penaltyAmount)}`}</span>
                                                            </div>
                                                            <div className="border-t border-destructive/20 pt-1 flex justify-between font-semibold">
                                                                <span>You wll receive</span>
                                                                <span className="text-foreground">{isHidden ? '••••••' : formatCurrency(returnAfterPenalty)}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p>
                                                        {isHidden ? 'Your full balance will be returned.' :
                                                            <>You wll receive <span className="font-semibold text-foreground">{formatCurrency(balance)}</span> back to your main account.</>}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={executeBreak} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {breaking ? 'Breaking...' : (isLockExpired ? 'Break Piggy' : 'Force Break & Pay Penalty')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}

                    {/* QR code panel */}
                    {showQR && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-2xl p-6 flex flex-col items-center gap-3"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <p className="text-sm font-medium text-foreground">Scan to Contribute</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-lg">
                                <QRCodeSVG value={qrPayload} size={180} />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                QR for <span className="font-semibold text-foreground">{goal.name}</span>
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                Expires in 10 minutes
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: stats + interest history ── */}
                <div className="space-y-4 lg:col-span-2">

                    {/* Stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                icon: Target,
                                label: 'Target',
                                value: isHidden ? '••••••' : formatCurrency(goal.target_amount),
                                sub: isHidden ? '' : `${formatCurrency(goal.target_amount - balance)} remaining`,
                                color: 'bg-primary/10 text-primary',
                            },
                            {
                                icon: Clock,
                                label: goal.lock_period_days ? 'Lock Period' : 'Created',
                                value: goal.lock_period_days ? `${goal.lock_period_days} days` : new Date(goal.created_at).toLocaleDateString(),
                                sub: goal.lock_period_days && !isLockExpired ? `${daysRemaining}d left` : '',
                                color: 'bg-amber-500/10 text-amber-500',
                            },
                            {
                                icon: Gift,
                                label: 'Interest Earned',
                                value: isHidden ? '••••••' : formatCurrency(totalInterest),
                                sub: `${mockInterestHistory.length} payments`,
                                color: 'bg-emerald-500/10 text-emerald-500',
                            },
                        ].map(({ icon: Icon, label, value, sub, color }) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl p-5 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                                </div>
                                <p className="text-2xl font-display font-bold text-foreground">{value}</p>
                                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                            </motion.div>
                        ))}
                    </div>

                    {/* Interest history table */}
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <h3 className="font-display font-semibold text-foreground">Interest History</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">Recent interest payments credited to your piggy</p>
                            </div>
                            <span className="text-xs font-medium text-primary">{mockInterestHistory.length} payments</span>
                        </div>

                        {mockInterestHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No interest payments yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Interest is credited weekly</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {mockInterestHistory.map((entry, i) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.04 * i }}
                                        className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Interest Payment</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-500 tabular-nums">
                                            +{isHidden ? '••••' : formatCurrency(entry.amount)}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                            <span className="text-sm font-semibold text-foreground">Total Interest Earned</span>
                            <span className="text-base font-bold text-primary tabular-nums">
                                +{isHidden ? '••••' : formatCurrency(totalInterest)}
                            </span>
                        </div>
                    </div>

                    {/* Motivational tip */}
                    <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 p-4">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-foreground">Keep Going!</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isNearComplete
                                        ? "You're almost there! Just a little more to reach your goal. 🎉"
                                        : isHalfway
                                            ? "Great progress! You're halfway to your goal. Stay consistent! 💪"
                                            : "Every contribution brings you closer to your dream. You've got this! 🚀"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
