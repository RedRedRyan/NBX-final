"use client";

import React from "react";
import { useWallet } from "@/lib/context/WalletContext";

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

  const handleConnect = async () => {
    try {
      await connect();
      if (account?.accountId && onAccountConnected) {
        onAccountConnected(account.accountId);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onAccountConnected) onAccountConnected("");
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
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Connecting..." : "Connect to Hedera Wallet"}
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

      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
