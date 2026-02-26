"use client";

import React, { useState } from 'react';
import ATSService from '@/lib/hedera/ATSService';

interface MintButtonProps {
    securityAddress: string;
    amountToMint: number;
    disabled?: boolean;
    onSuccess?: (txId: string) => void;
}

export const MintButton: React.FC<MintButtonProps> = ({
    securityAddress,
    amountToMint,
    disabled = false,
    onSuccess
}) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [txId, setTxId] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleMint = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled || status === 'loading') return;

        setStatus('loading');
        setErrorMsg('');
        setTxId('');

        try {
            // 1. Ensure wallet is connected
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            const walletState = ATSService.getWalletState();
            if (!walletState.isConnected || !walletState.address) {
                throw new Error("Wallet not connected");
            }
            const recipient = walletState.address;

            // 2. Call Issue (Mint)
            // Note: We use issueSecurityTokens as it corresponds to the "Minter Role" usually assigned for initial creation.
            // If "Agent Role" is needed, swap with mintSecurityTokens.
            // Converting amount to string as required by the new method signature.
            const result = await ATSService.issueSecurityTokens(securityAddress, amountToMint.toString(), recipient);

            if (result.success && result.transactionId) {
                setStatus('success');
                setTxId(result.transactionId);
                if (onSuccess) onSuccess(result.transactionId);
            } else {
                throw new Error(result.error || "Minting failed");
            }

        } catch (error: any) {
            console.error("Mint failed:", error);
            setStatus('error');
            setErrorMsg(error.message || "Failed to mint");
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleMint}
                disabled={disabled || status === 'loading'}
                className={`
                    px-4 py-2 rounded-md font-medium text-white transition-colors
                    ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                    ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Minting...
                    </span>
                ) : (
                    'Mint Tokens'
                )}
            </button>

            {status === 'success' && (
                <div className="text-xs text-green-500 mt-1">
                    <p>Mint Successful!</p>
                    <p className="truncate w-32">ID: {txId}</p>
                </div>
            )}

            {status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
            )}
        </div>
    );
};

export default MintButton;
