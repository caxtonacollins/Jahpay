import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TokenInfo } from 'types/swap';
import Image from 'next/image';

interface TokenSelectorProps {
  token: TokenInfo;
  onSelect: () => void;
  className?: string;
  disabled?: boolean;
}

export function TokenSelector({ token, onSelect, className, disabled = false }: TokenSelectorProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'h-14 w-full justify-between px-3 py-2 hover:bg-bg-tertiary/30 border-border/40',
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {token.icon ? (
          <Image
            src={token.icon}
            alt={token.name}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-celo-green/20 text-sm font-medium text-celo-green">
            {token.symbol[0]}
          </div>
        )}
        <div className="text-left">
          <div className="text-sm font-medium">{token.symbol}</div>
          {token.balance && (
            <div className="text-xs text-text-secondary">
              Bal: {token.balance}
            </div>
          )}
        </div>
      </div>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Button>
  );
}

interface TokenOptionProps {
  token: TokenInfo;
  isSelected: boolean;
  onSelect: (token: TokenInfo) => void;
}

export function TokenOption({ token, isSelected, onSelect }: TokenOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(token)}
      className={cn(
        'flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors',
        isSelected
          ? 'bg-celo-green/10 text-celo-green'
          : 'hover:bg-bg-tertiary/50'
      )}
    >
      {token.icon ? (
        <Image
          src={token.icon}
          alt={token.name}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-celo-green/20 text-sm font-medium text-celo-green">
          {token.symbol[0]}
        </div>
      )}
      <div>
        <div className="font-medium">{token.symbol}</div>
        <div className="text-sm text-text-secondary">{token.name}</div>
      </div>
      {token.balance && (
        <div className="ml-auto text-right">
          <div className="font-medium">{token.balance}</div>
          {token.usdValue && (
            <div className="text-sm text-text-secondary">
              ${token.usdValue.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
