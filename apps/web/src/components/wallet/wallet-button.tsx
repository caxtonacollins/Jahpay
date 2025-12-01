'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useEnsName, useEnsAvatar } from 'wagmi';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut } from 'lucide-react';
// import { shortenAddress } from 'lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button disabled className="bg-celo-green hover:bg-celo-green/90 text-black">
        Connect Wallet
      </Button>
    );
  }

  return (
    <RainbowConnectButton.Custom>
      {({ 
        account, 
        chain, 
        openAccountModal, 
        openChainModal, 
        openConnectModal, 
        authenticationStatus, 
        mounted: rainbowMounted 
      }) => {
        const ready = mounted && rainbowMounted;
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal} 
                    className="bg-celo-green hover:bg-celo-green/90 text-black"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal} 
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex items-center space-x-1 border-border/40 hover:bg-bg-tertiary/30"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-sm">{chain.name}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="border-border/40 hover:bg-bg-tertiary/30"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={ensAvatar || undefined} />
                        <AvatarFallback className="bg-celo-green text-black text-xs">
                          {account.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {account.displayName}
                      </span>
                    </div>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
