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
  Lock, EyeOff, AlertTriangle, Info, TrendingUp, Calendar, Target, ChevronRight
} from 'lucide-react';

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
  { id: 'i1', amount: 2.50,  created_at: new Date(Date.now() - 7  * 86400000).toISOString() },
  { id: 'i2', amount: 2.48,  created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 'i3', amount: 2.45,  created_at: new Date(Date.now() - 21 * 86400000).toISOString() },
  { id: 'i4', amount: 2.40,  created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
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

  return (
    <div className="px-6 xl:px-8 py-6 xl:py-8 max-w-[1400px] space-y-6">

      {/* Back */}
      <button
        onClick={() => router.push('/piggy')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goals
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >

        {/* ── LEFT COLUMN: hero card + actions ── */}
        <div className="space-y-4 xl:col-span-1">

          {/* Hero card */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center shrink-0">
                <PiggyBank className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">{goal.name}</h1>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                  goal.status === 'active'    ? 'bg-primary/10 text-primary' :
                  goal.status === 'completed' ? 'bg-success/10 text-success' :
                                               'bg-destructive/10 text-destructive'
                }`}>{goal.status}</span>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Current Balance</p>
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

            {/* Progress */}
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {goal.lock_period_days
                ? isLockExpired
                  ? '✅ Lock period completed'
                  : `${Math.round(progress)}% · ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                : `${Math.round(progress)}% funded`
              }
            </p>

            {goal.lock_period_days && !isLockExpired && (
              <div className="flex items-center gap-1.5 mt-3 text-warning text-xs">
                <Lock className="w-3 h-3" />
                Locked until {lockExpiry?.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Quick add */}
          {goal.status === 'active' && (
            <form onSubmit={handleQuickAdd} className="glass rounded-2xl p-5">
              <Label className="text-sm font-medium text-foreground mb-3 block">Add Money</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="bg-secondary border-border text-foreground"
                />
                <Button type="submit" variant="hero" disabled={adding} className="shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available: {formatCurrency(mockMainAccountBalance)}
              </p>
            </form>
          )}

          {/* Action buttons */}
          {goal.status === 'active' && (
            <div className="flex gap-2">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="w-4 h-4 mr-1.5" />
                {showQR ? 'Hide QR' : 'Show QR'}
              </Button>

              {isLockExpired ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={breaking}>
                      <Hammer className="w-4 h-4 mr-1.5" /> Break
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Break "{goal.name} "?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The lock period has ended.{' '}
                        {isHidden ? 'Your full balance will be returned.' : <>You wll receive <span className="font-semibold text-foreground">{formatCurrency(balance)}</span> back.</>}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={executeBreak} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {breaking ? 'Breaking...' : 'Break Piggy'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" disabled={breaking}>
                      <Hammer className="w-4 h-4 mr-1.5" /> Force Break
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" /> Early Break Warning
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
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
                          <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Saving</AlertDialogCancel>
                      <AlertDialogAction onClick={executeBreak} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {breaking ? 'Breaking...' : 'Force Break & Pay Penalty'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}

          {/* QR code panel */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass rounded-2xl p-6 flex flex-col items-center gap-3"
            >
              <p className="text-sm font-medium text-foreground">Scan to Contribute</p>
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={qrPayload} size={160} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                QR for <span className="font-semibold text-foreground">{goal.name}</span> · Expires in 10 min
              </p>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT COLUMN: stats + interest history ── */}
        <div className="space-y-4 xl:col-span-2">

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                label: 'Target',
                value: isHidden ? '••••••' : formatCurrency(goal.target_amount),
                sub: isHidden ? '' : `${formatCurrency(goal.target_amount - balance)} to go`,
              },
              {
                icon: Calendar,
                label: goal.lock_period_days ? 'Lock Period' : 'Created',
                value: goal.lock_period_days ? `${goal.lock_period_days} days` : new Date(goal.created_at).toLocaleDateString(),
                sub: goal.lock_period_days
                  ? isLockExpired ? 'Completed' : `${daysRemaining}d remaining`
                  : '',
              },
              {
                icon: TrendingUp,
                label: 'Interest Earned',
                value: isHidden ? '••••••' : formatCurrency(totalInterest),
                sub: `${mockInterestHistory.length} payments`,
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
                </div>
                <p className="text-xl font-display font-bold text-foreground">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

          {/* Interest history table */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-foreground">Interest History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Recent interest payments</p>
              </div>
              <span className="text-xs text-muted-foreground">{mockInterestHistory.length} payments</span>
            </div>

            {mockInterestHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No interest payments yet</p>
            ) : (
              <div className="space-y-1">
                {mockInterestHistory.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Interest Payment</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary tabular-nums">
                      +{isHidden ? '••••' : formatCurrency(entry.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total Earned</span>
              <span className="text-sm font-bold text-primary tabular-nums">
                +{isHidden ? '••••' : formatCurrency(totalInterest)}
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
