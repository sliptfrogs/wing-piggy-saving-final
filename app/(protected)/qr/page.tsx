"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    PiggyBank, Camera, Upload, X, User, QrCode, ArrowRight,
    CheckCircle2, Info, AlertCircle, ScanLine, DollarSign,
    RefreshCw, Sparkles, Shield, Zap, Image as ImageIcon, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    if (trimmed === 'demo-p2p') return { type: 'main', name: 'Jane Smith', userId: 'user-jane' };
    if (trimmed === 'demo-piggy') return { type: 'piggy', name: 'Vacation Fund', piggyId: 'goal-2' };
    // try JSON fallback
    try {
        const data = JSON.parse(trimmed) as QRPayload;
        if (data.type && (data.userId || data.piggyId)) return data;
    } catch { }
    return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QRScanner() {
    const router = useRouter();
    const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [parsedQR, setParsedQR] = useState<QRPayload | null>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannedRef = useRef(false);
    const scannerContainerId = 'qr-reader';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2) await scannerRef.current.stop();
            } catch { }
            scannerRef.current = null;
        }
        setScanning(false);
    }, []);

    useEffect(() => () => { stopScanner(); }, [stopScanner]);

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
                    if (scannedRef.current) return;
                    const data = parseQRData(decodedText);
                    if (data) {
                        scannedRef.current = true;
                        setParsedQR(data);
                        await stopScanner();
                    }
                },
                (errorMessage) => {
                    // Silently ignore non-QR frames
                    if (errorMessage.includes('No QR code found')) return;
                    console.debug(errorMessage);
                }
            );
        } catch (err: any) {
            setScanning(false);
            if (err?.message?.includes('permission') || err?.name === 'NotAllowedError') {
                setPermissionDenied(true);
                setCameraError('Camera permission denied. Please allow camera access and try again.');
            } else {
                setCameraError('Unable to start camera. Try upload mode below.');
            }
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploading(true);

        // Check file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file');
            setUploading(false);
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size should be less than 5MB');
            setUploading(false);
            return;
        }

        try {
            // Create preview URL
            const imageUrl = URL.createObjectURL(file);
            setUploadedImage(imageUrl);

            // Initialize HTML5 QR Code scanner for image
            const html5Qrcode = new Html5Qrcode('qr-upload-reader');

            // Decode QR from image
            const decodedText = await html5Qrcode.scanFile(file, false);

            const data = parseQRData(decodedText);
            if (data) {
                setParsedQR(data);
                setUploadError(null);
            } else {
                setUploadError('No valid QR code found in the image');
                setUploadedImage(null);
            }
        } catch (error) {
            console.error('QR decode error:', error);
            setUploadError('Failed to read QR code from image. Please try another image.');
            setUploadedImage(null);
        } finally {
            setUploading(false);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            resetState();
            router.push('/dashboard');
        }, 900);
    };

    const resetState = () => {
        setParsedQR(null);
        setUploadedImage(null);
        setAmount('');
        setCameraError(null);
        setPermissionDenied(false);
        setUploadError(null);
    };

    const amt = parseFloat(amount);
    const isValidAmount = !isNaN(amt) && amt > 0 && amt <= mockMainBalance;

    return (
        <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6 xl:py-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

            {/* Header with gradient accent */}
            <div className="relative">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground flex items-center gap-2">
                    <ScanLine className="w-6 h-6 text-primary" />
                    QR Pay
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Scan a QR code to send money instantly</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT: scanner + form ── */}
                <div className="lg:col-span-3 space-y-4">

                    {/* Mode toggle — hide when QR already parsed */}
                    {!parsedQR && (
                        <div className="flex gap-3">
                            {([
                                { mode: 'camera', icon: Camera, label: 'Camera Scan', desc: 'Use your camera' },
                                { mode: 'upload', icon: Upload, label: 'Upload Image', desc: 'Upload QR image' },
                            ] as const).map(({ mode, icon: Icon, label, desc }) => (
                                <button
                                    key={mode}
                                    onClick={() => { stopScanner(); setScanMode(mode); setCameraError(null); setPermissionDenied(false); setUploadError(null); }}
                                    className={cn(
                                        "flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all",
                                        scanMode === mode
                                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                            : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", scanMode === mode ? "text-primary" : "text-muted-foreground")} />
                                    <span className={cn("text-sm font-semibold", scanMode === mode ? "text-primary" : "text-foreground")}>
                                        {label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{desc}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* ── Camera mode ── */}
                        {scanMode === 'camera' && !parsedQR && (
                            <motion.div
                                key="camera"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass rounded-2xl p-5 sm:p-6 space-y-4"
                            >
                                {/* Scanner container */}
                                <div className="relative">
                                    <div
                                        id={scannerContainerId}
                                        className={cn(
                                            "rounded-xl overflow-hidden bg-black/5 w-full transition-all",
                                            scanning && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        )}
                                        style={{ minHeight: 300 }}
                                    />
                                    {!scanning && !cameraError && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                                            <div className="text-center space-y-3">
                                                <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                                                <p className="text-sm text-muted-foreground">Camera is off</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Error messages */}
                                {cameraError && (
                                    <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                        <span className="text-destructive text-sm">{cameraError}</span>
                                    </div>
                                )}

                                {/* Camera controls */}
                                <div className="flex gap-3">
                                    {!scanning ? (
                                        <Button variant="hero" className="flex-1 gap-2" onClick={startScanner}>
                                            <Camera className="w-4 h-4" /> Start Camera
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" className="flex-1 gap-2" onClick={stopScanner}>
                                                <X className="w-4 h-4" /> Stop
                                            </Button>
                                            <Button variant="outline" className="flex-1 gap-2" onClick={startScanner}>
                                                <RefreshCw className="w-4 h-4" /> Restart
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Tips */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                                    <Shield className="w-3 h-3" />
                                    <span>Point camera at a Piggywise QR code</span>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Upload mode ── */}
                        {scanMode === 'upload' && !parsedQR && (
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

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="qr-upload"
                                    />

                                    {/* Upload area */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                                            uploading ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
                                        )}
                                    >
                                        {uploading ? (
                                            <div className="space-y-3">
                                                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                                                <p className="text-sm text-muted-foreground">Processing image...</p>
                                            </div>
                                        ) : uploadedImage ? (
                                            <div className="space-y-3">
                                                <img src={uploadedImage} alt="Uploaded QR" className="max-h-40 mx-auto rounded-lg" />
                                                <p className="text-sm text-primary">Click to upload another</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                                                <p className="text-sm text-muted-foreground">Click or drag to upload QR code image</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hidden QR reader container for file scanning */}
                                    <div id="qr-upload-reader" className="hidden" />
                                </div>

                                {/* Error messages */}
                                {uploadError && (
                                    <div className="flex items-start gap-2 text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                        <span className="text-destructive text-sm">{uploadError}</span>
                                    </div>
                                )}

                                {/* Demo shortcuts */}
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground text-center">Or try demo QR data:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['demo-p2p', 'demo-piggy'].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => {
                                                    const data = parseQRData(v);
                                                    if (data) setParsedQR(data);
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-mono border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Transfer form (after QR parsed) ── */}
                        {parsedQR && (
                            <motion.div
                                key="transfer"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                {/* Recipient card */}
                                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Zap className="w-3 h-3" />
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
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                                            parsedQR.type === 'main' ? "bg-primary/10" : "bg-accent/10"
                                        )}>
                                            {parsedQR.type === 'main'
                                                ? <User className="w-6 h-6 text-primary" />
                                                : <PiggyBank className="w-6 h-6 text-accent" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground text-lg">{parsedQR.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {parsedQR.type === 'main' ? 'P2P Transfer' : 'Piggy Contribution'}
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                                    </div>
                                </div>

                                {/* Amount form */}
                                <form onSubmit={handleTransfer} className="glass rounded-2xl p-5 space-y-4">
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
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="0.01"
                                                step="0.01"
                                                required
                                                className="pl-10 bg-secondary border-border text-foreground text-2xl font-bold h-14"
                                            />
                                        </div>
                                        {amount && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "text-xs font-medium",
                                                    amt > mockMainBalance ? "text-destructive" : "text-muted-foreground"
                                                )}
                                            >
                                                {amt > mockMainBalance
                                                    ? `⚠️ Exceeds balance by ${formatCurrency(amt - mockMainBalance)}`
                                                    : `✓ Remaining: ${formatCurrency(mockMainBalance - amt)}`}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Quick amount buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        {[10, 25, 50, 100].map(quickAmount => (
                                            <button
                                                key={quickAmount}
                                                type="button"
                                                onClick={() => setAmount(quickAmount.toString())}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                                            >
                                                ${quickAmount}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            size="lg"
                                            className="flex-1 gap-2"
                                            disabled={!isValidAmount || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight className="w-4 h-4" /> Confirm Transfer
                                                </>
                                            )}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetState} disabled={loading}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
