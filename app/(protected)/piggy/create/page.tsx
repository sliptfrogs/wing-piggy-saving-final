"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, differenceInCalendarDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, PiggyBank, CalendarIcon, Lock, EyeOff, Target, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const presetAmounts = [500, 1000, 2500, 5000, 10000];

const presetGoals = [
    { label: 'Vacation', emoji: '✈️', amount: 2000 },
    { label: 'New Laptop', emoji: '💻', amount: 1500 },
    { label: 'Emergency Fund', emoji: '🛡️', amount: 5000 },
    { label: 'Car', emoji: '🚗', amount: 15000 },
    { label: 'Wedding', emoji: '💍', amount: 10000 },
    { label: 'Custom', emoji: '✨', amount: 0 },
];

export default function CreatePiggy() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [expiryDate, setExpiryDate] = useState<Date>();
    const [hideBalance, setHideBalance] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); router.push('/piggy'); }, 800);
    };

    const target = parseFloat(targetAmount);
    const lockDays = expiryDate ? differenceInCalendarDays(expiryDate, new Date()) : null;
    const isValid = name.trim().length > 0 && !isNaN(target) && target > 0;

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Goals
            </button>

            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">New Saving Goal</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Set a target, lock a date, and start saving</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >

                {/* ── LEFT: form ── */}
                <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-5">

                    {/* Preset goal templates */}
                    <div className="glass rounded-2xl p-5 space-y-3">
                        <Label className="text-sm font-medium text-foreground">Quick Templates</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {presetGoals.map(({ label, emoji, amount }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                        if (label !== 'Custom') {
                                            setName(label);
                                            if (amount) setTargetAmount(String(amount));
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
                                >
                                    <span className="text-xl">{emoji}</span>
                                    <span className="text-xs font-medium text-foreground">{label}</span>
                                    {amount > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(amount)}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal name + target */}
                    <div className="glass rounded-2xl p-5 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Goal Name</Label>
                            <Input
                                placeholder="e.g., Vacation 2025"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                maxLength={100}
                                className="bg-secondary border-border text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Target Amount (USD)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                                min="1"
                                step="0.01"
                                className="bg-secondary border-border text-foreground text-2xl font-bold h-14"
                            />
                            {/* Preset amount chips */}
                            <div className="flex gap-2 flex-wrap pt-1">
                                {presetAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        onClick={() => setTargetAmount(String(amt))}
                                        className={cn(
                                            'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                                            targetAmount === String(amt)
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                        )}
                                    >
                                        {formatCurrency(amt)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lock date */}
                    <div className="glass rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium text-foreground">Lock Until (Optional)</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Lock your goal to earn higher interest</p>
                            </div>
                            {expiryDate && (
                                <button
                                    type="button"
                                    onClick={() => setExpiryDate(undefined)}
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80 hover:border-primary/30 transition-all',
                                        !expiryDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {expiryDate ? (
                                        <span className="text-foreground">{format(expiryDate, 'PPP')}</span>
                                    ) : (
                                        'Select a lock date'
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 bg-card border-border/50 max-w-[calc(100vw-2rem)] sm:max-w-none"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={expiryDate}
                                    onSelect={setExpiryDate}
                                    disabled={(date) => date <= new Date()}
                                    initialFocus
                                    className="max-h-[300px] sm:max-h-none overflow-y-auto"
                                />
                            </PopoverContent>
                        </Popover>

                        {expiryDate && lockDays && lockDays > 0 ? (
                            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                Locks for <span className="font-semibold">{lockDays} days</span> — early break incurs a 5% penalty
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                No lock — flexible withdrawals, standard interest rate
                            </p>
                        )}
                    </div>

                    {/* Hide balance toggle */}
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                                    <EyeOff className="w-4 h-4" />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-foreground cursor-pointer">Hide Balance</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">Balance will not show on your dashboard</p>
                                </div>
                            </div>
                            <Switch checked={hideBalance} onCheckedChange={setHideBalance} />
                        </div>
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!isValid || loading}>
                        {loading ? 'Creating...' : 'Create Goal'}
                    </Button>
                </form>

                {/* ── RIGHT: live preview ── */}
                <div className="xl:col-span-1 space-y-4">

                    {/* Preview card */}
                    <div className="glass rounded-2xl p-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Preview</p>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-2xl gradient-accent flex items-center justify-center shrink-0">
                                <PiggyBank className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">
                                    {name.trim() || <span className="text-muted-foreground italic font-normal">Goal name…</span>}
                                </p>
                                <div className={cn(
                                    'inline-block text-xs px-2 py-0.5 rounded-full mt-0.5',
                                    'bg-primary/10 text-primary'
                                )}>active</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-1">Target</p>
                            <p className="text-2xl font-display font-bold text-foreground">
                                {isNaN(target) || target <= 0
                                    ? <span className="text-muted-foreground text-lg font-normal italic">—</span>
                                    : formatCurrency(target)}
                            </p>
                        </div>

                        {/* Progress bar preview (always 0% on create) */}
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                            <div className="h-full w-0 rounded-full gradient-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">0% funded</p>
                    </div>

                    {/* Settings summary */}
                    <div className="glass rounded-2xl p-5 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Settings</p>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Lock className="w-3.5 h-3.5" /> Lock Period
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {lockDays && lockDays > 0 ? `${lockDays} days` : 'None'}
                                </span>
                            </div>

                            {expiryDate && lockDays && lockDays > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarIcon className="w-3.5 h-3.5" /> Unlocks
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{format(expiryDate, 'MMM d, yyyy')}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <EyeOff className="w-3.5 h-3.5" /> Hide Balance
                                </div>
                                <span className={cn('text-sm font-medium', hideBalance ? 'text-primary' : 'text-muted-foreground')}>
                                    {hideBalance ? 'On' : 'Off'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <TrendingUp className="w-3.5 h-3.5" /> Interest Rate
                                </div>
                                <span className="text-sm font-medium text-primary">
                                    {lockDays && lockDays >= 90 ? '4.5% p.a.' : lockDays && lockDays >= 30 ? '3.0% p.a.' : '1.5% p.a.'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tip</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {lockDays && lockDays >= 90
                                ? 'Great choice! Locking for 90+ days earns the highest interest rate of 4.5% p.a.'
                                : lockDays && lockDays > 0
                                    ? 'Lock for 90+ days to unlock the highest interest rate (4.5% p.a.).'
                                    : 'Set a lock date to earn up to 4.5% interest and stay committed to your goal.'}
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
