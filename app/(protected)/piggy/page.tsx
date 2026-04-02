'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Plus,
  PiggyBank,
  Lock,
  EyeOff,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Globe,
  LockKeyhole,
} from 'lucide-react';
import { usePiggyGoals } from '@/hooks/api/usePiggyGoal'; 

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  active: {
    label: 'Active',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: <TrendingUp className="w-3 h-3" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-success/10 text-success border-success/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  broken: {
    label: 'Broken',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: <XCircle className="w-3 h-3" />,
  },
};

const mapStatus = (apiStatus: string): string => {
  switch (apiStatus?.toUpperCase()) {
    case 'ACTIVE':
      return 'active';
    case 'COMPLETED':
      return 'completed';
    case 'BROKEN':
      return 'broken';
    default:
      return 'active';
  }
};

const formatLockExpiration = (expiresAt: string | null): string | null => {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return 'Lock expired';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `Locked for ${days} more day${days !== 1 ? 's' : ''}`;
};

export default function PiggyList() {
  const router = useRouter();

  // Use the new hook
  const {
    data: piggyGoals,
    isLoading: piggyLoading,
    error: piggyError,
  } = usePiggyGoals();

  // Map the new data structure to the UI shape
  const goals = (piggyGoals || []).map((goal) => ({
    id: goal.id,
    accountNumber: goal.account_number,
    name: goal.name,
    target_amount: goal.target_amount,
    status: mapStatus(goal.status),
    hide_balance: goal.hide_balance ?? false,
    isPublic: goal.is_public,
    lockExpiresAt: goal.lock_expires_at,
    lockDescription: formatLockExpiration(goal.lock_expires_at),
    created_at: goal.created_at,
    balance: goal.current_balance,
  }));

  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');
  const broken = goals.filter((g) => g.status === 'broken');

  const totalSaved = active.reduce((sum, g) => sum + g.balance, 0);
  const totalTarget = active.reduce((sum, g) => sum + g.target_amount, 0);

  if (piggyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading your piggy goals...</div>
      </div>
    );
  }

  if (piggyError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>Failed to load goals: {piggyError.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Saving Goals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <Button
          variant="hero"
          size="sm"
          onClick={() => router.push('/piggy/create')}
        >
          <Plus className="w-4 h-4 mr-1" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Saved',
            value: formatCurrency(totalSaved),
            sub: `of ${formatCurrency(totalTarget)} target`,
          },
          {
            label: 'Active Goals',
            value: active.length,
            sub: `${completed.length} completed`,
          },
          {
            label: 'Overall Progress',
            value: `${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%`,
            sub: 'across all active goals',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * i }}
            className="glass  rounded-2xl p-5"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass  rounded-2xl p-12 text-center"
        >
          <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold text-foreground mb-1">
            No Goals Yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first saving goal to start!
          </p>
          <Button variant="hero" onClick={() => router.push('/piggy/create')}>
            <Plus className="w-4 h-4 mr-1" /> Create Goal
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Active
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map((goal, i) => {
                  const balance = goal.balance;
                  const progress =
                    goal.target_amount > 0
                      ? (balance / goal.target_amount) * 100
                      : 0;
                  const nearDone = progress >= 75;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 * i }}
                      onClick={() =>
                        router.push(`/piggy/${goal.accountNumber}`)
                      }
                      className="glass  rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 border border-gray-500/10 h-9 rounded-xl flex items-center justify-center shrink-0 ${nearDone ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}`}
                          >
                            <PiggyBank className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-foreground text-sm">
                                {goal.name}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${goal.isPublic ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}
                              >
                                {goal.isPublic ? (
                                  <Globe className="w-2.5 h-2.5" />
                                ) : (
                                  <LockKeyhole className="w-2.5 h-2.5" />
                                )}
                                {goal.isPublic ? 'Public' : 'Private'}
                              </span>
                              {goal.lockExpiresAt && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                                  <Lock className="w-2.5 h-2.5" />
                                  Locked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {goal.lockDescription ?? 'Flexible'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                      </div>

                      <div className="mb-3">
                        <span className="text-2xl font-display font-bold text-foreground">
                          {goal.hide_balance && goal.status === 'active'
                            ? '••••••'
                            : formatCurrency(balance)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1.5">
                          of{' '}
                          {goal.hide_balance && goal.status === 'active'
                            ? '••••••'
                            : formatCurrency(goal.target_amount)}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{
                            duration: 0.9,
                            delay: 0.1 * i,
                            ease: 'easeOut',
                          }}
                          className={`h-full rounded-full ${nearDone ? 'gradient-primary' : 'bg-muted-foreground/40'}`}
                        />
                      </div>
                      <p
                        className={`text-xs font-semibold tabular-nums ${nearDone ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {Math.round(progress)}% saved
                      </p>
                    </motion.div>
                  );
                })}
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

          {(completed.length > 0 || broken.length > 0) && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Past Goals
              </h2>
              <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
                {[...completed, ...broken].map((goal, i) => {
                  const cfg = statusConfig[goal.status];
                  const balance = goal.balance;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() =>
                        router.push(`/piggy/${goal.accountNumber}`)
                      }
                      className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 cursor-pointer transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground text-sm truncate">
                            {goal.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${goal.isPublic ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}
                          >
                            {goal.isPublic ? (
                              <Globe className="w-2.5 h-2.5" />
                            ) : (
                              <LockKeyhole className="w-2.5 h-2.5" />
                            )}
                            {goal.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Target: {formatCurrency(goal.target_amount)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {goal.hide_balance && goal.status === 'active'
                            ? '••••••'
                            : formatCurrency(balance)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-0.5 ${cfg.color}`}
                        >
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
