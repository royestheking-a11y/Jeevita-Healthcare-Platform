import React, { useRef, useEffect, useState } from 'react';
import { Input } from './ui/input';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    const truncatedValue = value.slice(0, length);
    
    setOtp(truncatedValue);

    // Auto-submit when all digits are entered
    if (truncatedValue.length === length) {
      onComplete(truncatedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const truncatedValue = pastedData.slice(0, length);
    setOtp(truncatedValue);
    
    if (truncatedValue.length === length) {
      onComplete(truncatedValue);
    }
  };

  return (
    <div className="flex justify-center">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={length}
        value={otp}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        placeholder={`Enter ${length}-digit OTP`}
        className="w-full max-w-xs h-14 text-center text-2xl font-semibold tracking-widest border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg"
      />
    </div>
  );
}
