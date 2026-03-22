"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, PiggyBank, Lock, EyeOff, ChevronRight, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const mockPiggyGoals = [
  { id: '1', name: 'New Laptop',     target_amount: 1500,  status: 'active',    hide_balance: false, lock_period_days: null, created_at: new Date().toISOString(),                       accounts: [{ balance: 890.25   }] },
  { id: '2', name: 'Vacation Fund',  target_amount: 3000,  status: 'active',    hide_balance: false, lock_period_days: 90,   created_at: new Date(Date.now() - 30 * 86400000).toISOString(), accounts: [{ balance: 1250.00  }] },
  { id: '3', name: 'Emergency Fund', target_amount: 5000,  status: 'active',    hide_balance: false, lock_period_days: null, created_at: new Date().toISOString(),                       accounts: [{ balance: 2100.00  }] },
  { id: '4', name: 'Wedding Fund',   target_amount: 10000, status: 'completed', hide_balance: false, lock_period_days: null, created_at: new Date().toISOString(),                       accounts: [{ balance: 10000.00 }] },
  { id: '5', name: 'Rainy Day Fund', target_amount: 2000,  status: 'broken',    hide_balance: true,  lock_period_days: null, created_at: new Date().toISOString(),                       accounts: [{ balance: 0        }] },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active:    { label: 'Active',    color: 'bg-primary/10 text-primary border-primary/20',       icon: <TrendingUp className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-success/10 text-success border-success/20',       icon: <CheckCircle2 className="w-3 h-3" /> },
  broken:    { label: 'Broken',    color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="w-3 h-3" /> },
};

export default function PiggyList() {
  const router = useRouter();
  const goals = mockPiggyGoals;

  const active    = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const broken    = goals.filter(g => g.status === 'broken');

  const totalSaved = active.reduce((sum, g) => sum + (g.accounts?.[0]?.balance || 0), 0);
  const totalTarget = active.reduce((sum, g) => sum + g.target_amount, 0);

  return (
    <div className="px-6 xl:px-8 py-6 xl:py-8 space-y-8 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Saving Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{active.length} active · {completed.length} completed</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => router.push('/piggy/create')}>
          <Plus className="w-4 h-4 mr-1" /> New Goal
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Saved',    value: formatCurrency(totalSaved),  sub: `of ${formatCurrency(totalTarget)} target` },
          { label: 'Active Goals',   value: active.length,               sub: `${completed.length} completed` },
          { label: 'Overall Progress', value: `${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%`, sub: 'across all active goals' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * i }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-12 text-center">
          <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">No Goals Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first saving goal to start!</p>
          <Button variant="hero" onClick={() => router.push('/piggy/create')}>
            <Plus className="w-4 h-4 mr-1" /> Create Goal
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-8">

          {/* Active goals — card grid */}
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Active</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((goal, i) => {
                  const balance = goal.accounts?.[0]?.balance || 0;
                  let progress = 0;
                  if (goal.lock_period_days) {
                    const elapsed = Date.now() - new Date(goal.created_at).getTime();
                    progress = Math.min((elapsed / (goal.lock_period_days * 86400000)) * 100, 100);
                  } else {
                    progress = goal.target_amount > 0 ? (balance / goal.target_amount) * 100 : 0;
                  }
                  const nearDone = progress >= 75;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i }}
                      onClick={() => router.push(`/piggy/${goal.id}`)}
                      className="glass rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${nearDone ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                            <PiggyBank className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-foreground text-sm">{goal.name}</span>
                              {goal.lock_period_days && <Lock className="w-3 h-3 text-warning shrink-0" />}
                              {goal.hide_balance && <EyeOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {goal.lock_period_days ? `${goal.lock_period_days}-day lock` : 'Flexible'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                      </div>

                      {/* Amount */}
                      <div className="mb-3">
                        <span className="text-2xl font-display font-bold text-foreground">
                          {goal.hide_balance ? '••••••' : formatCurrency(balance)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1.5">
                          of {goal.hide_balance ? '••••••' : formatCurrency(goal.target_amount)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }}
                          className={`h-full rounded-full ${nearDone ? 'gradient-primary' : 'bg-muted-foreground/40'}`}
                        />
                      </div>
                      <p className={`text-xs font-semibold tabular-nums ${nearDone ? 'text-primary' : 'text-muted-foreground'}`}>
                        {Math.round(progress)}% {goal.lock_period_days ? 'time elapsed' : 'saved'}
                      </p>
                    </motion.div>
                  );
                })}

                {/* Add new card */}
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * active.length }}
                  onClick={() => router.push('/piggy/create')}
                  className="rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex flex-col items-center justify-center gap-2 p-5 min-h-[180px]"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm font-medium">New Goal</span>
                </motion.button>
              </div>
            </section>
          )}

          {/* Completed + Broken — compact list */}
          {(completed.length > 0 || broken.length > 0) && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Past Goals</h2>
              <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
                {[...completed, ...broken].map((goal, i) => {
                  const balance = goal.accounts?.[0]?.balance || 0;
                  const cfg = statusConfig[goal.status];
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => router.push(`/piggy/${goal.id}`)}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm truncate">{goal.name}</span>
                          {goal.hide_balance && <EyeOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Target: {formatCurrency(goal.target_amount)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {goal.hide_balance ? '••••••' : formatCurrency(balance)}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-0.5 ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
