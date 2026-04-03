'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Shield,
  History,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminTransactions } from '@/hooks/api/useTransaction';
import { useUserRole } from '@/hooks/api/useUserRole';
import Loading from '@/components/ui/loading-custom';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    COMPLETED: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: 'Completed',
      className: 'bg-success/10 text-success',
    },
    FAILED: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'Failed',
      className: 'bg-destructive/10 text-destructive',
    },
  }[status] ?? {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    className: 'bg-warning/10 text-warning',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const className =
    type === 'GOAL_CONTRIBUTION'
      ? 'bg-primary/10 text-primary'
      : type === 'P2P_TRANSFER'
        ? 'bg-accent/10 text-accent'
        : 'bg-muted/20 text-muted-foreground';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        className
      )}
    >
      {type.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminTransactions() {
  const router = useRouter();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading, error, refetch, isFetching } = useAdminTransactions(
    page,
    pageSize
  );

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/auth/unauthorized');
    }
  }, [roleLoading, isAdmin, router]);

  const handleReverse = (transactionId: string, amount: number) => {
    if (
      window.confirm(
        `Are you sure you want to reverse this transaction (${formatCurrency(amount)})? This action cannot be undone.`
      )
    ) {
      console.log('Reverse transaction:', transactionId);
      setTimeout(() => refetch(), 500);
    }
  };

  if (roleLoading || isLoading) return <Loading />;
  if (!isAdmin) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-destructive text-center">
          Failed to load transactions: {error.message}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const transactions = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.number || 0;
  const totalElements = data?.totalElements || 0;
  const currentPageVolume = transactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 max-w-[1400px] space-y-5 sm:space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                Admin – Transactions
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View and manage all platform transactions
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn('w-4 h-4', isFetching && 'animate-spin')}
            />
            <span>Refresh</span>
          </Button>
        </div>

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">
                Total Transactions
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {totalElements}
            </p>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Page Volume</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(currentPageVolume)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {transactions.length} of {totalElements} shown
            </p>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-5 xs:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-info" />
              <span className="text-xs text-muted-foreground">Pages</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {totalPages}
            </p>
          </div>
        </div>

        {/* ── Transaction List ────────────────────────────────────────── */}
        {/*
          Single unified layout:
          - Mobile  (<md):  stacked card rows
          - Tablet  (md):   two-column card grid
          - Desktop (lg+):  full table with all columns visible
        */}

        {/* Desktop table header — hidden below lg */}
        <div className="hidden lg:block glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {[
                    'ID',
                    'Date',
                    'Type',
                    'Status',
                    'Amount',
                    'Counterparty',
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {transactions.map((tx, idx) => (
                    <motion.tr
                      key={tx.transaction_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
                    >
                      <td
                        className="px-5 py-4 font-mono text-xs text-muted-foreground max-w-[80px] truncate"
                        title={tx.transaction_id}
                      >
                        {tx.transaction_id.slice(0, 8)}…
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <TypeBadge type={tx.transaction_type} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p
                          className="text-sm font-medium truncate"
                          title={tx.counterparty_name}
                        >
                          {tx.counterparty_name}
                        </p>
                        <p
                          className="text-xs text-muted-foreground truncate"
                          title={tx.counterparty_email}
                        >
                          {tx.counterparty_email}
                        </p>
                        {tx.goal_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            Goal: {tx.goal_name}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {tx.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleReverse(tx.transaction_id, tx.amount)
                            }
                            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 whitespace-nowrap"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reverse
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card grid — visible below lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
          <AnimatePresence>
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass rounded-2xl p-4 flex flex-col gap-3"
              >
                {/* Card top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <TypeBadge type={tx.transaction_type} />
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="text-lg font-bold text-foreground shrink-0">
                    {formatCurrency(tx.amount)}
                  </p>
                </div>

                {/* Date + ID */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tx.created_at)}
                  </span>
                  <span
                    className="text-xs font-mono text-muted-foreground truncate max-w-[140px]"
                    title={tx.transaction_id}
                  >
                    {tx.transaction_id.slice(0, 12)}…
                  </span>
                </div>

                {/* Counterparty details */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                    <p
                      className="font-medium text-foreground truncate"
                      title={tx.counterparty_name}
                    >
                      {tx.counterparty_name}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p
                      className="text-foreground truncate"
                      title={tx.counterparty_email}
                    >
                      {tx.counterparty_email}
                    </p>
                  </div>
                  {tx.goal_name && (
                    <div className="col-span-2 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Goal
                      </p>
                      <p className="text-foreground truncate">{tx.goal_name}</p>
                    </div>
                  )}
                </div>

                {/* Reverse button */}
                {tx.status === 'COMPLETED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReverse(tx.transaction_id, tx.amount)}
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reverse Transaction
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {transactions.length === 0 && (
            <div className="col-span-full glass rounded-2xl p-8 text-center text-muted-foreground">
              No transactions found.
            </div>
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={!hasPrev || isFetching}
              className="w-full sm:w-auto gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              {isFetching && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={!hasNext || isFetching}
              className="w-full sm:w-auto gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {totalElements > pageSize && (
          <p className="text-center text-xs text-muted-foreground">
            Showing {transactions.length} of {totalElements} transactions. Use
            pagination to view more.
          </p>
        )}
      </div>
    </div>
  );
}
