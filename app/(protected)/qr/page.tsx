"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PiggyBank, Camera, Keyboard, X, User, QrCode, ArrowRight, CheckCircle2, Info } from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ── Types ─────────────────────────────────────────────────────────────────────

type QRPayload = {
  type: 'main' | 'piggy';
  name?: string;
  userId?: string;
  piggyId?: string;
  exp?: number;
};

// ── Static mock ───────────────────────────────────────────────────────────────

const mockMainBalance = 1250.50;

function parseQRData(raw: string): QRPayload | null {
  const trimmed = raw.trim();
  // demo shortcuts
  if (trimmed === 'demo-p2p')   return { type: 'main',  name: 'Jane Smith',    userId: 'user-jane'  };
  if (trimmed === 'demo-piggy') return { type: 'piggy', name: 'Vacation Fund', piggyId: 'goal-2'   };
  // try JSON fallback
  try {
    const data = JSON.parse(trimmed) as QRPayload;
    if (data.type && (data.userId || data.piggyId)) return data;
  } catch {}
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QRScanner() {
  const router = useRouter();
  const [scanMode, setScanMode]     = useState<'camera' | 'manual'>('camera');
  const [manualData, setManualData] = useState('');
  const [parsedQR, setParsedQR]     = useState<QRPayload | null>(null);
  const [amount, setAmount]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [scanning, setScanning]     = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef         = useRef<Html5Qrcode | null>(null);
  const scannedRef         = useRef(false);
  const scannerContainerId = 'qr-reader';

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

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const startScanner = async () => {
    setCameraError(null);
    try {
      await stopScanner();
      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5Qrcode;
      scannedRef.current = false;
      setScanning(true);

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (scannedRef.current) return;
          const data = parseQRData(decodedText);
          if (data) {
            scannedRef.current = true;
            setParsedQR(data);
            stopScanner();
          }
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setCameraError('Camera not available. Use manual mode below.');
    }
  };

  const handleManualParse = () => {
    const data = parseQRData(manualData);
    setParsedQR(data ?? { type: 'main', name: manualData || 'Unknown', userId: 'user-manual' });
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); resetState(); }, 900);
  };

  const resetState = () => {
    setParsedQR(null);
    setManualData('');
    setAmount('');
    setCameraError(null);
  };

  const amt = parseFloat(amount);
  const isValidAmount = !isNaN(amt) && amt > 0 && amt <= mockMainBalance;

  return (
    <div className="px-6 xl:px-8 py-6 xl:py-8 max-w-[1400px] space-y-6">

      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">QR Pay</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Scan a QR code to send money or contribute to a goal</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT: scanner + form ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Mode toggle — hide when QR already parsed */}
          {!parsedQR && (
            <div className="flex gap-3">
              {([
                { mode: 'camera', icon: Camera,   label: 'Camera Scan'  },
                { mode: 'manual', icon: Keyboard, label: 'Manual Input' },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => { stopScanner(); setScanMode(mode); setCameraError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${
                    scanMode === mode
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Camera mode ── */}
            {scanMode === 'camera' && !parsedQR && (
              <motion.div key="camera" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-6 space-y-4">

                {/* Actual Html5Qrcode mount target */}
                <div
                  id={scannerContainerId}
                  className="rounded-2xl overflow-hidden border-2 border-primary/30 w-full"
                  style={{ minHeight: 300 }}
                />

                {cameraError && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" /> {cameraError}
                  </div>
                )}

                {!scanning ? (
                  <Button variant="hero" className="w-full" onClick={startScanner}>
                    <Camera className="w-4 h-4 mr-2" /> Start Camera
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={stopScanner}>
                    <X className="w-4 h-4 mr-2" /> Stop Scanner
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Point your camera at a Piggywise QR code
                </p>
              </motion.div>
            )}

            {/* ── Manual mode ── */}
            {scanMode === 'manual' && !parsedQR && (
              <motion.div key="manual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-6 space-y-4">

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">QR Code Data</Label>
                  <Input
                    placeholder="Paste QR payload… (try: demo-p2p or demo-piggy)"
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  {['demo-p2p', 'demo-piggy'].map(v => (
                    <button key={v} type="button" onClick={() => setManualData(v)}
                      className="px-3 py-1 rounded-full text-xs border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">
                      {v}
                    </button>
                  ))}
                </div>

                <Button variant="hero" className="w-full" onClick={handleManualParse} disabled={!manualData.trim()}>
                  <QrCode className="w-4 h-4 mr-2" /> Decode QR
                </Button>
              </motion.div>
            )}

            {/* ── Transfer form (after QR parsed) ── */}
            {parsedQR && (
              <motion.div key="transfer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">

                {/* Recipient */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sending To</p>
                    <button onClick={resetState} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {parsedQR.type === 'main'
                        ? <User className="w-5 h-5 text-primary" />
                        : <PiggyBank className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{parsedQR.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parsedQR.type === 'main' ? 'P2P Transfer' : 'Piggy Contribution'}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />
                  </div>
                </div>

                {/* Amount */}
                <form onSubmit={handleTransfer} className="glass rounded-2xl p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                      className="bg-secondary border-border text-foreground text-2xl font-bold h-14"
                    />
                    {amount && (
                      <p className={`text-xs font-medium ${amt > mockMainBalance ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {amt > mockMainBalance
                          ? `Exceeds balance by ${formatCurrency(amt - mockMainBalance)}`
                          : `Remaining: ${formatCurrency(mockMainBalance - amt)}`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={!isValidAmount || loading}>
                      {loading ? 'Sending…' : <><ArrowRight className="w-4 h-4 mr-1.5" /> Confirm Transfer</>}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetState}>Cancel</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: balance + summary + tips ── */}
        <div className="xl:col-span-1 space-y-4">

          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Available Balance</p>
            <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(mockMainBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">Main Account · USD</p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Summary</p>
            <div className="space-y-2.5">
              {[
                { label: 'To',     value: parsedQR?.name || '—' },
                { label: 'Type',   value: parsedQR ? (parsedQR.type === 'main' ? 'P2P Transfer' : 'Piggy Contribution') : '—' },
                { label: 'Amount', value: isValidAmount ? formatCurrency(amt) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                </div>
              ))}
              {isValidAmount && parsedQR && (
                <div className="border-t border-border pt-2.5 flex justify-between">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(amt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">How it works</p>
            {[
              { step: '1', text: 'Scan or paste a QR code from another user' },
              { step: '2', text: 'Enter the amount you want to send'          },
              { step: '3', text: 'Confirm — funds transfer instantly'         },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
