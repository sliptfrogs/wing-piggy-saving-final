"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PiggyBank, Wallet, Download, Share2, RefreshCw, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type QRTarget = 'main' | 'piggy';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockMainAccount = {
    id: 'main_123', user_id: 'user_456', balance: 1250.50, currency: 'USD',
};

const mockPiggyGoals = [
    { id: '1', name: 'New Laptop', target_amount: 1500, status: 'active', user_id: 'user_456', accounts: [{ balance: 890.25 }] },
    { id: '2', name: 'Vacation Fund', target_amount: 3000, status: 'active', user_id: 'user_456', accounts: [{ balance: 1250.00 }] },
    { id: '3', name: 'Emergency Fund', target_amount: 5000, status: 'active', user_id: 'user_456', accounts: [{ balance: 2100.00 }] },
];

function encodeQRPayload(payload: object) {
    // Remove timestamp to ensure stable rendering between server and client
    return JSON.stringify(payload);
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QRGenerator() {
    const [target, setTarget] = useState<QRTarget>('main');
    const [selectedGoal, setSelectedGoal] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    const activeGoals = mockPiggyGoals.filter(g => g.status === 'active');
    const selectedGoalData = activeGoals.find(g => g.id === selectedGoal);

    // Handle client-side only mounting to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Generate QR data - stable payload without timestamps
    const getQRData = () => {
        if (target === 'main') {
            return encodeQRPayload({
                type: 'main',
                accountId: mockMainAccount.id,
                userId: mockMainAccount.user_id,
            });
        }

        if (selectedGoalData) {
            return encodeQRPayload({
                type: 'piggy',
                piggyId: selectedGoalData.id,
                userId: selectedGoalData.user_id,
                name: selectedGoalData.name,
            });
        }

        return '';
    };

    const qrData = getQRData();
    const showQR = target === 'main' || !!selectedGoalData;

    const handleRefresh = () => {
        setRefreshKey(k => k + 1);
    };

    // Goal progress
    const goalBalance = selectedGoalData?.accounts?.[0]?.balance || 0;
    const goalProgress = selectedGoalData ? Math.round((goalBalance / selectedGoalData.target_amount) * 100) : 0;

    // Don't render QR code on server to prevent hydration mismatch
    // Wait until client-side mounting to render the actual QR
    const shouldRenderQR = isMounted && showQR;

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">My QR Code</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Share your QR to receive money or contributions</p>
            </div>

            {/* ── Responsive grid: stacked on mobile, side-by-side on xl ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── LEFT: controls ── */}
                <div className="space-y-4 xl:col-span-3">

                    {/* Receive-to selector */}
                    <div className="glass rounded-2xl p-5 space-y-3">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receive to</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { type: 'main' as QRTarget, icon: Wallet, label: 'Main Account', sub: formatCurrency(mockMainAccount.balance) },
                                { type: 'piggy' as QRTarget, icon: PiggyBank, label: 'Piggy Goal', sub: `${activeGoals.length} active` },
                            ]).map(({ type: t, icon: Icon, label, sub }) => (
                                <button
                                    key={t}
                                    onClick={() => { setTarget(t); setSelectedGoal(''); }}
                                    className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left ${target === t
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-border bg-background hover:border-primary/20'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${target === t ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-semibold leading-tight ${target === t ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                                    <span className="text-xs text-muted-foreground">{sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Piggy goal selector */}
                    <AnimatePresence>
                        {target === 'piggy' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass rounded-2xl p-5 space-y-3"
                            >
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Select Goal</Label>
                                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                                    <SelectTrigger className="w-full bg-secondary border-border text-foreground">
                                        <div className="flex items-center gap-2">
                                            <PiggyBank className="w-4 h-4 text-primary shrink-0" />
                                            <SelectValue placeholder="Choose a piggy goal" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeGoals.map(g => (
                                            <SelectItem key={g.id} value={g.id}>
                                                <span className="flex items-center gap-2">
                                                    {g.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Selected goal progress preview */}
                                {selectedGoalData && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="rounded-xl border border-border bg-background p-3 space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{formatCurrency(goalBalance)}</span>
                                            <span>{formatCurrency(selectedGoalData.target_amount)}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${goalProgress}%` }}
                                                transition={{ duration: 0.7 }}
                                                className="h-full rounded-full gradient-primary"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                            <TrendingUp className="w-3 h-3" /> {goalProgress}% funded
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>

                {/* ── RIGHT: QR display ── */}
                <div className="xl:col-span-3 flex flex-col gap-4">

                    <AnimatePresence mode="wait">
                        {shouldRenderQR ? (
                            <motion.div
                                key={`${target}-${selectedGoal}-${refreshKey}`}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.35 }}
                                className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5"
                            >
                                {/* Label */}
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                                        {target === 'main' ? <Wallet className="w-3.5 h-3.5" /> : <PiggyBank className="w-3.5 h-3.5" />}
                                        {target === 'main' ? 'Main Account' : selectedGoalData?.name}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {target === 'main'
                                            ? 'Scan to send money to my main account'
                                            : `Scan to contribute to "${selectedGoalData?.name}"`}
                                    </p>
                                </div>

                                {/* QR */}
                                <div className="relative">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm">
                                        <QRCodeSVG value={qrData} size={200} className="sm:w-[220px] sm:h-[220px]" />
                                    </div>
                                    {/* Corner accents */}
                                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                                        <div key={i} className={`absolute ${pos} w-5 h-5 border-2 border-primary rounded-sm -m-1
                      ${i === 0 ? 'border-r-0 border-b-0' : i === 1 ? 'border-l-0 border-b-0' : i === 2 ? 'border-r-0 border-t-0' : 'border-l-0 border-t-0'}`} />
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 w-full max-w-xs">
                                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                                        <Download className="w-3.5 h-3.5" /> Save
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                    </Button>
                                    <Button variant="hero" size="sm" className="flex-1 gap-1.5" onClick={handleRefresh}>
                                        <RefreshCw className="w-3.5 h-3.5" /> New QR
                                    </Button>
                                </div>
                            </motion.div>
                        ) : showQR ? (
                            // Placeholder while mounting on client
                            <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                                        {target === 'main' ? <Wallet className="w-3.5 h-3.5" /> : <PiggyBank className="w-3.5 h-3.5" />}
                                        {target === 'main' ? 'Main Account' : selectedGoalData?.name}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Loading QR code...</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm w-[220px] h-[220px] flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass rounded-2xl p-12 flex flex-col items-center gap-4 text-center border-2 border-dashed border-border"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                                    <PiggyBank className="w-7 h-7 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Select a goal</p>
                                    <p className="text-sm text-muted-foreground mt-1">Choose a piggy goal on the left to generate your QR</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Account summary strip */}
                    {showQR && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(target === 'main' ? [
                                { label: 'Account', value: 'Main Account' },
                                { label: 'Balance', value: formatCurrency(mockMainAccount.balance) },
                                { label: 'Currency', value: mockMainAccount.currency },
                            ] : selectedGoalData ? [
                                { label: 'Goal', value: selectedGoalData.name },
                                { label: 'Saved', value: formatCurrency(goalBalance) },
                                { label: 'Progress', value: `${goalProgress}%` },
                            ] : []).map(({ label, value }) => (
                                <div key={label} className="glass rounded-xl p-3 text-center">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}


                    {/* Tips */}
                    <div className="glass rounded-2xl p-5 space-y-3">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">How it works</Label>
                        {[
                            { step: '1', text: 'Choose where to receive money' },
                            { step: '2', text: 'Share your QR code with the sender' },
                            { step: '3', text: 'They scan and send — instantly' },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                    {step}
                                </div>
                                <p className="text-sm text-muted-foreground">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
