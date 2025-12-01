'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { getNonce, verifySignature } from '@/lib/auth/helpers';
import { useUserProfile } from '@/lib/hooks/useUser';

type User = {
  id: string;
  walletAddress: string;
  // Add other user fields as needed
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (signMessageAsync: (message: string) => Promise<string>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user profile when wallet is connected
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile(address);

  useEffect(() => {
    if (userProfile) {
      setUser(userProfile as unknown as User);
    } else if (isDisconnected) {
      setUser(null);
    }
  }, [userProfile, isDisconnected]);

  const login = async (signMessageAsync: (message: string) => Promise<string>) => {
    if (!address) {
      throw new Error('No wallet connected');
    }

    try {
      setIsLoading(true);
      
      // Get nonce from server
      const { nonce, message } = await getNonce(address);
      
      // Sign the message
      const signature = await signMessageAsync(message);
      
      // Verify the signature
      const { token, user: userData } = await verifySignature(address, signature, message);
      
      // Store the token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('walletAddress', address);
      }
      
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['user-profile', address] });
      
      toast({
        title: 'Successfully connected',
        description: 'Your wallet has been connected successfully.',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        type: 'error',
      });
      // Disconnect wallet on error
      disconnect();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    disconnect();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('walletAddress');
    }
    setUser(null);
    queryClient.clear();
    router.push('/');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || isProfileLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
