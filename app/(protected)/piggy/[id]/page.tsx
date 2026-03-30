'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  QrCode,
  PiggyBank,
  Hammer,
  Lock,
  EyeOff,
  AlertTriangle,
  Info,
  TrendingUp,
  Target,
  Sparkles,
  Clock,
  Gift,
  Shield,
  Zap,
  DollarSign,
  CheckCircle2,
  Loader2,
  CircleDot,
  CalendarIcon,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  usePiggyGoalByAccountNumber,
  useUpdatePiggyPublic,
} from '@/hooks/api/usePiggyGoal';
import { useMainAccount } from '@/hooks/api/useAccount';
import { useTransferOwnPiggy } from '@/hooks/api/useTransfer';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function PiggyDetail() {
  const router = useRouter();
  const params = useParams();
  const accountNumber = params.id as string;

  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const {
    data: piggyGoal,
    isLoading,
    error,
  } = usePiggyGoalByAccountNumber(accountNumber);
  const { data: mainAccount } = useMainAccount();
  const { mutate: addMoney, isPending: isAdding } = useTransferOwnPiggy();
  const { mutate: updatePublic, isPending: isUpdatingPublic } =
    useUpdatePiggyPublic();

  const [showQR, setShowQR] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [breaking, setBreaking] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !piggyGoal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>Failed to load piggy goal: {error?.message || 'Not found'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/piggy')}
          >
            Back to Goals
          </Button>
        </div>
      </div>
    );
  }

  const {
    id,
    name,
    target_amount: targetAmount,
    status,
    lock_expires_at: lockExpiresAt,
    created_at: createdAt,
    current_balance: balance,
    is_public: isPublic,
    hide_balance: hideBalance,
  } = piggyGoal;

  const isHidden = hideBalance && status === 'ACTIVE';
  const lockExpiry = lockExpiresAt ? new Date(lockExpiresAt) : null;
  const isLockExpired = lockExpiry ? currentTime > lockExpiry : true;
  const daysRemaining =
    lockExpiry && !isLockExpired
      ? Math.max(
          0,
          Math.ceil((lockExpiry.getTime() - currentTime.getTime()) / 86400000)
        )
      : 0;

  let progress = 0;
  if (targetAmount > 0) {
    progress = Math.min((balance / targetAmount) * 100, 100);
  }

  const penaltyPct = 5;
  const penaltyAmount = balance * (penaltyPct / 100);
  const returnAfterPenalty = balance - penaltyAmount;

  const isNearComplete = progress >= 80;
  const isHalfway = progress >= 50 && progress < 80;

  const mainBalance = mainAccount?.current_balance ?? 0;

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;
    addMoney(
      { recipient_account_number: accountNumber, amount, notes },
      {
        onSuccess: () => {
          toast({
            title: 'Added to goal',
            description: `Successfully added ${formatCurrency(amount)} to ${name}`,
          });
          setAddAmount('');
          setNotes('');
        },
        onError: (err) => {
          toast({
            title: 'Add failed',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleBreak = () => {
    setBreaking(true);
    setTimeout(() => {
      setBreaking(false);
      toast({
        title: 'Feature coming soon',
        description: 'Breaking piggy will be implemented later.',
      });
      router.push('/piggy');
    }, 800);
  };

  const quickAddAmounts = [25, 50, 100, 250];
  const qrPayload = `piggy:${id}:${name}`;

  const handlePublicToggle = (checked: boolean) => {
    updatePublic(
      { accountNumber, isPublic: checked },
      {
        onSuccess: () => {
          toast({
            title: checked ? 'Goal is now public' : 'Goal is now private',
            description: checked
              ? 'Others can now find and contribute to this goal.'
              : 'This goal is now private. Only you can see it.',
          });
        },
        onError: (err) => {
          toast({
            title: 'Update failed',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      <button
        onClick={() => router.push('/piggy')}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />{' '}
        Back to Goals
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT COLUMN: hero card + actions */}
        <div className="space-y-4 lg:col-span-1">
          <div className="relative overflow-hidden glass rounded-2xl p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />

            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                  isNearComplete ? 'gradient-primary' : 'gradient-accent'
                )}
              >
                <PiggyBank className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">
                  {name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                      status === 'ACTIVE'
                        ? 'bg-primary/10 text-primary'
                        : status === 'COMPLETED'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {status === 'ACTIVE' && (
                      <CircleDot className="w-2.5 h-2.5" />
                    )}
                    {status}
                  </span>
                  {lockExpiresAt && !isLockExpired && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                  {hideBalance && status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted-foreground/20 text-muted-foreground">
                      <EyeOff className="w-2.5 h-2.5" /> Hidden
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Current Balance
              </p>
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
                    <PopoverContent
                      side="top"
                      className="max-w-[240px] text-center p-3"
                    >
                      <p className="text-sm font-medium mb-1">
                        Balance is hidden
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visible once the piggy is broken or completed.
                      </p>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isHidden ? 'of ••••••' : `of ${formatCurrency(targetAmount)}`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span
                  className={cn(
                    'font-semibold',
                    isNearComplete
                      ? 'text-primary'
                      : isHalfway
                        ? 'text-accent'
                        : ''
                  )}
                >
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    isNearComplete
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'gradient-primary'
                  )}
                />
              </div>
            </div>

            {/* Lock status */}
            {lockExpiresAt && !isLockExpired && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <Clock className="w-4 h-4 text-amber-500" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">
                    Locked until {lockExpiry?.toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {daysRemaining} days remaining
                  </p>
                </div>
                <Shield className="w-4 h-4 text-amber-500/60" />
              </div>
            )}

            {isLockExpired && lockExpiresAt && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-success/5 border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <p className="text-xs font-medium text-success">
                  Lock period completed! You can now break without penalty.
                </p>
              </div>
            )}
          </div>

          {/* Quick add section */}
          {status === 'ACTIVE' && (
            <form
              onSubmit={handleAddMoney}
              className="glass rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold text-foreground">
                  Add Money
                </Label>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground select-none">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  className="pl-8 bg-secondary border-border text-foreground text-2xl font-bold h-14 tabular-nums
                                        [&::-webkit-inner-spin-button]:appearance-none
                                        [&::-webkit-outer-spin-button]:appearance-none
                                        [-moz-appearance:textfield] focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {quickAddAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAddAmount(String(amount))}
                    className="px-4 py-2 rounded-lg font-medium bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-xs text-muted-foreground"
                >
                  Notes (optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="Add a personal note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Available: {formatCurrency(mainBalance)}
              </p>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isAdding || !addAmount}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add Money
              </Button>
            </form>
          )}

          {/* Action buttons */}
          {status === 'ACTIVE' && (
            <div className="flex flex-col gap-3">
              <Button
                variant="glass"
                className="w-full gap-2"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Hide QR Code' : 'Show QR Code for Contributions'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={breaking}
                  >
                    <Hammer className="w-4 h-4" />
                    {isLockExpired
                      ? 'Break Piggy'
                      : 'Force Break (Penalty Applied)'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      {!isLockExpired && (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                      Break {name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        {!isLockExpired ? (
                          <>
                            <p>
                              Still locked until{' '}
                              <span className="font-semibold text-foreground">
                                {lockExpiry?.toLocaleDateString()}
                              </span>{' '}
                              ({daysRemaining} day
                              {daysRemaining !== 1 ? 's' : ''} remaining).
                            </p>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Current balance</span>
                                <span className="font-semibold text-foreground">
                                  {isHidden
                                    ? '••••••'
                                    : formatCurrency(balance)}
                                </span>
                              </div>
                              <div className="flex justify-between text-destructive">
                                <span>Penalty ({penaltyPct}%)</span>
                                <span className="font-semibold">
                                  {isHidden
                                    ? '••••••'
                                    : `-${formatCurrency(penaltyAmount)}`}
                                </span>
                              </div>
                              <div className="border-t border-destructive/20 pt-1 flex justify-between font-semibold">
                                <span>You will receive</span>
                                <span className="text-foreground">
                                  {isHidden
                                    ? '••••••'
                                    : formatCurrency(returnAfterPenalty)}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p>
                            {isHidden ? (
                              'Your full balance will be returned.'
                            ) : (
                              <>
                                You will receive{' '}
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(balance)}
                                </span>{' '}
                                back to your main account.
                              </>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          This action cannot be undone.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBreak}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {breaking
                        ? 'Breaking...'
                        : isLockExpired
                          ? 'Break Piggy'
                          : 'Force Break & Pay Penalty'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {status === 'COMPLETED' && (
            <div className="flex flex-col gap-3">
              <Button
                variant="glass"
                className="w-full gap-2"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Hide QR Code' : 'Show QR Code for Contributions'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2  border-green-500/30 hover:bg-green-500/10"
                    disabled={breaking}
                  >
                    <Hammer className="w-4 h-4" />
                    Claim Piggy
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      {!isLockExpired && (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                      Break {name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        {!isLockExpired ? (
                          <>
                            <p>
                              Still locked until{' '}
                              <span className="font-semibold text-foreground">
                                {lockExpiry?.toLocaleDateString()}
                              </span>{' '}
                              ({daysRemaining} day
                              {daysRemaining !== 1 ? 's' : ''} remaining).
                            </p>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Current balance</span>
                                <span className="font-semibold text-foreground">
                                  {isHidden
                                    ? '••••••'
                                    : formatCurrency(balance)}
                                </span>
                              </div>
                              <div className="flex justify-between text-destructive">
                                <span>Penalty ({penaltyPct}%)</span>
                                <span className="font-semibold">
                                  {isHidden
                                    ? '••••••'
                                    : `-${formatCurrency(penaltyAmount)}`}
                                </span>
                              </div>
                              <div className="border-t border-destructive/20 pt-1 flex justify-between font-semibold">
                                <span>You will receive</span>
                                <span className="text-foreground">
                                  {isHidden
                                    ? '••••••'
                                    : formatCurrency(returnAfterPenalty)}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p>
                            {isHidden ? (
                              'Your full balance will be returned.'
                            ) : (
                              <>
                                You will receive{' '}
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(balance)}
                                </span>{' '}
                                back to your main account.
                              </>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          This action cannot be undone.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBreak}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {breaking
                        ? 'Breaking...'
                        : isLockExpired
                          ? 'Break Piggy'
                          : 'Force Break & Pay Penalty'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* QR code panel */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-6 flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Scan to Contribute
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG value={qrPayload} size={180} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                QR for{' '}
                <span className="font-semibold text-foreground">{name}</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Expires in 10 minutes
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN: stats + interest history */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Target,
                label: 'Target',
                value: isHidden ? '••••••' : formatCurrency(targetAmount),
                sub: isHidden
                  ? ''
                  : `${formatCurrency(targetAmount - balance)} remaining`,
                color: 'bg-primary/10 text-primary',
              },
              {
                icon: Clock,
                label: lockExpiresAt ? 'Lock Period' : 'Created',
                value: lockExpiresAt
                  ? `${Math.ceil((new Date(lockExpiresAt).getTime() - new Date(createdAt).getTime()) / 86400000)} days`
                  : new Date(createdAt).toLocaleDateString(),
                sub:
                  lockExpiresAt && !isLockExpired
                    ? `${daysRemaining}d left`
                    : '',
                color: 'bg-amber-500/10 text-amber-500',
              },
              {
                icon: Gift,
                label: 'Interest Earned',
                value: isHidden ? '••••••' : formatCurrency(0),
                sub: '0 payments',
                color: 'bg-emerald-500/10 text-emerald-500',
              },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                  </p>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {value}
                </p>
                {sub && (
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Configuration summary */}
          <div className="glass rounded-2xl p-5 space-y-0 divide-y divide-border">
            {[
              {
                icon: Lock,
                label: 'Lock Period',
                value:
                  lockExpiresAt && !isLockExpired
                    ? `${daysRemaining} days left`
                    : lockExpiresAt
                      ? 'Locked (expired)'
                      : 'None',
                accent: false,
                tooltip: null,
              },
              {
                icon: CalendarIcon,
                label: 'Unlocks On',
                value: lockExpiresAt
                  ? new Date(lockExpiresAt).toLocaleDateString()
                  : '—',
                accent: false,
                tooltip: null,
              },
              {
                icon: EyeOff,
                label: 'Hide Balance',
                value: hideBalance ? 'On' : 'Off',
                accent: hideBalance,
                tooltip: hideBalance
                  ? 'Your balance is hidden from your dashboard until the goal is completed or broken.'
                  : null,
              },
              {
                icon: Globe,
                label: 'Visibility',
                value: isPublic ? 'Public' : 'Private',
                accent: isPublic,
                tooltip: isPublic
                  ? 'Anyone can find and contribute to this goal'
                  : 'Only you can see this goal',
              },
            ].map(({ icon: Icon, label, value, accent, tooltip }) => (
              <div
                key={label}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  {tooltip ? (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2.5 cursor-help">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            {label}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[220px] text-center"
                        >
                          <p className="text-xs">{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                    </div>
                  )}
                </div>
                {label === 'Visibility' ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isPublic}
                      onCheckedChange={handlePublicToggle}
                      disabled={isUpdatingPublic}
                    />
                    <span className="text-xs text-muted-foreground">
                      {isPublic ? 'Anyone can contribute' : 'Only you can see'}
                    </span>
                  </div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      accent ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Interest history placeholder */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">
                    Interest History
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent interest payments credited to your piggy
                </p>
              </div>
              <span className="text-xs font-medium text-primary">
                0 payments
              </span>
            </div>

            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No interest payments yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Interest is credited daily based on lock period
              </p>
            </div>

            <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">
                Total Interest Earned
              </span>
              <span className="text-base font-bold text-primary tabular-nums">
                +{isHidden ? '••••' : formatCurrency(0)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
