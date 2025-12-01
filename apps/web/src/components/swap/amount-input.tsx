import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TokenInfo } from 'types/swap';

export interface AmountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  token: TokenInfo;
  value: string;
  onAmountChange: (value: string) => void;
  onMaxClick?: () => void;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  fiatValue?: string;
}

export function AmountInput({
  token,
  value,
  onAmountChange,
  onMaxClick,
  error,
  className,
  autoFocus = false,
  fiatValue,
  ...props
}: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format the input value with proper decimal places
  const formatValue = useCallback((val: string): string => {
    if (!val) return '';
    
    // Remove any non-numeric characters except decimal point
    let formatted = val.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    
    // Limit decimal places
    if (parts.length === 2) {
      const decimals = parts[1];
      const maxDecimals = 18; // Max decimals for most tokens
      if (decimals.length > maxDecimals) {
        formatted = `${parts[0]}.${decimals.slice(0, maxDecimals)}`;
      }
    }
    
    return formatted;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatValue(e.target.value);
    onAmountChange(formattedValue);
  };

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="0.0"
          className={cn(
            'w-full bg-transparent py-4 text-2xl font-medium text-text-primary outline-none',
            'placeholder:text-text-secondary/50',
            'disabled:opacity-50',
            error ? 'text-red-500' : ''
          )}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {onMaxClick && (
          <button
            type="button"
            onClick={onMaxClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-celo-green/10 px-2 py-1 text-xs font-medium text-celo-green transition-colors hover:bg-celo-green/20"
          >
            MAX
          </button>
        )}
      </div>
      
      <div className="mt-1 flex items-center justify-between">
        {fiatValue && (
          <span className="text-sm text-text-secondary">
            ≈ {fiatValue}
          </span>
        )}
        <span className="ml-auto text-sm text-text-secondary">
          Balance: {token.balance || '0.00'} {token.symbol}
        </span>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
