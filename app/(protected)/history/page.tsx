"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownLeft, Users, Heart, RotateCcw,
  Percent, Hammer, Filter, ArrowUpDown, ShieldCheck,
  TrendingUp, TrendingDown, Search, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey    = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FilterType = 'all' | 'transfer' | 'p2p' | 'contribution' | 'deposit' | 'interest' | 'fee' | 'break' | 'reversal';

const typeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; label: string; credit: boolean }> = {
  transfer:     { icon: ArrowUpRight,  color: 'bg-primary/10 text-primary',       label: 'Transfer',     credit: false },
  p2p:          { icon: Users,         color: 'bg-info/10 text-info',             label: 'P2P',          credit: false },
  contribution: { icon: Heart,         color: 'bg-accent/10 text-accent',         label: 'Contribution', credit: false },
  deposit:      { icon: ArrowDownLeft, color: 'bg-success/10 text-success',       label: 'Deposit',      credit: true  },
  interest:     { icon: Percent,       color: 'bg-warning/10 text-warning',       label: 'Interest',     credit: true  },
  fee:          { icon: RotateCcw,     color: 'bg-destructive/10 text-destructive', label: 'Fee',        credit: false },
  break:        { icon: Hammer,        color: 'bg-destructive/10 text-destructive', label: 'Break',      credit: true  },
  reversal:     { icon: RotateCcw,     color: 'bg-muted text-muted-foreground',   label: 'Reversal',     credit: true  },
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockAccountId = 'acc-main';

const mockTransactions = [
  { id: 'tx1',  type: 'deposit',      description: 'Salary Deposit',           amount: 2500.00, status: 'completed', created_at: new Date().toISOString(),                         from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx2',  type: 'transfer',     description: 'Transfer to New Laptop',   amount:  200.00, status: 'completed', created_at: new Date(Date.now() - 1  * 86400000).toISOString(), from_account_id: mockAccountId, to_account_id: 'acc-piggy' },
  { id: 'tx3',  type: 'p2p',          description: 'Paid Jane Smith',          amount:   45.50, status: 'completed', created_at: new Date(Date.now() - 2  * 86400000).toISOString(), from_account_id: mockAccountId, to_account_id: 'ext' },
  { id: 'tx4',  type: 'contribution', description: 'Gift from David Lee',      amount:  100.00, status: 'completed', created_at: new Date(Date.now() - 3  * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx5',  type: 'interest',     description: 'Vacation Fund Interest',   amount:    2.50, status: 'completed', created_at: new Date(Date.now() - 5  * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx6',  type: 'deposit',      description: 'Freelance Payment',        amount:  850.00, status: 'completed', created_at: new Date(Date.now() - 7  * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx7',  type: 'fee',          description: 'Early Break Penalty',      amount:   12.50, status: 'completed', created_at: new Date(Date.now() - 8  * 86400000).toISOString(), from_account_id: mockAccountId, to_account_id: 'ext' },
  { id: 'tx8',  type: 'p2p',          description: 'Paid Alex Johnson',        amount:   30.00, status: 'completed', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), from_account_id: mockAccountId, to_account_id: 'ext' },
  { id: 'tx9',  type: 'break',        description: 'Broke Emergency Fund',     amount:  500.00, status: 'completed', created_at: new Date(Date.now() - 12 * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx10', type: 'transfer',     description: 'Transfer to Vacation',     amount:  150.00, status: 'completed', created_at: new Date(Date.now() - 14 * 86400000).toISOString(), from_account_id: mockAccountId, to_account_id: 'acc-piggy' },
  { id: 'tx11', type: 'reversal',     description: 'Reversed Transfer',        amount:   50.00, status: 'reversed',  created_at: new Date(Date.now() - 15 * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
  { id: 'tx12', type: 'deposit',      description: 'Refund',                   amount:   30.00, status: 'completed', created_at: new Date(Date.now() - 18 * 86400000).toISOString(), from_account_id: 'ext', to_account_id: mockAccountId },
];

// ── Summary stats ─────────────────────────────────────────────────────────────

function getSummary(txs: typeof mockTransactions) {
  const totalIn  = txs.filter(t => t.to_account_id   === mockAccountId).reduce((s, t) => s + t.amount, 0);
  const totalOut = txs.filter(t => t.from_account_id === mockAccountId).reduce((s, t) => s + t.amount, 0);
  return { totalIn, totalOut, net: totalIn - totalOut, count: txs.length };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TransactionHistory() {
  const [sortKey,     setSortKey]     = useState<SortKey>('date-desc');
  const [filterType,  setFilterType]  = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = filterType === 'all'
      ? mockTransactions
      : mockTransactions.filter(tx => tx.type === filterType);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(tx => tx.description.toLowerCase().includes(q) || tx.type.includes(q));
    }

    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'date-asc':    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc':  return a.amount - b.amount;
        default:            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [sortKey, filterType, searchQuery]);

  const summary = useMemo(() => getSummary(filtered), [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(tx => {
      const key = new Date(tx.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });
    return map;
  }, [filtered]);

  return (
    <div className="px-6 xl:px-8 py-6 xl:py-8 max-w-[1400px] space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Transaction History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{mockTransactions.length} total transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total In',  value: formatCurrency(summary.totalIn),  icon: TrendingUp,   color: 'bg-success/10 text-success'   },
          { label: 'Total Out', value: formatCurrency(summary.totalOut), icon: TrendingDown, color: 'bg-destructive/10 text-destructive' },
          { label: 'Net',       value: formatCurrency(summary.net),      icon: ArrowUpDown,  color: summary.net >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive' },
          { label: 'Shown',     value: `${summary.count} tx`,            icon: Filter,       color: 'bg-secondary text-muted-foreground' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass rounded-2xl p-4"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── LEFT: filters sidebar ── */}
        <aside className="xl:col-span-1 space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Filter & Sort</p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search transactions…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-border text-foreground text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type filter chips */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {(['all', ...Object.keys(typeConfig)] as FilterType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      filterType === type
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {type === 'all' ? 'All' : typeConfig[type]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Sort by</p>
              <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                <SelectTrigger className="h-9 text-xs bg-secondary border-border text-foreground">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear */}
            {(filterType !== 'all' || searchQuery) && (
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setFilterType('all'); setSearchQuery(''); }}>
                <X className="w-3.5 h-3.5 mr-1.5" /> Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* ── RIGHT: transaction list ── */}
        <div className="xl:col-span-3">
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-foreground text-sm">
                {filterType !== 'all' || searchQuery ? 'No transactions match your filters' : 'No transactions yet'}
              </p>
              {(filterType !== 'all' || searchQuery) && (
                <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={() => { setFilterType('all'); setSearchQuery(''); }}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([date, txs]) => (
                <div key={date}>
                  {/* Date group header */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">{date}</p>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground shrink-0">{txs.length} tx</span>
                  </div>

                  <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
                    {txs.map((tx, i) => {
                      const cfg     = typeConfig[tx.type] || typeConfig.transfer;
                      const Icon    = cfg.icon;
                      const isCredit = tx.to_account_id === mockAccountId;

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.02 * Math.min(i, 10) }}
                          className="flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Description */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{tx.description || cfg.label}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                tx.status === 'completed' ? 'bg-success/10 text-success' :
                                tx.status === 'reversed'  ? 'bg-destructive/10 text-destructive' :
                                'bg-secondary text-muted-foreground'
                              }`}>
                                {tx.status}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                                typeConfig[tx.type]?.color ?? 'bg-secondary text-muted-foreground'
                              }`}>
                                {cfg.label}
                              </span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold tabular-nums ${isCredit ? 'text-success' : 'text-foreground'}`}>
                              {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
