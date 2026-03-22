"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft,
    PiggyBank, QrCode, Users, TrendingUp, ChevronRight, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
const mockMainAccount = { balance: 1250.50, currency: 'USD', accountNumber: '•••• 4821' };

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

const mockStats = [
    { label: 'Total Saved', value: '$4,240.25', change: '+12.4%', positive: true },
    { label: 'Monthly Spend', value: '$345.50', change: '-8.2%', positive: true },
    { label: 'Goals Active', value: '3', change: '+1', positive: true },
];

export default function Dashboard() {
    const [showBalance, setShowBalance] = useState(true);
    const router = useRouter();

    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

    const activeGoals = mockPiggyGoals.filter(g => g.status === 'active');
    const recentTx = mockTransactions.slice(0, 5);

    const quickActions = [
        { icon: ArrowUpRight, label: 'Transfer', path: '/transfer', color: 'bg-primary/10 text-primary' },
        { icon: PiggyBank, label: 'Save', path: '/piggy/create', color: 'bg-accent/10 text-accent' },
        { icon: QrCode, label: 'QR Pay', path: '/qr', color: 'bg-info/10 text-info' },
        { icon: Users, label: 'P2P', path: '/transfer?type=p2p', color: 'bg-warning/10 text-warning' },
    ];

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Greeting + notification */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{greeting},</p>
                    <h1 className="text-2xl font-display font-bold text-foreground">{mockProfile.full_name} 👋</h1>
                </div>

            </div>

            {/* Row 1: Balance card + stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl p-6 gradient-hero border border-primary/20 shadow-glow flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Main Account</span>
                        <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    </div>
                    <div>
                        <h2 className="text-3xl xl:text-4xl font-display font-bold text-foreground mb-1">
                            {showBalance ? formatCurrency(mockMainAccount.balance) : '••••••'}
                        </h2>
                        <p className="text-xs text-muted-foreground">{mockMainAccount.accountNumber} · {mockMainAccount.currency}</p>
                    </div>
                    <div className="mt-5 flex gap-2">
                        <button
                            onClick={() => router.push('/transfer')}
                            className="flex-1 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <ArrowUpRight className="w-3.5 h-3.5" /> Send
                        </button>
                        <button
                            onClick={() => router.push('/deposit')}
                            className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>
                </motion.div>

                {mockStats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08 * (i + 1) }}
                        className="glass rounded-2xl p-5 flex flex-col justify-between"
                    >
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">{stat.label}</p>
                        <div>
                            <p className="text-2xl xl:text-3xl font-display font-bold text-foreground">{stat.value}</p>
                            <span className={`inline-flex items-center gap-1 mt-1 text-xs font-semibold ${stat.positive ? 'text-primary' : 'text-destructive'}`}>
                                <TrendingUp className="w-3 h-3" /> {stat.change} vs last month
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Row 2: Quick Actions */}
            <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h3>
                <div className="flex gap-3 flex-wrap">
                    {quickActions.map(({ icon: Icon, label, path, color }, i) => (
                        <motion.button
                            key={label}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.06 * i }}
                            onClick={() => router.push(path)}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all group  w-full sm:w-auto"
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{label}</span>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Row 3: Goals + Transactions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">

                {/* Saving Goals */}
                <section className="glass rounded-2xl p-5 xl:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-display font-semibold text-foreground">Saving Goals</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{activeGoals.length} active goals</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/piggy')} className="text-primary text-xs flex items-center gap-1">
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    {activeGoals.length === 0 ? (
                        <div className="text-center py-8">
                            <PiggyBank className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">No saving goals yet</p>
                            <Button variant="hero" size="sm" onClick={() => router.push('/piggy/create')}>
                                <Plus className="w-4 h-4 mr-1" /> Create Goal
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeGoals.map((goal, i) => {
                                const balance = goal.accounts?.[0]?.balance || 0;
                                const progress = goal.target_amount > 0 ? (balance / goal.target_amount) * 100 : 0;
                                const nearDone = progress >= 80;
                                return (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.06 * i }}
                                        onClick={() => router.push(`/piggy/${goal.id}`)}
                                        className="rounded-xl border border-border hover:border-primary/30 bg-background p-4 cursor-pointer transition-all hover:shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${nearDone ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                                    <PiggyBank className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground leading-tight">{goal.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {goal.hide_balance ? '••••' : formatCurrency(balance)} of {formatCurrency(goal.target_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold tabular-nums ${nearDone ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                                transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${nearDone ? 'gradient-primary' : 'bg-muted-foreground/40'}`}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}

                            <button
                                onClick={() => router.push('/piggy/create')}
                                className="w-full py-3 rounded-xl border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add New Goal
                            </button>
                        </div>
                    )}
                </section>

                {/* Recent Transactions */}
                <section className="glass rounded-2xl p-5 xl:p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last {recentTx.length} transactions</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/history')} className="text-primary text-xs flex items-center gap-1">
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    {recentTx.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
                    ) : (
                        <div className="space-y-1">
                            {recentTx.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer"
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'deposit' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                        {getTransactionIcon(tx.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{tx.description || tx.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold tabular-nums ${tx.type === 'deposit' ? 'text-primary' : 'text-foreground'}`}>
                                            {tx.type === 'deposit' ? '+' : '−'}{formatCurrency(tx.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{tx.type}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
