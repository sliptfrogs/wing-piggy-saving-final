"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowUpRight, Users, PiggyBank, Heart, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAccountLookup } from '@/hooks/api/useAccountLookup';
import { useTransferByP2P } from '@/hooks/api/useTransfer'; // adjust path
import { toast } from '@/hooks/use-toast';


function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

type TransferType = 'own-piggy' | 'p2p' | 'contribute';

// ── Static mock data (still used for own piggy goals and balance) ──
const mockMainBalance = 1250.50;
const mockActiveGoals = [
    { id: '1', name: 'New Laptop', target_amount: 1500, accounts: [{ balance: 890.25 }] },
    { id: '2', name: 'Vacation Fund', target_amount: 3000, accounts: [{ balance: 1250.00 }] },
    { id: '3', name: 'Emergency Fund', target_amount: 5000, accounts: [{ balance: 2100.00 }] },
];

const tabs: { type: TransferType; icon: typeof ArrowUpRight; label: string; desc: string }[] = [
    { type: 'own-piggy', icon: PiggyBank, label: 'To Piggy', desc: 'Fund your saving goal' },
    { type: 'p2p', icon: Users, label: 'P2P', desc: 'Send to another user' },
    { type: 'contribute', icon: Heart, label: 'Contribute', desc: "Contribute to someone's goal" },
];

export default function Transfer() {
    const router = useRouter();
    const [type, setType] = useState<TransferType>('own-piggy');
    const [amount, setAmount] = useState('');
    const [selectedPiggy, setSelectedPiggy] = useState('');
    const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
    const [searchAccountNumber, setSearchAccountNumber] = useState('');
    const [selectedRecipientGoal, setSelectedRecipientGoal] = useState('');

    // Recipient lookup
    const {
        data: accountData,
        isLoading: accountLoading,
        error: accountError,
    } = useAccountLookup(searchAccountNumber);

    // P2P transfer mutation
    const { mutate: transferP2P, isPending: isP2PPending } = useTransferByP2P();

    // For now, we'll treat the account as valid for P2P once data exists.
    const recipientData = accountData;

    const handleSearch = () => {
        const normalized = recipientAccountNumber.trim().replace(/\s/g, '');
        if (normalized) {
            setSearchAccountNumber(normalized);
        } else {
            setSearchAccountNumber('');
        }
    };

    const switchTab = (t: TransferType) => {
        setType(t);
        setSelectedPiggy('');
        setRecipientAccountNumber('');
        setSearchAccountNumber('');
        setSelectedRecipientGoal('');
    };

    const amt = parseFloat(amount);
    const isValidAmount = !isNaN(amt) && amt > 0 && amt <= mockMainBalance;

    const canSubmit =
        isValidAmount &&
        (type === 'own-piggy'
            ? !!selectedPiggy
            : type === 'p2p'
                ? !!recipientData && !accountError
                : type === 'contribute'
                    ? !!recipientData && !!selectedRecipientGoal && !accountError
                    : false);

    const getRecipientDisplay = () => {
        if (type === 'own-piggy') {
            return mockActiveGoals.find(g => g.id === selectedPiggy)?.name || '—';
        } else if (type === 'p2p') {
            return recipientData?.account_number || '—';
        } else {
            return selectedRecipientGoal ? 'Selected Goal' : '—';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        if (type === 'p2p') {
            transferP2P(
                {
                    recipient_account_number: recipientData.account_number,
                    amount: amt,
                },
                {
                    onSuccess: (data) => {
                        toast({
                            title: 'Transfer successful',
                            description: `Sent ${formatCurrency(amt)} to account ${recipientData.account_number}`,
                        });
                        router.push('/');
                    },
                    onError: (error: any) => {
                        toast({
                            title: 'Transfer failed',
                            description: `Failed to send ${formatCurrency(amt)} to account ${recipientData.account_number}`,
                        });
                    },
                }
            );
        } else if (type === 'own-piggy') {
            // TODO: Implement own piggy transfer
            toast({
                title: 'Piggy transfer',
                description: `Transfer of ${formatCurrency(amt)} to goal "${mockActiveGoals.find(g => g.id === selectedPiggy)?.name}" will be implemented soon.`,
            })
        } else if (type === 'contribute') {
            // TODO: Implement contribution transfer
            toast({
                title: 'Contribution transfer',
                description: `Contribution of ${formatCurrency(amt)} to account ${recipientData?.account_number} will be implemented soon.`,
            })
        }
    };

    const isProcessing = isP2PPending; // only for P2P; extend for others

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
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
                {/* LEFT: type + form */}
                <div className="xl:col-span-2 space-y-5 sm:space-y-6">
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
                                <span className="hidden sm:inline text-xs text-muted-foreground leading-tight">{desc}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {/* Recipient search (P2P & Contribute) */}
                        <AnimatePresence mode="wait">
                            {(type === 'p2p' || type === 'contribute') && (
                                <motion.div
                                    key="recipient"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-2xl p-4 sm:p-5 space-y-3"
                                >
                                    <Label className="text-sm font-medium text-foreground">Recipient Account Number</Label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            placeholder="e.g., 1234567890"
                                            value={recipientAccountNumber}
                                            onChange={(e) => setRecipientAccountNumber(e.target.value)}
                                            className="bg-secondary border-border text-foreground flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSearch}
                                            disabled={accountLoading || !recipientAccountNumber.trim()}
                                            className="shrink-0 sm:w-auto w-full"
                                        >
                                            {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                        </Button>
                                    </div>

                                    {accountError && !accountLoading && searchAccountNumber && (
                                        <p className="text-xs text-destructive mt-2">{accountError.message}</p>
                                    )}

                                    {accountData && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-sm text-primary mt-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Found: <span className="font-semibold">{accountData.account_number}</span>
                                        </motion.div>
                                    )}

                                    {!accountData && !accountLoading && searchAccountNumber && (
                                        <p className="text-xs text-muted-foreground mt-2">No account found — please check the number.</p>
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

                        {/* Contribute – recipient goal selector (placeholder) */}
                        <AnimatePresence>
                            {type === 'contribute' && accountData && (
                                <motion.div
                                    key="contrib-goals"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass rounded-2xl p-4 sm:p-5 space-y-3"
                                >
                                    <Label className="text-sm font-medium text-foreground">Select Goal to Contribute</Label>
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Goals will appear here (coming soon)</p>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRecipientGoal('demo')}
                                            className="w-full text-left p-3 sm:p-4 rounded-xl border border-border bg-background hover:border-primary/20 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-foreground text-sm">Demo Goal</p>
                                                <p className="text-xs text-muted-foreground">Target: $1000</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                        </button>
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

                        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={!canSubmit || isProcessing}>
                            {isProcessing ? 'Processing...' : 'Confirm Transfer'}
                        </Button>
                    </form>
                </div>

                {/* RIGHT: summary panel */}
                <div className="xl:col-span-1 space-y-4 mt-4 xl:mt-0">
                    <div className="glass rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">Available Balance</p>
                        <p className="text-2xl sm:text-3xl font-display font-bold text-foreground">{formatCurrency(mockMainBalance)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Main Account · USD</p>
                    </div>

                    <div className="glass rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Transfer Summary</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <span className="text-sm font-semibold text-foreground">{tabs.find(t => t.type === type)?.label || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">To</span>
                                <span className="text-sm font-semibold text-foreground break-all text-right max-w-[60%]">{getRecipientDisplay()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Amount</span>
                                <span className="text-sm font-semibold text-foreground">{isValidAmount ? formatCurrency(amt) : '—'}</span>
                            </div>
                            {isValidAmount && (
                                <div className="border-t border-border pt-3 flex justify-between items-center">
                                    <span className="text-sm font-medium text-foreground">Total Deducted</span>
                                    <span className="text-base font-bold text-primary">{formatCurrency(amt)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-4 sm:p-5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
                            {type === 'own-piggy' ? 'About Piggy Transfers' : type === 'p2p' ? 'About P2P' : 'About Contributing'}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {type === 'own-piggy'
                                ? 'Funds move instantly to your saving goal. You can withdraw anytime unless the goal is locked.'
                                : type === 'p2p'
                                    ? 'Send money directly to another user\'s main account using their account number. They\'ll receive it instantly.'
                                    : 'Support someone\'s saving goal directly by entering their account number. They\'ll be notified of your contribution.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
