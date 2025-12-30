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
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to handle session update
  const handleSessionUpdate = (newSession: SessionTypes.Struct) => {
    setSession(newSession);
    const accountId = newSession.namespaces?.hedera?.accounts?.[0];
    if (accountId) {
      // Parse the account ID - format is typically "hedera:testnet:0.0.12345"
      const parsedAccountId = accountId.includes(':')
        ? accountId.split(':').pop()
        : accountId;
      setAccount({ accountId: parsedAccountId || accountId });
      setIsConnected(true);
    }
  };

  // Initialize the dAppConnector on mount
  useEffect(() => {
    const initConnector = async () => {
      try {
        // Only initialize in browser environment
        if (typeof window === 'undefined') return;

        // Check if already initialized
        if ((dAppConnector as any).walletConnectClient) {
          setIsInitialized(true);
          return;
        }

        // Initialize the connector
        await dAppConnector.init();
        setIsInitialized(true);
        console.log("DAppConnector initialized successfully");

        // Set up event listeners for session changes
        const client = (dAppConnector as any).walletConnectClient;
        if (client) {
          // Listen for session events
          client.on('session_event', (event: any) => {
            console.log('Session event:', event);
          });

          client.on('session_update', ({ topic, params }: any) => {
            console.log('Session update:', topic, params);
            const updatedSession = client.session.get(topic);
            if (updatedSession) {
              handleSessionUpdate(updatedSession);
            }
          });

          client.on('session_delete', () => {
            console.log('Session deleted');
            setSession(null);
            setAccount(null);
            setIsConnected(false);
          });

          // Check for existing sessions after init
          if (client.session) {
            const activeSessions = client.session.getAll();
            const sessionValues = Object.values(activeSessions) as SessionTypes.Struct[];
            if (sessionValues.length > 0) {
              handleSessionUpdate(sessionValues[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error initializing DAppConnector:", err);
        setError("Failed to initialize wallet connection");
      }
    };

    initConnector();
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure connector is initialized
      if (!isInitialized) {
        await dAppConnector.init();
        setIsInitialized(true);
      }

      // Use openModal() to show the WalletConnect modal with QR code
      // This allows users to scan QR code or select wallet extension
      await dAppConnector.openModal();

      // After modal interaction, check for new sessions
      const client = (dAppConnector as any).walletConnectClient;
      if (client?.session) {
        const activeSessions = client.session.getAll();
        const sessionValues = Object.values(activeSessions) as SessionTypes.Struct[];
        if (sessionValues.length > 0) {
          const activeSession = sessionValues[0];
          setSession(activeSession);
          const accountId = activeSession.namespaces?.hedera?.accounts?.[0];
          if (accountId) {
            // Parse the account ID - format is typically "hedera:testnet:0.0.12345"
            const parsedAccountId = accountId.includes(':')
              ? accountId.split(':').pop()
              : accountId;
            setAccount({ accountId: parsedAccountId || accountId });
            setIsConnected(true);
          }
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      // Don't show error if user just closed the modal
      if (err.message !== 'User rejected' && err.message !== 'Modal closed by user') {
        setError(err.message || "Failed to connect wallet");
      }
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
