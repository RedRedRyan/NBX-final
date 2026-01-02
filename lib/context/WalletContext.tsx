"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ATSService, type ATSWalletState } from '@/lib/hedera/ATSService';
import type { SessionTypes } from "@walletconnect/types";
import type { WalletEvent } from '@hashgraph/asset-tokenization-sdk';

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
  signAndExecuteTransaction: (
    transaction: Uint8Array | string
  ) => Promise<string>;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state from ATSService
  const syncState = () => {
    // ATSService.getWalletState() returns ATSWalletState
    const state = ATSService.getWalletState();
    setIsConnected(state.isConnected);

    // ATSService uses InitializationData which has 'account' object, usually with 'id'
    if (state.address) {
      setAccount({ accountId: state.address });
    } else {
      setAccount(null);
    }

    // Session is less accessible from ATS SDK public API usually, 
    // but the 'isConnected' and 'address' are the most critical.
    // If we need the actual session object, we might request it from SDK headers?
    // For now, we assume basic connectivity.
  };

  useEffect(() => {
    const initService = async () => {
      if (typeof window === 'undefined') return;
      if (ATSService.isSDKInitialized()) {
        setIsInitialized(true);
        syncState();
        return;
      }

      try {
        const events: Partial<WalletEvent> = {
          walletConnect: {
            onSessionDelete: () => {
              console.log('[WalletContext] Session deleted');
              setIsConnected(false);
              setAccount(null);
              setSession(null);
            },
            onSessionExpire: () => {
              console.log('[WalletContext] Session expired');
              setIsConnected(false);
              setAccount(null);
              setSession(null);
            }
            // Add other events if SDK supports them in the interface
          }
        };

        await ATSService.init(events);
        setIsInitialized(true);
        syncState();

        // If already connected (rehydrated by SDK)
        if (ATSService.isWalletConnected()) {
          syncState();
        }

      } catch (err: any) {
        console.error("[WalletContext] Error initializing ATSService:", err);
        setError("Failed to initialize wallet service");
      }
    };

    initService();
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure service is initialized
      if (!ATSService.isSDKInitialized()) {
        await ATSService.init();
      }

      await ATSService.connectWallet();
      syncState();

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
    try {
      await ATSService.disconnectWallet();
      setIsConnected(false);
      setAccount(null);
      setSession(null);
    } catch (err: any) {
      console.error("[WalletContext] Error disconnecting wallet:", err);
      setError("Failed to disconnect wallet");
    }
  };

  const signAndExecuteTransaction = async (
    transaction: Uint8Array | string
  ) => {
    // Proxy to ATSService
    return await ATSService.signAndExecuteTransaction(transaction);
  };

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        session,
        account,
        signAndExecuteTransaction,
        loading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
