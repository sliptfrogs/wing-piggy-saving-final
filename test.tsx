"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield, Users, History, Settings, RotateCcw, BookOpen,
  TrendingUp, TrendingDown, ArrowUpRight, AlertTriangle,
  CheckCircle2, XCircle, Search
} from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockUsers = [
  { id: 'u1', full_name: 'Alex Johnson', phone: '+855 12 345 678', created_at: new Date(Date.now() - 90 * 86400000).toISOString(), balance: 1250.50, goals: 3 },
  { id: 'u2', full_name: 'Jane Smith',   phone: '+855 98 765 432', created_at: new Date(Date.now() - 60 * 86400000).toISOString(), balance: 3400.00, goals: 2 },
  { id: 'u3', full_name: 'David Lee',    phone: '+855 11 223 344', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), balance:  870.25, goals: 1 },
  { id: 'u4', full_name: 'Sarah Wong',   phone: '+855 55 667 788', created_at: new Date(Date.now() -  7 * 86400000).toISOString(), balance: 5100.00, goals: 4 },
];

const mockTransactions = [
  { id: 'tx1',  type: 'deposit',  description: 'Salary Deposit',         amount: 2500.00, status: 'completed', created_at: new Date().toISOString(),                          from_account_id: 'ext', to_account_id: 'acc1' },
  { id: 'tx2',  type: 'transfer', description: 'Transfer to New Laptop', amount:  200.00, status: 'completed', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), from_account_id: 'acc1', to_account_id: 'acc2' },
  { id: 'tx3',  type: 'p2p',      description: 'Paid Jane Smith',        amount:   45.50, status: 'completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), from_account_id: 'acc1', to_account_id: 'acc3' },
  { id: 'tx4',  type: 'reversal', description: 'Reversed Transfer',      amount:   50.00, status: 'reversed',  created_at: new Date(Date.now() - 3 * 86400000).toISOString(), from_account_id: 'acc2', to_account_id: 'acc1' },
  { id: 'tx5',  type: 'deposit',  description: 'Freelance Payment',      amount:  850.00, status: 'completed', created_at: new Date(Date.now() - 5 * 86400000).toISOString(), from_account_id: 'ext', to_account_id: 'acc3' },
  { id: 'tx6',  type: 'fee',      description: 'Early Break Penalty',    amount:   12.50, status: 'completed', created_at: new Date(Date.now() - 6 * 86400000).toISOString(), from_account_id: 'acc1', to_account_id: 'ext' },
];

const mockLedger = [
  { id: 'l1', transaction_id: 'tx1abc123', account_type: 'main',  debit: 0,      credit: 2500, created_at: new Date().toISOString() },
  { id: 'l2', transaction_id: 'tx2def456', account_type: 'piggy', debit: 200,    credit: 0,    created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'l3', transaction_id: 'tx3ghi789', account_type: 'main',  debit: 45.50,  credit: 0,    created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'l4', transaction_id: 'tx4jkl012', account_type: 'main',  debit: 0,      credit: 50,   created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'l5', transaction_id: 'tx5mno345', account_type: 'main',  debit: 0,      credit: 850,  created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'l6', transaction_id: 'tx6pqr678', account_type: 'main',  debit: 12.50,  credit: 0,    created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
];

const mockSettings = [
  { key: 'interest_rate_flexible',  value: '1.5',  description: '% p.a. for flexible goals' },
  { key: 'interest_rate_30d',       value: '3.0',  description: '% p.a. for 30-day lock'    },
  { key: 'interest_rate_90d',       value: '4.5',  description: '% p.a. for 90-day lock'    },
  { key: 'early_break_penalty_pct', value: '5',    description: '% penalty for early break' },
  { key: 'max_piggy_goals',         value: '10',   description: 'Max goals per user'         },
];

type Tab = 'users' | 'transactions' | 'ledger' | 'settings';

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('users');
  const [transactions, setTransactions] = useState(mockTransactions);
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});
  const [userSearch, setUserSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const reverseTransaction = (id: string) => {
    setTransactions(ts => ts.map(t => t.id === id ? { ...t, status: 'reversed' } : t));
  };

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filteredUsers = mockUsers.filter(u =>
    u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const totalBalance = mockUsers.reduce((s, u) => s + u.balance, 0);
  const totalTxVolume = mockTransactions.reduce((s, t) => s + t.amount, 0);

  const tabs: { key: Tab; icon: typeof Shield; label: string }[] = [
    { key: 'users',        icon: Users,    label: 'Users'       },
    { key: 'transactions', icon: History,  label: 'Transactions'},
    { key: 'ledger',       icon: BookOpen, label: 'Ledger'      },
    { key: 'settings',     icon: Settings, label: 'Settings'    },
  ];

  return (
    <div className="px-6 xl:px-8 py-6 xl:py-8 max-w-[1400px] space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">System management & oversight</p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',   value: mockUsers.length,          icon: Users,       color: 'bg-primary/10 text-primary'   },
          { label: 'Total Balance', value: formatCurrency(totalBalance), icon: TrendingUp, color: 'bg-success/10 text-success'   },
          { label: 'Tx Volume',     value: formatCurrency(totalTxVolume), icon: ArrowUpRight, color: 'bg-info/10 text-info'       },
          { label: 'Transactions',  value: mockTransactions.length,   icon: History,     color: 'bg-warning/10 text-warning'   },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="glass rounded-2xl p-4">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2  lg:grid lg:grid-cols-4">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center w-full  gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              tab === key
                ? 'gradient-primary text-primary-foreground border-transparent shadow-glow'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-4">

          <div className="glass rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border bg-secondary/50">
              {['Name', 'Phone', 'Balance', 'Goals', 'Joined'].map(h => (
                <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{h}</p>
              ))}
            </div>
            {filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors items-center">
                <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                <p className="text-sm text-muted-foreground">{u.phone}</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">{formatCurrency(u.balance)}</p>
                <p className="text-sm text-muted-foreground">{u.goals} active</p>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {tab === 'transactions' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-border bg-secondary/50">
            {['Description', 'Type', 'Amount', 'Status', 'Date', 'Action'].map(h => (
              <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{h}</p>
            ))}
          </div>
          {transactions.map((tx, i) => (
            <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
              className="grid grid-cols-6 gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors items-center">
              <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground capitalize w-fit">{tx.type}</span>
              <p className="text-sm font-bold tabular-nums text-foreground">{formatCurrency(tx.amount)}</p>
              <div className="flex items-center gap-1.5">
                {tx.status === 'completed'
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                <span className={`text-xs font-medium ${tx.status === 'completed' ? 'text-success' : 'text-destructive'}`}>
                  {tx.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <div>
                {tx.status === 'completed' && tx.type !== 'reversal' ? (
                  <Button variant="ghost" size="sm" onClick={() => reverseTransaction(tx.id)}
                    className="text-destructive hover:bg-destructive/10 text-xs h-7 px-2 gap-1">
                    <RotateCcw className="w-3 h-3" /> Reverse
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* LEDGER */}
      {tab === 'ledger' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border bg-secondary/50">
            {['Date', 'Account Type', 'Transaction ID', 'Debit', 'Credit'].map(h => (
              <p key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{h}</p>
            ))}
          </div>
          {mockLedger.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * i }}
              className="grid grid-cols-5 gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors items-center">
              <p className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground capitalize w-fit">{entry.account_type}</span>
              <p className="text-xs text-muted-foreground font-mono truncate">{entry.transaction_id.slice(0, 10)}…</p>
              <p className={`text-sm font-bold tabular-nums ${entry.debit > 0 ? 'text-destructive' : 'text-muted-foreground/30'}`}>
                {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
              </p>
              <p className={`text-sm font-bold tabular-nums ${entry.credit > 0 ? 'text-success' : 'text-muted-foreground/30'}`}>
                {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockSettings.map(s => (
            <div key={s.key} className="glass rounded-2xl p-5 space-y-2">
              <div>
                <Label className="text-sm font-semibold text-foreground capitalize">
                  {s.key.replace(/_/g, ' ')}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
              </div>
              <Input
                value={settingValues[s.key] ?? s.value}
                onChange={e => setSettingValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button variant="hero" onClick={handleSaveSettings} className="gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : 'Save Settings'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

