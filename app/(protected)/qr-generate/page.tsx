"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PiggyBank, Wallet, Download, Share2, RefreshCw, TrendingUp, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  useMainAccount } from '@/hooks/api/useAccount';
import { useQRCode } from '@/hooks/api/useQr';
import { usePiggyGoals } from '@/hooks/api/usePiggyGoal';

type QRTarget = 'main' | 'piggy';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function QRGenerator() {
  // ========== UI State ==========
  const [target, setTarget] = useState<QRTarget>('main');
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Fetch piggy accounts
  const {
    data: piggyAccounts,
    isLoading: piggyLoading,
    error: piggyError,
  } = usePiggyGoals();

  // Fetch main account
  const {
    data: mainAccount,
    isLoading: mainAccountIsLoading,
    error: mainAccountError,
  } = useMainAccount();

  // Transform piggy API data
  const activeGoals = (piggyAccounts || []).map(account => ({
    id: account.id,
    name: account.name,
    target_amount: account.target_amount,
    balance: account.current_balance,
    account_number: account.account_number,
  }));

  const selectedGoal = activeGoals.find(g => g.id === selectedGoalId);
  const goalBalance = selectedGoal?.balance || 0;
  const goalProgress = selectedGoal
    ? Math.round((goalBalance / selectedGoal.target_amount) * 100)
    : 0;

  // Determine QR type and parameters
  const qrType = target === 'main' ? 'p2p' : 'contribute';
  const qrAccountNumber = target === 'piggy' ? selectedGoal?.account_number : undefined;

  // Fetch QR code image using TanStack Query
  const {
    data: qrImageUrl,
    isLoading: qrLoading,
    error: qrError,
    refetch: refetchQR,
  } = useQRCode(qrType, qrAccountNumber);

  // Cleanup object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (qrImageUrl) URL.revokeObjectURL(qrImageUrl);
    };
  }, [qrImageUrl]);

  const showQR = target === 'main' || !!selectedGoal;
  const shouldRenderQR = typeof window !== 'undefined' && showQR;

  const handleRefresh = () => {
    refetchQR();
  };

  // ========== Loading/Error states ==========
  if (piggyLoading || mainAccountIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading your accounts...</div>
      </div>
    );
  }

  if (piggyError || mainAccountError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>Error loading accounts: {piggyError?.message || mainAccountError?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========== Render ==========
  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My QR Code</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Share your QR to receive money or contributions
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: controls */}
        <div className="space-y-4 xl:col-span-3">
          {/* Receive-to selector */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Receive to
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                {
                  type: 'main' as QRTarget,
                  icon: Wallet,
                  label: 'Main Account',
                  sub: formatCurrency(mainAccount?.current_balance || 0),
                },
                {
                  type: 'piggy' as QRTarget,
                  icon: PiggyBank,
                  label: 'Piggy Goal',
                  sub: `${activeGoals.length} active`,
                },
              ]).map(({ type: t, icon: Icon, label, sub }) => (
                <button
                  key={t}
                  onClick={() => {
                    setTarget(t);
                    setSelectedGoalId('');
                  }}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left ${target === t
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-background hover:border-primary/20'
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${target === t
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-semibold leading-tight ${target === t ? 'text-primary' : 'text-foreground'
                      }`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piggy goal selector */}
          <AnimatePresence>
            {target === 'piggy' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-2xl p-5 space-y-3"
              >
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Select Goal
                </Label>
                <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                  <SelectTrigger className="w-full bg-secondary border-border text-foreground">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-primary shrink-0" />
                      <SelectValue placeholder="Choose a piggy goal" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {activeGoals.map(g => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="flex items-center gap-2">{g.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected goal progress preview */}
                {selectedGoal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-border bg-background p-3 space-y-2"
                  >
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(goalBalance)}</span>
                      <span>{formatCurrency(selectedGoal.target_amount)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goalProgress}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <TrendingUp className="w-3 h-3" /> {goalProgress}% funded
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: QR display */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {shouldRenderQR ? (
              <motion.div
                key={`${target}-${selectedGoalId}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5"
              >
                {/* Label */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    {target === 'main' ? (
                      <Wallet className="w-3.5 h-3.5" />
                    ) : (
                      <PiggyBank className="w-3.5 h-3.5" />
                    )}
                    {target === 'main' ? 'Main Account' : selectedGoal?.name}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {target === 'main'
                      ? 'Scan to send money to my main account'
                      : `Scan to contribute to "${selectedGoal?.name}"`}
                  </p>
                </div>

                {/* QR Code Image */}
                <div className="relative">
                  {/* QR image */}
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Code"
                      className="w-[220px] h-[220px] object-contain bg-white rounded-2xl shadow-sm"
                    />
                  ) : (
                    <div className="bg-white p-5 rounded-2xl shadow-sm w-[220px] h-[220px] flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
                    </div>
                  )}

                  {/* Loading overlay – only show when loading but we already have an image */}
                  {qrLoading && qrImageUrl && (
                    <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Modern L‑shaped corners */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/90 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/90 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/90 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/90 rounded-br-lg" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full max-w-xs">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                  <Button
                    variant="hero"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> New QR
                  </Button>
                </div>
              </motion.div>
            ) : showQR ? (
              // Placeholder while loading on client
              <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-5">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    {target === 'main' ? (
                      <Wallet className="w-3.5 h-3.5" />
                    ) : (
                      <PiggyBank className="w-3.5 h-3.5" />
                    )}
                    {target === 'main' ? 'Main Account' : selectedGoal?.name}
                  </div>
                  <p className="text-sm text-muted-foreground">Loading QR code...</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm w-[220px] h-[220px] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-secondary animate-pulse" />
                </div>
              </div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-12 flex flex-col items-center gap-4 text-center border-2 border-dashed border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                  <PiggyBank className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Select a goal</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a piggy goal on the left to generate your QR
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Account summary strip */}
          {showQR && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(target === 'main'
                ? [
                  { label: 'Account', value: 'Main Account' },
                  { label: 'Balance', value: formatCurrency(mainAccount?.current_balance || 0) },
                  { label: 'Currency', value: mainAccount?.currency || 'USD' },
                ]
                : selectedGoal
                  ? [
                    { label: 'Goal', value: selectedGoal.name },
                    { label: 'Saved', value: formatCurrency(goalBalance) },
                    { label: 'Progress', value: `${goalProgress}%` },
                  ]
                  : []
              ).map(({ label, value }) => (
                <div key={label} className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
