"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";
import { initAppKit, openAppKitModal } from "@/lib/hedera/appKitConfig";

interface ConnectButtonProps {
  onAccountConnected?: (accountId: string) => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ onAccountConnected }) => {
  const {
    connect,
    disconnect,
    isConnected,
    account,
    loading,
    error,
  } = useWallet();
  const [appKitReady, setAppKitReady] = useState(false);
  const [appKitError, setAppKitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAppKit = async () => {
      try {
        await initAppKit();
        if (isMounted) setAppKitReady(true);
      } catch (err) {
        console.error("Failed to initialize AppKit:", err);
        if (isMounted) {
          setAppKitError("Failed to initialize wallet modal");
        }
      }
    };

    void bootstrapAppKit();

    return () => {
      isMounted = false;
    };
  }, []);

  // Watch for account changes and notify parent component
  useEffect(() => {
    if (onAccountConnected) {
      if (isConnected && account?.accountId) {
        onAccountConnected(account.accountId);
      } else if (!isConnected) {
        onAccountConnected("");
      }
    }
  }, [isConnected, account?.accountId, onAccountConnected]);

  const handleConnect = async () => {
    try {
      setAppKitError(null);

      if (!appKitReady) {
        await initAppKit();
        setAppKitReady(true);
      }

      await openAppKitModal({ view: "Connect" });
      await connect();
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

  const formatAccount = (accountId: string | undefined) => {
    if (!accountId) return "";
    return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {!isConnected ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading || !appKitReady}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Connecting..." : appKitReady ? "Connect via AppKit" : "Preparing AppKit..."}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm">
            {formatAccount(account?.accountId)}
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}

      {(error || appKitError) && (
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
          {error || appKitError}
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
