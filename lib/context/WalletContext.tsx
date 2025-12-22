"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dAppConnector } from "@/lib/hedera/walletConfig";
import type { SessionTypes } from "@walletconnect/types";
import type {
  SignAndExecuteTransactionParams,
  SignAndExecuteTransactionResult,
} from "@hashgraph/hedera-wallet-connect";

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
  account: WalletAccount | null; // ✅ added for compatibility
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
  const [account, setAccount] = useState<WalletAccount | null>(null); // ✅ added
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing session
  useEffect(() => {
    const loadExistingSession = async () => {
      try {
        if (!dAppConnector.walletConnectClient) return;
        const activeSessions = Object.values(
          dAppConnector.walletConnectClient.session.getAll()
        );
        if (activeSessions.length > 0) {
          const activeSession = activeSessions[0];
          setSession(activeSession);
          const accountId = activeSession.namespaces?.hedera?.accounts?.[0];
          if (accountId) {
            setAccount({ accountId });
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Error loading existing session:", err);
      }
    };
    loadExistingSession();
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      const newSession = await dAppConnector.connect((uri: string) => {
        console.log("WalletConnect URI:", uri);
      });

      setSession(newSession);
      const accountId = newSession.namespaces?.hedera?.accounts?.[0];
      if (accountId) setAccount({ accountId });
      setIsConnected(true);
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      if (session) {
        await dAppConnector.disconnect(session.topic);
      }
      setSession(null);
      setAccount(null);
      setIsConnected(false);
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
      setError("Failed to disconnect wallet");
    }
  };

  const signAndExecuteTransaction = async (
    transaction: Uint8Array | string
  ) => {
    if (!session || !account) {
      setError("Wallet not connected");
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);

      const params: SignAndExecuteTransactionParams = {
        signerAccountId: account.accountId,
        transactionList: transaction as string,
      };

      const result: SignAndExecuteTransactionResult =
        await dAppConnector.signAndExecuteTransaction(params);

      const txId =
        (result as any).transactionIds?.[0] ||
        (result as any).transactionId ||
        "unknown";

      return txId;
    } catch (err: any) {
      console.error("Transaction error:", err);
      setError(err.message || "Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        isConnected,
        session,
        account, // ✅ exposed here
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
