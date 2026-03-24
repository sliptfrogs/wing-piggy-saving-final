"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft,
    PiggyBank, QrCode, Users, TrendingUp, ChevronRight, Bell,
    Wallet, Target, Clock, Calendar, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAccountMain, useMainAccount } from '@/hooks/api/useAccount';
import { useSession } from 'next-auth/react';

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getTransactionIcon(type: string) {
    switch (type) {
        case 'transfer': return <ArrowUpRight className="w-4 h-4" />;
        case 'p2p': return <Users className="w-4 h-4" />;
        case 'contribution': return <PiggyBank className="w-4 h-4" />;
        case 'deposit': return <ArrowDownLeft className="w-4 h-4" />;
        default: return <ArrowUpRight className="w-4 h-4" />;
    }
}

const mockProfile = { full_name: 'Alex Johnson' };

const mockPiggyGoals = [
    { id: '1', name: 'New Laptop', target_amount: 1500, status: 'active', hide_balance: false, accounts: [{ balance: 890.25 }] },
    { id: '2', name: 'Vacation Fund', target_amount: 3000, status: 'active', hide_balance: false, accounts: [{ balance: 1250.00 }] },
    { id: '3', name: 'Emergency Fund', target_amount: 5000, status: 'active', hide_balance: false, accounts: [{ balance: 2100.00 }] },
];

const mockTransactions = [
    { id: 'tx1', type: 'deposit', description: 'Salary Deposit', amount: 2500.00, created_at: new Date().toISOString() },
    { id: 'tx2', type: 'transfer', description: 'Transfer to Savings', amount: 200.00, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'tx3', type: 'p2p', description: 'Paid to Jane', amount: 45.50, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'tx4', type: 'contribution', description: 'Piggy contribution', amount: 100.00, created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 'tx5', type: 'deposit', description: 'Refund', amount: 30.00, created_at: new Date(Date.now() - 345600000).toISOString() },
];

export default function Dashboard() {
    const [showBalance, setShowBalance] = useState(true);

    const { data: mainAccount, isLoading, error } = useMainAccount();
    const session = useSession();

    const displayName = session?.data?.user?.email?.split('@')[0] || 'Guest';


    const router = useRouter();

    const h = new Date().getHours();
    const greeting = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';

    const activeGoals = mockPiggyGoals.filter(g => g.status === 'active');
    const recentTx = mockTransactions.slice(0, 5);

    const quickActions = [
        { icon: ArrowUpRight, label: 'Transfer', path: '/transfer', color: 'bg-blue-500/10 text-blue-500', gradient: 'from-blue-500 to-blue-600' },
        { icon: PiggyBank, label: 'Save', path: '/piggy/create', color: 'bg-emerald-500/10 text-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
        { icon: QrCode, label: 'QR Pay', path: '/qr', color: 'bg-purple-500/10 text-purple-500', gradient: 'from-purple-500 to-purple-600' },
        { icon: Users, label: 'P2P', path: '/transfer?type=p2p', color: 'bg-amber-500/10 text-amber-500', gradient: 'from-amber-500 to-amber-600' },
    ];

    const stats = [
        { label: 'Total Balance', value: formatCurrency(mainAccount?.current_balance ?? 0), icon: Wallet, trend: '+12.4%', color: 'text-primary' },
        { label: 'Monthly Spend', value: '$345.50', icon: TrendingUp, trend: '-8.2%', color: 'text-muted-foreground' },
        { label: 'Active Goals', value: '3', icon: Target, trend: '+1 this month', color: 'text-emerald-500' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1440px] mx-auto">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">✨</span>
                            <p className="text-sm text-muted-foreground">Welcome back,</p>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                            {displayName} 👋
                            <span className="text-lg text-muted-foreground font-normal ml-2">Good {greeting}</span>
                        </h1>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Premium
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Main Balance Card - Full Width Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Main Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 shadow-xl"
                    >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

                        <div className="relative p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/20">
                                        <Wallet className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Main Account</p>
                                        <p className="text-xs text-muted-foreground font-mono">{mainAccount?.account_number}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="p-2 rounded-xl hover:bg-secondary/80 transition-colors backdrop-blur-sm"
                                >
                                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="mb-8">
                                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    <span>Available Balance</span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Instant</span>
                                </p>
                                <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight">
                                    {showBalance ? formatCurrency(mainAccount?.current_balance ?? 0) : '••••••'}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <span>{mainAccount?.currency}</span>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                    <span>Last updated: just now</span>
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => router.push('/transfer')}
                                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                >
                                    <ArrowUpRight className="w-4 h-4" /> Send Money
                                </Button>
                                <Button
                                    onClick={() => router.push('/deposit')}
                                    variant="outline"
                                    className="flex-1 gap-2 border-primary/30 hover:bg-primary/10"
                                >
                                    <ArrowDownLeft className="w-4 h-4" /> Add Funds
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards - Horizontal on desktop, stacked on mobile */}
                    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-1 lg:gap-4">
                        {stats.map((stat, i) => {
                            // Compute real total saved (sum of piggy balances)
                            const totalSaved = mockPiggyGoals.reduce((sum, goal) => sum + (goal.accounts?.[0]?.balance || 0), 0);

                            // Replace "Total Balance" with "Total Saved" for more relevance
                            let displayLabel = stat.label;
                            let displayValue = stat.value;
                            if (stat.label === 'Total Balance') {
                                displayLabel = 'Total Saved';
                                displayValue = formatCurrency(totalSaved);
                            }

                            return (
                                <motion.div
                                    key={displayLabel}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
                                    className="glass rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => {
                                        if (displayLabel === 'Total Saved') router.push('/piggy');
                                        if (displayLabel === 'Monthly Spend') router.push('/history');
                                        if (displayLabel === 'Active Goals') router.push('/piggy');
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{displayLabel}</p>
                                            <p className="text-lg font-bold text-foreground">{displayValue}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {stat.trend}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/60 mt-0.5">vs last month</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions Section */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-display font-semibold text-foreground">Quick Actions</h3>
                            <p className="text-xs text-muted-foreground">Frequent operations at your fingertips</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map(({ icon: Icon, label, path, color, gradient }, i) => (
                            <motion.button
                                key={label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05 * i }}
                                onClick={() => router.push(path)}
                                className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/40 p-4 transition-all hover:shadow-lg"
                            >
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">{label}</span>
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Goals & Transactions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Saving Goals Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-2xl overflow-hidden md:col-span-2"
                    >
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="w-4 h-4 text-primary" />
                                        <h3 className="font-display font-semibold text-foreground">Saving Goals</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{activeGoals.length} active • Track your progress</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/piggy')}
                                    className="text-primary hover:bg-primary/10"
                                >
                                    View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-5">
                            {activeGoals.length === 0 ? (
                                <div className="text-center py-12">
                                    <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground mb-4">No saving goals yet</p>
                                    <Button variant="hero" onClick={() => router.push('/piggy/create')}>
                                        <Plus className="w-4 h-4 mr-1" /> Create Your First Goal
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeGoals.map((goal, i) => {
                                        const balance = goal.accounts?.[0]?.balance || 0;
                                        const progress = Math.min((balance / goal.target_amount) * 100, 100);
                                        const isNearComplete = progress >= 80;

                                        return (
                                            <motion.div
                                                key={goal.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                onClick={() => router.push(`/piggy/${goal.id}`)}
                                                className="group cursor-pointer rounded-xl p-4 bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNearComplete ? 'bg-primary/15' : 'bg-secondary'}`}>
                                                            <PiggyBank className={`w-5 h-5 ${isNearComplete ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {goal.hide_balance ? '••••' : formatCurrency(balance)} of {formatCurrency(goal.target_amount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-sm font-bold ${isNearComplete ? 'text-primary' : 'text-foreground'}`}>
                                                            {Math.round(progress)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.8, delay: 0.1 * i }}
                                                        className={`h-full rounded-full ${isNearComplete ? 'bg-gradient-to-r from-primary to-accent' : 'bg-primary/60'}`}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    <button
                                        onClick={() => router.push('/piggy/create')}
                                        className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary text-sm font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add New Goal
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* Recent Transactions Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass rounded-2xl overflow-hidden md:col-span-2"
                    >
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Last {recentTx.length} transactions</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/history')}
                                    className="text-primary hover:bg-primary/10"
                                >
                                    View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-5">
                            {recentTx.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentTx.map((tx, i) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 * i }}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-all cursor-pointer group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'
                                                } group-hover:scale-105 transition-transform`}>
                                                {getTransactionIcon(tx.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{tx.description || tx.type}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground capitalize">• {tx.type}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-bold tabular-nums ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                    {tx.type === 'deposit' ? '+' : '−'}{formatCurrency(tx.amount)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
}
