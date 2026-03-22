"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, PiggyBank, QrCode, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Helper functions (unchanged)
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

// Static mock data (unchanged)
const mockProfile = {
  full_name: 'Alex Johnson',
};

const mockMainAccount = {
  balance: 1250.50,
  currency: 'USD',
};

const mockPiggyGoals = [
  {
    id: '1',
    name: 'New Laptop',
    target_amount: 1500,
    status: 'active',
    hide_balance: false,
    accounts: [{ balance: 890.25 }],
  },
  {
    id: '2',
    name: 'Vacation Fund',
    target_amount: 3000,
    status: 'active',
    hide_balance: false,
    accounts: [{ balance: 1250.00 }],
  },
  {
    id: '3',
    name: 'Emergency Fund',
    target_amount: 5000,
    status: 'active',
    hide_balance: false,
    accounts: [{ balance: 2100.00 }],
  },
];

const mockTransactions = [
  {
    id: 'tx1',
    type: 'deposit',
    description: 'Salary Deposit',
    amount: 2500.00,
    created_at: new Date().toISOString(),
  },
  {
    id: 'tx2',
    type: 'transfer',
    description: 'Transfer to Savings',
    amount: 200.00,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tx3',
    type: 'p2p',
    description: 'Paid to Jane',
    amount: 45.50,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'tx4',
    type: 'contribution',
    description: 'Piggy contribution',
    amount: 100.00,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'tx5',
    type: 'deposit',
    description: 'Refund',
    amount: 30.00,
    created_at: new Date(Date.now() - 345600000).toISOString(),
  },
];

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const router = useRouter();

  const profile = mockProfile;
  const mainAccount = mockMainAccount;
  const piggyGoals = mockPiggyGoals;
  const transactions = mockTransactions;

  const activeGoals = piggyGoals.filter(g => g.status === 'active');
  const recentTx = transactions.slice(0, 5);

  const quickActions = [
    { icon: ArrowUpRight, label: 'Transfer', path: '/transfer', color: 'bg-primary/10 text-primary' },
    { icon: PiggyBank, label: 'Save', path: '/piggy/create', color: 'bg-accent/10 text-accent' },
    { icon: QrCode, label: 'QR Pay', path: '/qr', color: 'bg-info/10 text-info' },
    { icon: Users, label: 'P2P', path: '/transfer?type=p2p', color: 'bg-warning/10 text-warning' },
  ];

  return (
    // Remove max-w-lg on desktop; let content fill the available width
    <div className="px-4 py-4 space-y-6 md:px-6 md:py-8 max-w-lg md:max-w-none mx-auto md:mx-0">
      {/* Greeting - stays same */}
      <div>
        <p className="text-muted-foreground text-sm">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
        </p>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {profile.full_name} 👋
        </h1>
      </div>

      {/* Balance Card - stays same */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 gradient-hero border border-primary/20 shadow-glow"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground">
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <h2 className="text-4xl font-display font-bold text-foreground mb-1">
          {showBalance ? formatCurrency(mainAccount.balance) : '••••••'}
        </h2>
        <p className="text-xs text-muted-foreground">Main Account • {mainAccount.currency}</p>
      </motion.div>

      {/* Quick Actions - more columns on desktop */}
      <div className="grid grid-cols-4 gap-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8">
        {quickActions.map(({ icon: Icon, label, path, color }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => router.push(path)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs text-foreground font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Main content: two columns on desktop (Goals + Transactions) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        {/* Piggy Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-foreground">Saving Goals</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/piggy')} className="text-primary text-xs">
              View All
            </Button>
          </div>
          {activeGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-6 text-center"
            >
              <PiggyBank className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No saving goals yet</p>
              <Button variant="hero" size="sm" onClick={() => router.push('/piggy/create')}>
                <Plus className="w-4 h-4 mr-1" /> Create Goal
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 3).map((goal, i) => {
                const account = goal.accounts?.[0];
                const balance = account?.balance || 0;
                const progress = goal.target_amount > 0 ? (balance / goal.target_amount) * 100 : 0;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => router.push(`/piggy/${goal.id}`)}
                    className="glass p-4 cursor-pointer hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">{goal.name}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.1 * i }}
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {goal.hide_balance ? '••••' : formatCurrency(balance)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/history')} className="text-primary text-xs">
              View All
            </Button>
          </div>
          {recentTx.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {recentTx.map((tx) => (
                <div key={tx.id} className="glass p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize truncate">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-primary' : 'text-foreground'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
