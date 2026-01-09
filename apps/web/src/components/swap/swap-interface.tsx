'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDown, ArrowRight, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import { TokenOption, TokenSelector } from './token-selector';
import { AmountInput } from './amount-input';
import { TokenInfo, SwapDirection, SwapFormData, Currency, Crypto } from 'types/swap';
import { CURRENCIES, CRYPTOS, PROVIDERS } from '@/config/site';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';

// Mock tokens - in a real app, these would come from your token list or API
const MOCK_TOKENS: Record<string, TokenInfo> = {
  CELO: {
    symbol: 'CELO',
    name: 'Celo Native',
    icon: '/tokens/celo.png',
    balance: '0.00',
    usdValue: 0,
  },
  cUSD: {
    symbol: 'cUSD',
    name: 'Celo Dollar',
    icon: '/tokens/cusd.png',
    balance: '0.00',
    usdValue: 0,
  },
  cEUR: {
    symbol: 'cEUR',
    name: 'Celo Euro',
    icon: '/tokens/ceur.png',
    balance: '0.00',
    usdValue: 0,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '/tokens/usdc.png',
    balance: '0.00',
    usdValue: 0,
  },
};

// Form validation schema
const swapFormSchema = z.object({
  fromAmount: z.string().min(1, 'Amount is required'),
  toAmount: z.string().min(1, 'Amount is required'),
  fromToken: z.string().min(1, 'Token is required'),
  toToken: z.string().min(1, 'Token is required'),
});

type SwapFormValues = z.infer<typeof swapFormSchema>;

export function SwapInterface() {
  const [direction, setDirection] = useState<SwapDirection>('buy');
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<'from' | 'to' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [availableTokens, setAvailableTokens] = useState<Record<string, TokenInfo>>(MOCK_TOKENS);


  const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      fromAmount: '',
      toAmount: '',
      fromToken: 'NGN',
      toToken: 'cUSD',
    },
  });

  const fromToken = watch('fromToken');
  const toToken = watch('toToken');
  const fromAmount = watch('fromAmount');
  const toAmount = watch('toAmount');

  // Toggle between buy/sell
  const toggleDirection = useCallback(() => {
    setIsSwitching(true);
    setDirection(prev => prev === 'buy' ? 'sell' : 'buy');
    
    // Swap tokens
    setValue('fromToken', toToken);
    setValue('toToken', fromToken);
    
    // Small delay for animation
    setTimeout(() => setIsSwitching(false), 300);
  }, [fromToken, toToken, setValue]);

  // Handle token selection
  const handleTokenSelect = useCallback((tokenSymbol: string) => {
    if (isTokenSelectorOpen === 'from') {
      setValue('fromToken', tokenSymbol);
    } else if (isTokenSelectorOpen === 'to') {
      setValue('toToken', tokenSymbol);
    }
    setIsTokenSelectorOpen(null);
  }, [isTokenSelectorOpen, setValue]);

  // Handle max button click
  const handleMaxClick = useCallback(() => {
    // In a real app, this would use the user's actual balance
    const maxBalance = '1000.00'; // Mock balance
    setValue('fromAmount', maxBalance);
  }, [setValue]);

  // Handle swap submission
  const onSubmit = async (data: SwapFormValues) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would call your swap API
      console.log('Submitting swap:', {
        from: data.fromToken,
        to: data.toToken,
        amount: data.fromAmount,
        direction,
        provider: selectedProvider,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Swap successful',
        description: `Successfully swapped ${data.fromAmount} ${data.fromToken} to ${data.toAmount} ${data.toToken}`,
      });
      
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "We couldn’t process that",
        description: "Nothing was charged. Try again in a moment.",
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get token info by symbol
  const getTokenInfo = useCallback((symbol: string): TokenInfo => {
    const currencyToken = Object.values(CURRENCIES).find(c => c.code === symbol);
    const token = availableTokens[symbol];
    
    if (token) return token;

    if (currencyToken) {
      return {
        symbol: currencyToken.code,
        name: currencyToken.name,
        icon: '',
        balance: '0.00',
        usdValue: 0
      };
    }

    // Fallback for unknown tokens
    return {
      symbol,
      name: symbol,
      icon: '',
      balance: '0.00',
      usdValue: 0
    };
  }, [availableTokens]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center">
          {direction === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                {direction === 'buy' ? 'You pay' : 'You receive'}
              </label>
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <Controller
                    name="fromAmount"
                    control={control}
                    render={({ field }) => (
                      <AmountInput
                        token={getTokenInfo(fromToken)}
                        value={field.value || ''}
                        onAmountChange={field.onChange}
                        onMaxClick={direction === 'sell' ? handleMaxClick : undefined}
                        error={errors.fromAmount?.message}
                        autoFocus
                        className="flex-1"
                      />
                    )}
                  />
                  <Controller
                    name="toToken"
                    control={control}
                    render={({ field: { value } }) => {
                      const token = getTokenInfo(value || '');
                      return (
                        <TokenSelector
                          token={token}
                          onSelect={() => setIsTokenSelectorOpen('to')}
                          className="w-40"
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleDirection}
                disabled={isSwitching}
                className={cn(
                  'p-2 rounded-full bg-bg-tertiary/50 border border-border/40',
                  'transition-transform hover:scale-105 active:scale-95',
                  isSwitching ? 'opacity-50' : ''
                )}
              >
                {isSwitching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowDown className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                {direction === 'buy' ? 'You receive' : 'You pay'}
              </label>
              <div className="flex items-center space-x-3">
                <Controller
                  name="toAmount"
                  control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                    <AmountInput
                      token={getTokenInfo(toToken)}
                        value={value || ''}
                        onAmountChange={onChange}
                      onMaxClick={direction === 'buy' ? handleMaxClick : undefined}
                      error={errors.toAmount?.message}
                      className="flex-1"
                      disabled={direction === 'buy'}
                    />
                  )}
                />
                <Controller
                  name="toToken"
                  control={control}
                    render={({ field: { value } }) => {
                      return (
                        <TokenSelector
                          token={getTokenInfo(toToken)}
                          onSelect={() => setIsTokenSelectorOpen('to')}
                          className="w-40"
                        />
                      );
                    }}
                />
              </div>
            </div>
            
            {/* Exchange rate and provider info */}
            <div className="rounded-lg bg-bg-tertiary/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Exchange rate</span>
                <span className="font-medium">1 {fromToken} = 0.00042 {toToken}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-text-secondary">Provider</span>
                <span className="font-medium">
                  {selectedProvider || 'Select a provider'}
                </span>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading || !selectedProvider}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Swap ${fromToken} to ${toToken}`
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Token selector modal */}
      {isTokenSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-bg-secondary p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Select a token</h3>
              <button
                onClick={() => setIsTokenSelectorOpen(null)}
                className="rounded-full p-1 hover:bg-bg-tertiary/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(availableTokens).map(([symbol, token]) => (
                <TokenOption
                  key={symbol}
                  token={token}
                  isSelected={symbol === (isTokenSelectorOpen === 'from' ? fromToken : toToken)}
                  onSelect={() => handleTokenSelect(symbol)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
