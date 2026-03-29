'use client';

import Image from 'next/image';
import {
  PiggyBank,
  Copy,
  Download,
  Share2,
  Check,
  Loader2,
  Wallet,
  QrCode,
} from 'lucide-react';
import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface QRDisplayProps {
  qrImageUrl?: string;
  isQRReady: boolean;
  qrLoading: boolean;
  target: 'main' | 'piggy';
  selectedGoal?: string | null;
  username?: string;
  onSelectGoal?: () => void;
}

const QRDisplay = forwardRef<HTMLDivElement, QRDisplayProps>(function QRDisplay(
  {
    qrImageUrl,
    isQRReady,
    qrLoading,
    target,
    selectedGoal,
    username = 'Channeang Yoeurn',
    onSelectGoal,
  },
  ref
) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrImageUrl) return;
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `qr-${username.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${username}'s QR Code`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Card */}
      <div
        ref={ref}
        className="glass rounded-2xl border border-border p-5 w-full max-w-xs flex flex-col items-center shadow-sm transition-all duration-300 hover:shadow-md"
      >
        {/* QR Frame */}
        <div className="w-[260px] h-[260px] rounded-xl relative overflow-hidden flex items-center justify-center bg-background">
          {/* Ready State */}
          {isQRReady && qrImageUrl && (
            <>
              <img
                src={qrImageUrl}
                alt="Payment QR Code"
                className="w-full h-full object-contain p-3"
              />
              {/* Center Badge */}
              <div className="absolute w-[52px] h-[52px] rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                {target === 'main' ? (
                  <Wallet className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <PiggyBank className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </>
          )}

          {/* Loading State with Shimmer */}
          {qrLoading && !isQRReady && (
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-secondary/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Generating QR...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isQRReady && !qrLoading && (
            <button
              onClick={onSelectGoal}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl hover:border-primary/40 transition-colors group bg-background"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                {target === 'piggy' && !selectedGoal ? (
                  <PiggyBank className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <QrCode className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1 px-4 text-center">
                <p className="text-sm font-medium text-foreground">
                  {target === 'piggy' && !selectedGoal
                    ? 'Select a goal'
                    : 'QR unavailable'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {target === 'piggy' && !selectedGoal
                    ? 'Choose a saving goal to generate your QR'
                    : 'Try refreshing or check your connection'}
                </p>
              </div>
              {target === 'piggy' && !selectedGoal && (
                <button className="mt-1 px-3 py-1 rounded-full text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors">
                  Pick a goal
                </button>
              )}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border my-4" />

        {/* Meta Information */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Name + Verified Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {username}
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-700">
                Verified
              </span>
            </div>
          </div>

          {/* KHQR Network Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border">
            <div className="relative w-3 h-3">
              <Image
                src="https://api.nuget.org/v3-flatcontainer/kh.org.nbc.bakongkhqr/1.0.0.9/icon"
                alt="KHQR"
                fill
                className="object-contain opacity-70"
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              Member of{' '}
              <span className="font-medium text-foreground">KHQR Network</span>
            </span>
          </div>

          {/* Support Information */}
          <div className="flex items-center gap-1.5 pt-3 border-t border-border w-full justify-center">
            <svg
              className="w-3 h-3 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.73a16 16 0 006.29 6.29l.91-.91a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z"
              />
            </svg>
            <span className="text-[10px] text-muted-foreground">
              Support 24/7
            </span>
            <span className="text-border">·</span>
            <span className="text-[10px] text-muted-foreground">
              023 999 989
            </span>
            <span className="text-border">·</span>
            <span className="text-[10px] text-muted-foreground">
              012 999 488
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isQRReady && (
        <div className="flex gap-2 w-full max-w-xs">
          <button
            onClick={handleCopy}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium border transition-all',
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-background border-border text-foreground hover:bg-secondary'
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:bg-secondary transition-all"
          >
            <Download size={13} />
            Save QR
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium border border-border bg-background text-foreground hover:bg-secondary transition-all"
          >
            <Share2 size={13} />
            Share
          </button>
        </div>
      )}

      {/* Scan Hint */}
      {isQRReady && (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
            />
          </svg>
          Point your camera at the QR to pay
        </p>
      )}
    </div>
  );
});

QRDisplay.displayName = 'QRDisplay';
export default QRDisplay;
