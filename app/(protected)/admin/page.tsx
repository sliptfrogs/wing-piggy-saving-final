'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Shield,
  History,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminTransactions } from '@/hooks/api/useTransaction';
import { useUserRole } from '@/hooks/api/useUserRole';
import Loading from '@/components/ui/loading-custom';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

export default function AdminTransactions() {
  const router = useRouter();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading, error, refetch, isFetching } = useAdminTransactions(
    page,
    pageSize
  );

  // Redirect non‑admins in a useEffect
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/auth/unauthorized');
    }
  }, [roleLoading, isAdmin, router]);

  if (roleLoading || isLoading) {
    return <Loading />;
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">
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

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  const handleReverse = (transactionId: string) => {
    // TODO: Implement reverse API call
    console.log('Reverse transaction:', transactionId);
    // After reversing, refetch the list
    // refetch();
  };

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin – Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all platform transactions
          </p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Total Transactions
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalElements}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(
              transactions.reduce((sum, tx) => sum + tx.amount, 0)
            )}
          </p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Pages</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPages}</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-7 gap-3 px-5 py-3 border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <div>ID</div>
              <div>Date</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Counterparty</div>
              <div>Goal</div>
              <div>Action</div>
            </div>
            {transactions.map((tx, idx) => (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-7 gap-3 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors items-center"
              >
                <div
                  className="font-mono text-xs text-muted-foreground truncate"
                  title={tx.transaction_id}
                >
                  {tx.transaction_id.slice(0, 8)}…
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(tx.created_at)}
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      tx.transaction_type === 'GOAL_CONTRIBUTION'
                        ? 'bg-primary/10 text-primary'
                        : tx.transaction_type === 'P2P_TRANSFER'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-muted/20 text-muted-foreground'
                    )}
                  >
                    {tx.transaction_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="font-mono font-semibold text-foreground">
                  {formatCurrency(tx.amount)}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {tx.counterparty_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tx.counterparty_email}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {tx.goal_name || '—'}
                </div>
                <div>
                  {tx.status === 'COMPLETED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReverse(tx.transaction_id)}
                      className="text-destructive hover:bg-destructive/10 h-8 px-2 gap-1 text-xs"
                    >
                      <RotateCcw className="w-3 h-3" /> Reverse
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
            {transactions.length === 0 && (
              <div className="px-5 py-8 text-center text-muted-foreground">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="block lg:hidden space-y-3">
        {transactions.map((tx, idx) => (
          <motion.div
            key={tx.transaction_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass rounded-2xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tx.transaction_type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(tx.created_at)}
                </p>
              </div>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(tx.amount)}
              </p>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Counterparty</span>
                <span className="font-medium text-foreground">
                  {tx.counterparty_name}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">
                  {tx.counterparty_email}
                </span>
              </div>
              {tx.goal_name && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium text-foreground">
                    {tx.goal_name}
                  </span>
                </div>
              )}
            </div>
            {tx.status === 'COMPLETED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReverse(tx.transaction_id)}
                className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <RotateCcw className="w-3 h-3" /> Reverse Transaction
              </Button>
            )}
          </motion.div>
        ))}
        {transactions.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
            No transactions found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!hasPrev || isFetching}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!hasNext || isFetching}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
