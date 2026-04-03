'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  PiggyBank,
  Wallet,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  Loader2,
  Globe,
  LockKeyhole,
  CreditCard,
  ScanLine,
  Copy,
  Check,
  QrCode,
  ChevronRight,
  CircleCheck,
  DollarSign,
  Dot,
  EllipsisVertical,
  ChevronDown,
} from 'lucide-react';
import { Select } from 'antd';
import { useMainAccount } from '@/hooks/api/useAccount';
import { useQRCode } from '@/hooks/api/useQr';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import Loading from '@/components/ui/loading-custom';
import ErrorPage from '@/components/ui/error-custom';
import { usePiggyGoalsByUserIdAndStatus } from '@/hooks/api/usePiggyGoal';

type QRTarget = 'main' | 'piggy';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

export default function QRGenerator() {
  const { toast } = useToast();
  const [target, setTarget] = useState<QRTarget>('main');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Fetch piggy accounts
  const {
    data: piggyAccounts,
    isLoading: piggyLoading,
    error: piggyError,
  } = usePiggyGoalsByUserIdAndStatus('ACTIVE');

  // Fetch main account
  const {
    data: mainAccount,
    isLoading: mainAccountIsLoading,
    error: mainAccountError,
  } = useMainAccount();

  // Transform piggy API data
  const activeGoals = (piggyAccounts || []).map((account) => ({
    id: account.id,
    name: account.name,
    target_amount: account.target_amount,
    balance: account.current_balance,
    account_number: account.account_number,
    is_public: account.is_public,
    hide_balance: account.hide_balance,
    status: account.status,
  }));

  const selectedGoal = activeGoals.find((g) => g.id === selectedGoalId);
  const goalBalance = selectedGoal?.balance || 0;
  const goalProgress = selectedGoal
    ? Math.round((goalBalance / selectedGoal.target_amount) * 100)
    : 0;

  // Determine QR type and parameters
  const qrType = target === 'main' ? 'p2p' : 'contribute';
  const qrAccountNumber =
    target === 'piggy' && selectedGoal?.account_number
      ? selectedGoal.account_number
      : undefined;

  // Fetch QR code image
  const {
    data: qrImageUrl,
    isLoading: qrLoading,
    error: qrError,
    refetch: refetchQR,
  } = useQRCode(qrType, qrAccountNumber);

  const isQRReady = !!qrImageUrl && !qrLoading && !qrError;

  // Auto-select first goal when switching to piggy mode (if any)
  // This effect is safe: it only runs when target or activeGoals changes,
  // and the condition !selectedGoalId prevents infinite loops.
  useEffect(() => {
    if (target === 'piggy' && activeGoals.length > 0 && !selectedGoalId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedGoalId(activeGoals[0].id);
    }
  }, [target, activeGoals, selectedGoalId]);

  const handleSaveQR = async () => {
    if (!qrContainerRef.current) return;
    try {
      const canvas = await html2canvas(qrContainerRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `qr-${target === 'main' ? 'main' : selectedGoal?.name || 'piggy'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({
        title: 'QR Code Saved',
        description: 'QR code has been downloaded to your device.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShareQR = async () => {
    if (!qrContainerRef.current) return;
    try {
      const canvas = await html2canvas(qrContainerRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });
      const file = new File(
        [blob],
        `qr-${target === 'main' ? 'main' : selectedGoal?.name || 'piggy'}.png`,
        { type: 'image/png' }
      );

      if (navigator.share) {
        await navigator.share({
          title: 'My QR Code',
          text: `Scan this QR code to send money to my ${target === 'main' ? 'main account' : `piggy goal: ${selectedGoal?.name}`}`,
          files: [file],
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({
            [file.type]: file,
          }),
        ]);
        toast({
          title: 'QR Code Copied',
          description: 'QR code has been copied to clipboard.',
        });
      }
    } catch (error) {
      toast({
        title: 'Share Failed',
        description: 'Could not share QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Number Copied',
      description: 'Account number copied to clipboard.',
    });
  };

  // ========== Loading/Error states ==========
  if (piggyLoading || mainAccountIsLoading) {
    return <Loading />;
  }

  if (piggyError) {
    return (
      <ErrorPage error={piggyError} reset={() => window.location.reload()} />
    );
  }
  if (mainAccountError) {
    return (
      <ErrorPage
        error={mainAccountError}
        reset={() => window.location.reload()}
      />
    );
  }

  // ========== Render ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900">
      <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            My QR Code
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Share your QR to receive money or contributions instantly
          </p>
        </div>

        {/* Two‑column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN – controls */}
          <div className="space-y-6">
            {/* Receive-to selector */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-sm p-6 transition-all hover:shadow-md">
              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4" /> Receive to
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
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
                ].map(({ type: t, icon: Icon, label, sub }) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTarget(t);
                      if (t === 'main') setSelectedGoalId('');
                    }}
                    className={`group relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left overflow-hidden ${
                      target === t
                        ? 'border-blue-500/60 bg-blue-500/10 shadow-sm'
                        : 'border-gray-800 bg-gray-950/50 hover:border-blue-500/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        target === t
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN – QR display */}
          <div className="flex flex-col items-center gap-6">
            {/* QR Card */}
            <div
              ref={qrContainerRef}
              className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-lg p-6 w-full max-w-sm flex flex-col items-center transition-all hover:shadow-xl"
            >
              {/* QR Frame */}
              <div className=" w-full  rounded-xl relative overflow-hidden flex items-center justify-center border  shadow-inner">
                {isQRReady && qrImageUrl ? (
                  <>
                    <Image
                      src={qrImageUrl}
                      alt="Payment QR Code"
                      width={300}
                      height={300}
                      className="object-contain w-full"
                      unoptimized
                    />
                    {/* Center Badge */}
                    <div className="absolute p-3 rounded-full bg-gray-900 border-4  border-white flex items-center justify-center shadow-sm">
                      {target === 'main' ? (
                        <DollarSign className="w-6 h-6 text-white" />
                      ) : (
                        <PiggyBank className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </>
                ) : qrLoading ? (
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-gray-800/50" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                        <p className="text-xs text-gray-400">
                          Generating QR...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : target === 'piggy' && activeGoals.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-white">
                      No piggy goals
                    </p>
                    <p className="text-xs text-gray-400">
                      Create a saving goal first to receive contributions.
                    </p>
                  </div>
                ) : target === 'piggy' && !selectedGoal ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950">
                    <div className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-1 px-4 text-center">
                      <p className="text-sm font-medium text-white">
                        Select a goal
                      </p>
                      <p className="text-xs text-gray-400">
                        Choose a piggy goal from the left panel.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-700 rounded-xl bg-gray-950">
                    <div className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-1 px-4 text-center">
                      <p className="text-sm font-medium text-white">
                        QR unavailable
                      </p>
                      <p className="text-xs text-gray-400">
                        Try refreshing or check your connection
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-800 my-5" />

              {/* Meta Information */}
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Name + Verified Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-semibold text-white">
                    {target === 'main'
                      ? `${mainAccount?.username || 'Unknown'} • ${formatCurrency(mainAccount?.current_balance || 0)}`
                      : selectedGoal
                        ? `${selectedGoal.name} `
                        : 'Select a goal'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex  items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20`}
                    >
                      <Globe className="w-2.5 h-2.5" />
                      Public
                    </span>
                  </div>
                </div>

                {/* KHQR Network Badge */}
                <div className="flex items-center gap-1.5 px-3 ">
                  {/* Piggy goal selector – only visible when target === 'piggy' */}
                  {target === 'piggy' && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.25 }}
                      className="w-full "
                    >
                      {activeGoals.length > 0 ? (
                        <div className="flex  items-center justify-between w-full px-3 py-2 rounded-xl bg-gray-800/30 border border-gray-800">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <PiggyBank className="w-5 h-5 text-blue-400" />
                          </div>
                          <Select
                            value={selectedGoalId}
                            onChange={(value) => setSelectedGoalId(value)}
                            className="w-[20em] "
                            styles={{
                              popup: {
                                root: {
                                  backgroundColor: '#0f0f10',
                                  borderColor: '#1f2937',
                                  borderRadius: '0',
                                  boxShadow:
                                    '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                                },
                              },
                            }}
                            optionLabelProp="label"
                            variant="borderless"
                            suffixIcon={
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            }
                          >
                            {activeGoals.map((g) => {
                              return (
                                <Select.Option
                                  key={g.id}
                                  value={g.id}
                                  label={
                                    <div className="flex  flex-col">
                                      <span className="text-xs text-white/40">
                                        Receiving to
                                      </span>
                                      <span className="text-sm font-medium text-white">
                                        {g.account_number}
                                      </span>
                                    </div>
                                  }
                                  className="!p-0 !m-0"
                                >
                                  <div
                                    className={cn(
                                      'flex flex-col gap-2 m-0 p-0 bg-gray-950 transition-all  duration-200',
                                      selectedGoalId === g.id
                                        ? 'border bg-gray-900 border-y-green-500/20'
                                        : 'hover:bg-white/5'
                                    )}
                                  >
                                    <div className="flex  items-center justify-between w-full px-3 py-2  ">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                                          <PiggyBank className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-400">
                                            {g.name}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-sm font-mono text-white">
                                              {g?.account_number ||
                                                '•••• •••• •••• ••••'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${g.is_public ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}
                                          >
                                            {g.is_public ? (
                                              <Globe className="w-2.5 h-2.5" />
                                            ) : (
                                              <LockKeyhole className="w-2.5 h-2.5" />
                                            )}
                                            {g.is_public ? 'Public' : 'Private'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </div>
                      ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                            <PiggyBank className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-sm text-white/70">
                            No saving goals yet
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            Create a goal to start collecting money
                          </p>
                          <Button
                            size="sm"
                            className="mt-4 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs px-4"
                          >
                            Create goal
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {target === 'main' && (
                    <div className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-gray-800/30 border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Main Account</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-sm font-mono text-white">
                              {mainAccount?.account_number ||
                                '•••• •••• •••• ••••'}
                            </span>
                            <button
                              onClick={() => {
                                if (mainAccount?.account_number) {
                                  navigator.clipboard.writeText(
                                    mainAccount.account_number
                                  );
                                  toast({
                                    title: 'Copied!',
                                    description:
                                      'Account number copied to clipboard.',
                                  });
                                }
                              }}
                              className="p-1 rounded-md hover:bg-white/10 transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-800 mt-5" />

                {/* Account Summary (replaces support line) */}
                <div className="grid grid-cols-3 gap-2 w-full mt-2">
                  {(target === 'main'
                    ? [
                        {
                          label: 'Account',
                          value: 'Main Account',
                          icon: Wallet,
                        },
                        {
                          label: 'Balance',
                          value: formatCurrency(
                            mainAccount?.current_balance || 0
                          ),
                          icon: TrendingUp,
                        },
                        {
                          label: 'Currency',
                          value: mainAccount?.currency || 'USD',
                          icon: CreditCard,
                        },
                      ]
                    : selectedGoal
                      ? [
                          {
                            label: 'Goal',
                            value: selectedGoal.name,
                            icon: PiggyBank,
                          },
                          {
                            label: 'Saved',
                            value: formatCurrency(goalBalance),
                            icon: Wallet,
                          },
                          {
                            label: 'Progress',
                            value: `${goalProgress}%`,
                            icon: TrendingUp,
                          },
                        ]
                      : []
                  ).map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="group relative overflow-hidden rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-800 p-2 text-center transition-all hover:border-gray-600 hover:bg-gray-800/50 hover:shadow-md"
                    >
                      {/* subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-300" />

                      <div className="relative z-10">
                        <Icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1 group-hover:text-blue-400 transition-colors" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {label}
                        </p>
                        <p className="text-xs font-mono font-semibold text-white mt-0.5 truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isQRReady && (
              <div className="flex gap-3 w-full max-w-sm">
                <button
                  onClick={() =>
                    handleCopyLink(selectedGoal?.account_number || '')
                  }
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    copied
                      ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400'
                      : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  )}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleSaveQR}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 transition-all"
                >
                  <Download size={16} />
                  Save QR
                </button>
                <button
                  onClick={handleShareQR}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 transition-all"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            )}

            {/* Scan Hint */}
            {isQRReady && (
              <p className="flex items-center gap-2 text-xs text-gray-400">
                <ScanLine className="w-3.5 h-3.5" />
                Point your camera at the QR to pay
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
