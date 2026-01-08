"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import type { SessionTypes } from "@walletconnect/types";

// Define account shape for UI compatibility
interface WalletAccount {
  accountId: string;
  evmAddress?: string;
}

interface WalletContextType {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  session: SessionTypes.Struct | null;
  account: WalletAccount | null;
  loading: boolean;
  error: string | null;
  associateToken: (tokenId: string) => Promise<{ success: boolean; transactionId?: string; error?: string }>;
  isTokenAssociated: (tokenId: string) => Promise<boolean>;
  getTokenBalance: (tokenId: string) => Promise<{ balance: number; decimals: number } | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProviderInner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Use a ref to hold the service singleton to prevent import race conditions
  const atsServiceRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Service
  useEffect(() => {
    if (!isMounted) return;

    let mounted = true;

    const initService = async () => {
      try {
        // Dynamically import inside the effect
        const { ATSService: Service } = await import('@/lib/hedera/ATSService');

        // Assign to ref for use in other functions
        atsServiceRef.current = Service;

        if (!mounted) return;

        // Init logic
        if (!Service.isSDKInitialized()) {
          await Service.init();
        }

        // Sync initial state
        const state = Service.getWalletState();
        setIsConnected(state.isConnected);
        if (state.address) {
          setAccount({ accountId: state.address });
        }

      } catch (err: any) {
        console.error("[WalletContext] Error initializing ATSService:", err);
        if (mounted) setError("Failed to initialize wallet service");
      }
    };

    initService();

    return () => {
      mounted = false;
    };
  }, [isMounted]);

  const connect = async () => {
    if (!atsServiceRef.current) {
      setError("Wallet service loading...");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const Service = atsServiceRef.current;

      if (!Service.isSDKInitialized()) {
        await Service.init();
      }

      await Service.connectWallet();

      // Sync state after connect
      const state = Service.getWalletState();
      setIsConnected(state.isConnected);
      if (state.address) setAccount({ accountId: state.address });

    } catch (err: any) {
      console.error("[WalletContext] Wallet connection error:", err);
      if (err.message !== 'User rejected' && err.message !== 'Modal closed by user') {
        setError(err.message || "Failed to connect wallet");
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!atsServiceRef.current) return;
    try {
      await atsServiceRef.current.disconnectWallet();
      setIsConnected(false);
      setAccount(null);
      setSession(null);
    } catch (err: any) {
      console.error("[WalletContext] Error disconnecting wallet:", err);
      setError("Failed to disconnect wallet");
    }
  };

  // Helper to ensure service is ready before calling methods
  const withService = async <T,>(fn: (service: any) => Promise<T>): Promise<T> => {
    if (!atsServiceRef.current) throw new Error("Wallet service not initialized");
    return fn(atsServiceRef.current);
  };

  const associateToken = (tokenId: string) => withService<{ success: boolean; transactionId?: string; error?: string }>(s => s.associateToken(tokenId));
  const isTokenAssociated = (tokenId: string) => withService<boolean>(s => s.isTokenAssociated(tokenId));
  const getTokenBalance = (tokenId: string) => withService<{ balance: number; decimals: number } | null>(s => s.getTokenBalance(tokenId));



  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        session,
        account,
        loading,
        error,
        associateToken,
        isTokenAssociated,
        getTokenBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Export with dynamic loading disabled for SSR
export const WalletProvider = dynamic(
  () => Promise.resolve(WalletProviderInner),
  { ssr: false }
) as typeof WalletProviderInner;

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};