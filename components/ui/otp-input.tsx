"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OTPVerificationScreenProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, error, disabled }: OTPVerificationScreenProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Reset on error
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setDigits(Array(length).fill(''));
        inputRefs.current[0]?.focus();
      }, 400);
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d !== '') && digit) {
      onComplete(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const newDigits = Array(length).fill('');
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    if (pasted.length === length) {
      onComplete(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  return (
    <motion.div
      className="flex gap-3 justify-center"
      animate={error ? { x: [0, -12, 12, -8, 8, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-secondary text-foreground outline-none transition-all
            ${digit ? 'border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]' : 'border-border'}
            ${error ? 'border-destructive bg-destructive/10' : ''}
            focus:border-primary focus:shadow-[0_0_12px_hsl(var(--primary)/0.3)]
          `}
        />
      ))}
    </motion.div>
  );
}
