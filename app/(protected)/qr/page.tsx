'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PiggyBank,
  Camera,
  Upload,
  X,
  User,
  ArrowRight,
  CheckCircle2,
  Info,
  AlertCircle,
  ScanLine,
  DollarSign,
  RefreshCw,
  Sparkles,
  Shield,
  Zap,
  Image as ImageIcon,
  Loader2,
  Check,
  MoveUpRight,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransfer } from '@/hooks/api/useTransfer';
import { useToast } from '@/hooks/use-toast';
import { useMainAccount } from '@/hooks/api/useAccount';
import { useQRValidation } from '@/hooks/api/useQr';

const transferSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be greater than 0',
    })
    .refine((val) => parseFloat(val) <= 1000000, {
      message: 'Amount is too high',
    }),
  notes: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export default function QRScanner() {
  const router = useRouter();
  const {
    data: mainAccount,
    isLoading: mainAccountIsLoading,
    error: mainAccountError,
  } = useMainAccount();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [recipientInfo, setRecipientInfo] = useState<{
    type: string;
    accountNumber: string;
    expiresAt: string;
  } | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQr, setSearchQr] = useState('');

  const { mutate: transfer, isPending: isTransferring } = useTransfer();
  const {
    data: validation,
    isLoading: validating,
    error: validationQueryError,
  } = useQRValidation(searchQr);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset: resetForm,
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { amount: '', notes: '' },
  });

  const amount = watch('amount');
  const notes = watch('notes');
  const amt = parseFloat(amount);
  const isValidAmount = !isNaN(amt) && amt > 0;

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);
  const scannerContainerId = 'qr-reader';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(
    () => () => {
      stopScanner();
    },
    [stopScanner]
  );

  // When validation succeeds
  useEffect(() => {
    if (validation) {
      // Self‑transfer check
      if (
        mainAccount &&
        validation.recipientAccountNumber === mainAccount.account_number
      ) {
        toast({
          title: 'Invalid QR',
          description: 'You cannot send money to your own account',
          variant: 'destructive',
        });
        setSearchQr('');
        scannedRef.current = false;
        return;
      }

      setQrBase64(searchQr);
      setRecipientInfo({
        type:
          validation.type === 'CONTRIBUTION' ? 'Piggy Goal' : 'P2P Transfer',
        accountNumber: validation.recipientAccountNumber,
        expiresAt: validation.expiresAt,
      });
      stopScanner();
      resetForm({ amount: '', notes: '' });
    }
  }, [validation, mainAccount, searchQr, stopScanner, resetForm, toast]);

  // When validation fails
  useEffect(() => {
    if (validationQueryError) {
      setValidationError(getErrorMessage(validationQueryError));
      scannedRef.current = false;
    }
  }, [validationQueryError]);

  const startScanner = async () => {
    setCameraError(null);
    setPermissionDenied(false);
    try {
      await stopScanner();
      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5Qrcode;
      scannedRef.current = false;
      setScanning(true);

      await html5Qrcode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (scannedRef.current || validating) return;
          scannedRef.current = true;
          setSearchQr(decodedText);
        },
        (errorMessage) => {
          if (errorMessage.includes('No QR code found')) return;
          console.debug(errorMessage);
        }
      );
    } catch (err: unknown) {
      setScanning(false);
      if (err instanceof Error) {
        if (
          err.message.includes('permission') ||
          err.name === 'NotAllowedError'
        ) {
          setPermissionDenied(true);
          setCameraError(
            'Camera permission denied. Please allow camera access and try again.'
          );
        } else {
          setCameraError('Unable to start camera. Try upload mode below.');
        }
      } else {
        setCameraError('Unable to start camera. Try upload mode below.');
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      setUploading(false);
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      const html5Qrcode = new Html5Qrcode('qr-upload-reader');
      const decodedText = await html5Qrcode.scanFile(file, false);

      if (decodedText && decodedText.length > 0) {
        setSearchQr(decodedText);
      } else {
        setUploadError('No valid QR code found in the image');
        setUploadedImage(null);
      }
    } catch (error) {
      console.error('QR decode error:', error);
      setUploadError(
        'Failed to read QR code from image. Please try another image.'
      );
      setUploadedImage(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onTransferSubmit = (data: TransferFormValues) => {
    if (!qrBase64) return;

    transfer(
      {
        qrBase64,
        amount: parseFloat(data.amount),
        notes: data.notes,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Transfer Successful',
            description: `Successfully sent ${formatCurrency(parseFloat(data.amount))} to ${recipientInfo?.type === 'Piggy Goal' ? 'piggy goal' : 'account'}.`,
            variant: 'default',
          });
          resetState();
          router.push('/dashboard?transfer=success');
        },
        onError: (err: unknown) => {
          setTransferError(getErrorMessage(err));
          toast({
            title: 'Transfer Failed',
            description: getErrorMessage(err),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const resetState = () => {
    setQrBase64(null);
    setRecipientInfo(null);
    setUploadedImage(null);
    setCameraError(null);
    setPermissionDenied(false);
    setUploadError(null);
    setTransferError(null);
    setValidationError(null);
    setSearchQr('');
    resetForm({ amount: '', notes: '' });
  };

  const setQuickAmount = (value: number) => {
    setValue('amount', value.toString(), { shouldValidate: true });
  };

  return (
    <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
      <div className="relative">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-primary" />
          QR Pay
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scan a QR code to send money instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!qrBase64 && (
            <div className="flex gap-3">
              {(
                [
                  {
                    mode: 'camera',
                    icon: Camera,
                    label: 'Camera Scan',
                    desc: 'Use your camera',
                  },
                  {
                    mode: 'upload',
                    icon: Upload,
                    label: 'Upload Image',
                    desc: 'Upload QR image',
                  },
                ] as const
              ).map(({ mode, icon: Icon, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => {
                    stopScanner();
                    setScanMode(mode);
                    setCameraError(null);
                    setPermissionDenied(false);
                    setUploadError(null);
                    setValidationError(null);
                  }}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all',
                    scanMode === mode
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      scanMode === mode
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      scanMode === mode ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {scanMode === 'camera' && !qrBase64 && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl p-5 border-none sm:p-6 space-y-5"
              >
                <div className="relative flex justify-center">
                  <div
                    id={scannerContainerId}
                    className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden transition-all"
                    style={{ aspectRatio: '1 / 1' }}
                  />
                  {!scanning && !cameraError && (
                    <div className="absolute inset-0 border flex items-center justify-center rounded-2xl">
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Camera is off
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-destructive text-sm">
                      {cameraError}
                    </span>
                  </div>
                )}

                {validationError && !qrBase64 && (
                  <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-destructive text-sm">
                      {validationError}
                    </span>
                  </div>
                )}

                {validating && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Validating QR...
                    </span>
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {!scanning ? (
                    <Button
                      variant="hero"
                      className="gap-2"
                      onClick={startScanner}
                    >
                      <Camera className="w-4 h-4" /> Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={stopScanner}
                      >
                        <X className="w-4 h-4" /> Stop
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={startScanner}
                      >
                        <RefreshCw className="w-4 h-4" /> Restart
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {scanMode === 'upload' && !qrBase64 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Upload QR Code Image
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="qr-upload"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                      uploading
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    {uploading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Processing image...
                        </p>
                      </div>
                    ) : uploadedImage ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedImage}
                          alt="Uploaded QR"
                          className="max-h-40 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-primary">
                          Click to upload another
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Click or drag to upload QR code image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <div id="qr-upload-reader" className="hidden" />
                </div>
                {uploadError && (
                  <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-destructive text-sm">
                      {uploadError}
                    </span>
                  </div>
                )}
                {validationError && !qrBase64 && (
                  <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-destructive text-sm">
                      {validationError}
                    </span>
                  </div>
                )}
                {validating && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Validating QR...
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {qrBase64 && recipientInfo && (
              <motion.div
                key="transfer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MoveUpRight className="w-3 h-3" />
                      Sending To
                    </p>
                    <button
                      onClick={resetState}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                        recipientInfo.type === 'Piggy Goal'
                          ? 'bg-accent/10'
                          : 'bg-primary/10'
                      )}
                    >
                      {recipientInfo.type === 'Piggy Goal' ? (
                        <PiggyBank className="w-6 h-6 text-accent" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">
                        {recipientInfo.type === 'Piggy Goal'
                          ? 'Piggy Goal'
                          : 'Account'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Account: {recipientInfo.accountNumber.slice(-6)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        Valid until:{' '}
                        {new Date(recipientInfo.expiresAt).toLocaleString()}
                      </div>
                    </div>
                    <Check className="w-6 h-6 text-primary shrink-0" />
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(onTransferSubmit)}
                  className="glass rounded-2xl p-5 space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Amount (USD)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...register('amount')}
                        min="0.01"
                        step="0.01"
                        className="pl-10 bg-secondary border-border text-foreground text-2xl font-bold h-14"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-xs text-destructive">
                        {errors.amount.message}
                      </p>
                    )}
                    {amount && !errors.amount && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'text-xs font-medium',
                          amt > (mainAccount?.current_balance || 0)
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        )}
                      >
                        {amt > (mainAccount?.current_balance || 0)
                          ? `⚠️ Exceeds balance by ${formatCurrency(amt - (mainAccount?.current_balance || 0))}`
                          : `✓ Remaining: ${formatCurrency((mainAccount?.current_balance || 0) - amt)}`}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Notes (optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="Add a note..."
                      {...register('notes')}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[10, 25, 50, 100].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setQuickAmount(quickAmount)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        ${quickAmount}
                      </button>
                    ))}
                  </div>

                  {transferError && (
                    <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span className="text-destructive text-sm">
                        {transferError}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetState}
                      disabled={isTransferring}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      className="flex-1 gap-2"
                      disabled={
                        !isValidAmount ||
                        isTransferring ||
                        amt > (mainAccount?.current_balance || 0)
                      }
                    >
                      {isTransferring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />{' '}
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Transfer{' '}
                          <ArrowRightLeft className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1 space-y-4">
          {mainAccountIsLoading ? (
            <div className="w-full h-24 bg-secondary rounded-2xl animate-pulse" />
          ) : mainAccountError ? (
            <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive text-sm">
                Failed to load account balance
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5 gradient-hero border border-primary/20"
            >
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Available Balance
              </p>
              <p className="text-3xl font-display font-bold text-foreground">
                {formatCurrency(mainAccount?.current_balance ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Main Account · USD
              </p>
            </motion.div>
          )}

          {qrBase64 && recipientInfo && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Transfer Summary
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {recipientInfo.type === 'Piggy Goal' ? (
                      <PiggyBank className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      Recipient
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {recipientInfo.type === 'Piggy Goal'
                      ? 'Piggy Goal'
                      : 'Account'}{' '}
                    ({recipientInfo.accountNumber.slice(-6)})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {isValidAmount ? formatCurrency(amt) : '—'}
                  </span>
                </div>
                {notes && (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Note
                      </span>
                    </div>
                    <span className="text-sm text-foreground">{notes}</span>
                  </div>
                )}
                {isValidAmount && (
                  <div className="border-t border-border pt-2.5 mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Total to send
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(amt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
