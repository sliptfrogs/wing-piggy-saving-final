"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowUpRight, Users, PiggyBank, Heart, CheckCircle2, ChevronRight } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

type TransferType = 'own-piggy' | 'p2p' | 'contribute';

// ── Static mock data (unchanged) ─────────────────────────────────────────────

const mockMainBalance = 1250.50;

const mockActiveGoals = [
    { id: '1', name: 'New Laptop', target_amount: 1500, accounts: [{ balance: 890.25 }] },
    { id: '2', name: 'Vacation Fund', target_amount: 3000, accounts: [{ balance: 1250.00 }] },
    { id: '3', name: 'Emergency Fund', target_amount: 5000, accounts: [{ balance: 2100.00 }] },
];

const mockRecipientResults: Record<string, { name: string; goals: { id: string; name: string; target_amount: number }[] }> = {
    '+855123456': { name: 'Jane Smith', goals: [{ id: 'rg1', name: 'House Deposit', target_amount: 20000 }, { id: 'rg2', name: 'Car Fund', target_amount: 8000 }] },
    '+855987654': { name: 'David Lee', goals: [{ id: 'rg3', name: 'Wedding Fund', target_amount: 15000 }] },
};

const tabs: { type: TransferType; icon: typeof ArrowUpRight; label: string; desc: string }[] = [
    { type: 'own-piggy', icon: PiggyBank, label: 'To Piggy', desc: 'Fund your saving goal' },
    { type: 'p2p', icon: Users, label: 'P2P', desc: 'Send to another user' },
    { type: 'contribute', icon: Heart, label: 'Contribute', desc: "Contribute to someone's goal" },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Transfer() {
    const router = useRouter();
    const [type, setType] = useState<TransferType>('own-piggy');
    const [amount, setAmount] = useState('');
    const [selectedPiggy, setSelectedPiggy] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [recipientData, setRecipientData] = useState<{ name: string; goals: any[] } | null>(null);
    const [selectedRecipientGoal, setSelectedRecipientGoal] = useState('');
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);

    const searchRecipient = () => {
        if (!recipientPhone.trim()) return;
        setSearching(true);
        setRecipientData(null);
        setSelectedRecipientGoal('');
        setTimeout(() => {
            const result = mockRecipientResults[recipientPhone.replace(/\s/g, '')] || null;
            setRecipientData(result);
            setSearching(false);
        }, 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); router.push('/'); }, 900);
    };

    const switchTab = (t: TransferType) => {
        setType(t);
        setRecipientData(null);
        setSelectedRecipientGoal('');
        setSelectedPiggy('');
    };

    const amt = parseFloat(amount);
    const isValidAmount = !isNaN(amt) && amt > 0 && amt <= mockMainBalance;

    const canSubmit =
        isValidAmount &&
        (type === 'own-piggy' ? !!selectedPiggy :
            type === 'p2p' ? !!recipientData :
                !!selectedRecipientGoal);

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
            {/* Back button – larger hit area on mobile */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 -ml-1"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Transfer</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Move money to goals or other users</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">

                {/* ── LEFT: type + form ── */}
                <div className="xl:col-span-2 space-y-5 sm:space-y-6">

                    {/* Tab selector – improved for mobile */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {tabs.map(({ type: t, icon: Icon, label, desc }) => (
                            <button
                                key={t}
                                onClick={() => switchTab(t)}
                                className={`flex flex-col items-start gap-1 p-3 sm:p-4 rounded-2xl border transition-all text-left ${type === t
                                    ? 'border-primary/40 bg-primary/5 shadow-sm'
                                    : 'border-border bg-card hover:border-primary/20'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${type === t ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-semibold ${type === t ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                                {/* Hide description on very small screens */}
                                <span className="hidden sm:inline text-xs text-muted-foreground leading-tight">{desc}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

                        {/* Recipient search */}
                        <AnimatePresence mode="wait">
                            {(type === 'p2p' || type === 'contribute') && (
                                <motion.div
                                    key="recipient"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-2xl p-4 sm:p-5 space-y-3"
                                >
                                    <Label className="text-sm font-medium text-foreground">Recipient Phone</Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            placeholder="+855 12 345 678"
                                            value={recipientPhone}
                                            onChange={(e) => setRecipientPhone(e.target.value)}
                                            className="bg-secondary border-border text-foreground flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={searchRecipient}
                                            disabled={searching}
                                            className="shrink-0 sm:w-auto w-full"
                                        >
                                            {searching ? 'Searching...' : 'Search'}
                                        </Button>
                                    </div>

                                    {recipientData && (
                                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-sm text-primary">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Found: <span className="font-semibold">{recipientData.name}</span>
                                        </motion.div>
                                    )}

                                    {recipientData === null && !searching && recipientPhone && (
                                        <p className="text-xs text-muted-foreground">No results — try a different number</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Own piggy goal selector */}
                        <AnimatePresence mode="wait">
                            {type === 'own-piggy' && (
                                <motion.div
                                    key="own-goals"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-2xl p-4 sm:p-5 space-y-3"
                                >
                                    <Label className="text-sm font-medium text-foreground">Select Goal</Label>
                                    <Select value={selectedPiggy} onValueChange={setSelectedPiggy}>
                                        <SelectTrigger className="bg-secondary border-border text-foreground">
                                            <SelectValue placeholder="Choose a goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockActiveGoals.map(goal => (
                                                <SelectItem key={goal.id} value={goal.id}>
                                                    <div className="flex justify-between w-full">
                                                        <span>{goal.name}</span>
                                                        <span className="text-muted-foreground text-xs ml-4">
                                                            {formatCurrency(goal.accounts?.[0]?.balance || 0)} / {formatCurrency(goal.target_amount)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Contribute — recipient goal selector */}
                        <AnimatePresence>
                            {type === 'contribute' && recipientData && recipientData.goals.length > 0 && (
                                <motion.div
                                    key="contrib-goals"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-2xl p-4 sm:p-5 space-y-3"
                                >
                                    <Label className="text-sm font-medium text-foreground">Select Goal to Contribute</Label>
                                    <div className="space-y-2">
                                        {recipientData.goals.map((goal: any) => {
                                            const selected = selectedRecipientGoal === goal.id;
                                            return (
                                                <button
                                                    key={goal.id}
                                                    type="button"
                                                    onClick={() => setSelectedRecipientGoal(goal.id)}
                                                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all flex items-center justify-between ${selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {selected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                                                        <div>
                                                            <p className="font-medium text-foreground text-sm">{goal.name}</p>
                                                            <p className="text-xs text-muted-foreground">Target: {formatCurrency(goal.target_amount)}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Amount */}
                        <div className="glass rounded-2xl p-4 sm:p-5 space-y-2">
                            <Label className="text-sm font-medium text-foreground">Amount (USD)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0.01"
                                step="0.01"
                                className="bg-secondary border-border text-foreground text-xl sm:text-2xl font-bold h-12 sm:h-14"
                            />
                            {amount && !isNaN(amt) && (
                                <p className={`text-xs font-medium ${amt > mockMainBalance ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {amt > mockMainBalance
                                        ? `Exceeds balance by ${formatCurrency(amt - mockMainBalance)}`
                                        : `Remaining after: ${formatCurrency(mockMainBalance - amt)}`}
                                </p>
                            )}
                        </div>

                        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!canSubmit || loading}>
                            {loading ? 'Processing...' : 'Confirm Transfer'}
                        </Button>
                    </form>
                </div>

                {/* ── RIGHT: summary panel – always below on mobile ── */}
                <div className="xl:col-span-1 space-y-4 mt-4 xl:mt-0">

                    {/* Balance card */}
                    <div className="glass rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">Available Balance</p>
                        <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{formatCurrency(mockMainBalance)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Main Account · USD</p>
                    </div>

                    {/* Transfer summary */}
                    <div className="glass rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Transfer Summary</p>

                        <div className="space-y-3">
                            {[
                                {
                                    label: 'Type',
                                    value: tabs.find(t => t.type === type)?.label || '—',
                                },
                                {
                                    label: 'To',
                                    value: type === 'own-piggy'
                                        ? mockActiveGoals.find(g => g.id === selectedPiggy)?.name || '—'
                                        : type === 'p2p'
                                            ? recipientData?.name || '—'
                                            : recipientData?.goals.find((g: any) => g.id === selectedRecipientGoal)?.name || '—',
                                },
                                {
                                    label: 'Amount',
                                    value: isValidAmount ? formatCurrency(amt) : '—',
                                },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{label}</span>
                                    <span className="text-sm font-semibold text-foreground break-all text-right max-w-[60%]">{value}</span>
                                </div>
                            ))}

                            {isValidAmount && (
                                <div className="border-t border-border pt-3 flex justify-between items-center">
                                    <span className="text-sm font-medium text-foreground">Total Deducted</span>
                                    <span className="text-base font-bold text-primary">{formatCurrency(amt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="glass rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
                            {type === 'own-piggy' ? 'About Piggy Transfers' : type === 'p2p' ? 'About P2P' : 'About Contributing'}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {type === 'own-piggy'
                                ? 'Funds move instantly to your saving goal. You can withdraw anytime unless the goal is locked.'
                                : type === 'p2p'
                                    ? 'Send money directly to another user\'s main account. They\'ll receive it instantly.'
                                    : 'Support someone\'s saving goal directly. They\'ll be notified of your contribution.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
