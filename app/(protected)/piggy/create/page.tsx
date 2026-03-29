'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInCalendarDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  PiggyBank,
  CalendarIcon,
  Lock,
  EyeOff,
  Target,
  Sparkles,
  TrendingUp,
  Plus,
  ChevronRight,
  Check,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { useCreatePiggyGoal } from '@/hooks/api/useCreatePiggyGoal';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

const presetAmounts = [500, 1000, 2500, 5000, 10000];

const presetGoals = [
  {
    label: 'Vacation',
    emoji: (
      <Image
        src="https://www.pngall.com/wp-content/uploads/2016/05/Vacation-Free-Download-PNG.png"
        alt="Description"
        width={600}
        height={500}
      />
    ),
    amount: 2000,
    tagline: 'Travel & leisure',
  },
  {
    label: 'New Laptop',
    emoji: (
      <Image
        src="https://ipowerresale.com/cdn/shop/files/media_31b63b50-d45b-406a-8a4d-77f6c3baf8f5.png?v=1766098577"
        alt="Description"
        width={600}
        height={500}
      />
    ),
    amount: 1500,
    tagline: 'Tech upgrade',
  },
  {
    label: 'Emergency Fund',
    emoji: (
      <Image
        src="https://static.vecteezy.com/system/resources/thumbnails/021/827/100/small/emergency-ambulance-car-medical-vehicle-illustration-png.png"
        alt="Description"
        width={600}
        height={600}
      />
    ),
    amount: 5000,
    tagline: 'Peace of mind',
  },
  {
    label: 'Car',
    emoji: (
      <Image
        src="https://www.bmw-m.com/content/dam/bmw/marketBMW_M/www_bmw-m_com/all-models/model-navigation/bmw-m3-competition-sedan-m-xdrive-lci-flyout.png"
        alt="Description"
        width={600}
        height={500}
      />
    ),
    amount: 15000,
    tagline: 'Hit the road',
  },
  {
    label: 'Wedding',
    emoji: (
      <Image
        src="https://static.vecteezy.com/system/resources/thumbnails/042/383/882/small/groom-and-bride-wedding-characters-png.png"
        alt="Description"
        width={600}
        height={500}
      />
    ),
    amount: 10000,
    tagline: 'Big day',
  },
  {
    label: 'Custom',
    emoji: (
      <Image
        src="https://static.vecteezy.com/system/resources/thumbnails/020/696/226/small/3d-minimal-money-saving-concept-depositing-money-collecting-money-for-retirement-salary-management-concept-wallet-with-a-money-bag-and-a-pile-of-money-3d-illustration-png.png"
        alt="Description"
        width={600}
        height={500}
      />
    ),
    amount: 0,
    tagline: 'Your own goal',
  },
];

// Step indicator
const steps = ['Template', 'Details', 'Lock & Privacy'];

export default function CreatePiggy() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [hideBalance, setHideBalance] = useState(false);

  // Real mutation hook
  const { mutate: createGoal, isPending } = useCreatePiggyGoal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const target = parseFloat(targetAmount);
    const lockDays = expiryDate
      ? differenceInCalendarDays(expiryDate, new Date())
      : null;

    createGoal(
      {
        name: name.trim(),
        target_amount: target,
        hide_balance: hideBalance,
        lock_period_days: lockDays && lockDays > 0 ? lockDays : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Goal created',
            description: `${name} has been created successfully!`,
          });
          router.push('/piggy');
        },
        onError: (err) => {
          toast({
            title: 'Creation failed',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const target = parseFloat(targetAmount);
  const lockDays = expiryDate
    ? differenceInCalendarDays(expiryDate, new Date())
    : null;
  const isValid = name.trim().length > 0 && !isNaN(target) && target > 0;

  const canProceed = [
    true, // step 0 — template always passable
    name.trim() && !isNaN(target) && target > 0, // step 1
    true, // step 2 — lock is optional
  ];

  const canSubmit = isValid && !isPending; // Final submit button

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-7 xl:py-10 max-w-[1400px] mx-auto space-y-7">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="w-7 h-7 rounded-lg border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span className="hidden sm:inline">Back to Goals</span>
        </button>
      </div>

      {/* Step tracker */}
      <div className="flex w-full justify-center items-center gap-2 sm:gap-3 md:gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-1.5 text-xs font-semibold transition-colors',
                i < step
                  ? 'text-primary cursor-pointer'
                  : i === step
                    ? 'text-foreground'
                    : 'text-muted-foreground/50 cursor-default'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-full transition-all',
                  'w-9 h-9 sm:w-7 sm:h-7 text-[10px] sm:text-xs font-bold',
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border text-muted-foreground/40'
                )}
              >
                {i < step ? (
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="hidden sm:inline text-xs font-medium whitespace-nowrap">
                {s}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px transition-colors',
                  i < step ? 'bg-primary' : 'bg-border',
                  'w-4 sm:w-8 md:w-12' // responsive line length
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Page title ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
          New Saving Goal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 0
            ? 'Pick a template or start from scratch'
            : step === 1
              ? 'Name your goal and set a target amount'
              : 'Configure privacy and lock settings'}
        </p>
      </div>

      {/* ── Main grid ── */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8"
      >
        {/* ── LEFT COLUMN (form steps) ── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: Templates ── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presetGoals.map(({ label, emoji, amount, tagline }) => {
                    const active = name === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setName(label === 'Custom' ? '' : label);
                          if (amount) setTargetAmount(String(amount));
                        }}
                        className={cn(
                          'group relative flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-200',
                          active
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border bg-card hover:border-primary/30 hover:bg-card/80'
                        )}
                      >
                        {active && (
                          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </span>
                        )}
                        <span className="text-3xl leading-none">{emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tagline}
                          </p>
                          {amount > 0 && (
                            <p className="text-xs font-semibold text-primary mt-1.5">
                              {formatCurrency(amount)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    variant="hero"
                    onClick={() => setStep(1)}
                    className="gap-2 px-8"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: Name + Amount ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="glass rounded-2xl p-6 space-y-6">
                  {/* Goal Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Goal Name
                    </Label>
                    <Input
                      placeholder="e.g., Tokyo Trip 2025"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                      className="bg-secondary border-border text-foreground text-base h-11 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Target Amount */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Target Amount (USD)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground select-none">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        required
                        min="1"
                        step="0.01"
                        className="pl-8 bg-secondary border-border text-foreground text-2xl font-bold h-14 tabular-nums
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                        [-moz-appearance:textfield] focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Quick select
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {presetAmounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setTargetAmount(String(amt))}
                            className={cn(
                              'px-3 py-1.5 rounded-full font-medium border transition-all',
                              targetAmount === String(amt)
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-background'
                            )}
                          >
                            {formatCurrency(amt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="button"
                    variant="hero"
                    onClick={() => setStep(2)}
                    disabled={!canProceed[1]}
                    className="gap-2 px-8"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Lock + Privacy ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Lock date */}
                <div className="glass rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> Lock Until
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Lock funds to prevent early withdrawal
                      </p>
                    </div>
                    {expiryDate && (
                      <button
                        type="button"
                        onClick={() => setExpiryDate(undefined)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <DatePicker
                    value={expiryDate ? dayjs(expiryDate) : null}
                    onChange={(date: Dayjs | null) =>
                      setExpiryDate(date ? date.toDate() : undefined)
                    }
                    disabledDate={(current) =>
                      current && current <= dayjs().startOf('day')
                    }
                    placeholder="Pick a date (optional)"
                    format="MMMM D, YYYY"
                    className="w-full"
                  />

                  {/* Informational note about interest */}

                  {lockDays && lockDays > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-xl px-3 py-2 border border-border/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-amber-500" />
                      </div>
                      <span>
                        Locked for{' '}
                        <span className="font-semibold text-foreground">
                          {lockDays} days
                        </span>
                        .
                        <span className="text-xs text-muted-foreground ml-1">
                          Early break incurs a 5% penalty.
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Hide balance */}
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Hide Balance
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Balance stays hidden on your dashboard
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={hideBalance}
                      onCheckedChange={setHideBalance}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    disabled={!canSubmit}
                    className="gap-2 px-10 shadow-lg shadow-primary/20"
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{' '}
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Create Goal
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN: live preview (sticky) ── */}
        <div className="lg:col-span-5  xl:col-span-4 space-y-4 lg:sticky lg:top-6 self-start">
          {/* Goal preview card */}
          <div className="relative overflow-hidden glass rounded-2xl p-6">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.12em] mb-5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" /> Live Preview
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300',
                  name ? 'gradient-accent shadow-md' : 'bg-secondary'
                )}
              >
                <PiggyBank
                  className={cn(
                    'w-6 h-6 transition-colors',
                    name ? 'text-accent-foreground' : 'text-muted-foreground/40'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate text-base leading-tight">
                  {name.trim() || (
                    <span className="text-muted-foreground/40 font-normal italic text-sm">
                      Goal name…
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                Target
              </p>
              <p className="text-3xl font-display font-bold text-foreground leading-none">
                {!isNaN(target) && target > 0 ? (
                  formatCurrency(target)
                ) : (
                  <span className="text-muted-foreground/30 text-xl font-normal">
                    —
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>0%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-0 rounded-full gradient-primary" />
              </div>
              <p className="text-xs text-muted-foreground">$0.00 saved</p>
            </div>
          </div>

          {/* Configuration summary */}

          <div className="glass rounded-2xl p-5 space-y-0 divide-y divide-border">
            {[
              {
                icon: Lock,
                label: 'Lock Period',
                value: lockDays && lockDays > 0 ? `${lockDays} days` : 'None',
                accent: false,
                tooltip: null,
              },
              {
                icon: CalendarIcon,
                label: 'Unlocks On',
                value:
                  expiryDate && lockDays && lockDays > 0
                    ? format(expiryDate, 'MMM d, yyyy')
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
                  ? 'Your balance will be hidden from your dashboard until the goal is completed or broken.'
                  : null,
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
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    accent ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Interest reminder */}
          <div className="glass rounded-2xl p-5 space-y-0 divide-y divide-border">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Info className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Interest earnings
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Calculated daily on your piggy balance, paid monthly to your
                    account.
                  </p>
                </div>

                {/* Rate cards */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Tier 1 */}
                  <div className="rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5 transition-all hover:border-primary/20 hover:bg-primary/5">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Balance
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      &lt; $5,000
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-foreground">
                        0.10%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        p.a.
                      </span>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 transition-all">
                    <p className="text-[11px] font-medium text-primary uppercase tracking-wider">
                      Balance
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      ≥ $5,000
                    </p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-primary">
                        3.0%
                      </span>
                      <span className="text-[10px] text-primary/70">p.a.</span>
                    </div>
                  </div>
                </div>

                {/* Additional info */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Interest paid monthly</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <TrendingUp className="w-3 h-3" />
                  <span>Compounded daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
