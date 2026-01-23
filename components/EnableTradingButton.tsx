"use client";

import { useState } from 'react';
import ATSService from '@/lib/hedera/ATSService';

interface EnableTradingButtonProps {
    tokenId: string; // The security's assetAddress (HTS Token ID)
    totalSupply: string; // Total supply to approve
    onSuccess?: () => void;
}

// Backend Operator ID - this should match the OPERATOR_ID in your backend .env
const BACKEND_OPERATOR_ID = process.env.NEXT_PUBLIC_OPERATOR_ID || '0.0.7504602';

export default function EnableTradingButton({
    tokenId,
    totalSupply,
    onSuccess
}: EnableTradingButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleEnableTrading = async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            // Ensure wallet is connected
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            // Parse total supply as number for allowance amount
            const amount = parseInt(totalSupply.replace(/,/g, '')) || 1000000;

            console.log(`[EnableTrading] Approving ${amount} tokens for spender ${BACKEND_OPERATOR_ID}`);

            const result = await ATSService.approveMarketplaceAllowance(
                tokenId,
                BACKEND_OPERATOR_ID,
                amount
            );

            if (result.success) {
                console.log('✅ Trading enabled:', result.transactionId);
                setStatus('success');
                if (onSuccess) onSuccess();
            } else {
                throw new Error(result.error || 'Failed to enable trading');
            }
        } catch (error: any) {
            console.error('❌ Enable trading failed:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to enable trading');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex items-center gap-2 text-green-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Trading Enabled
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <button
                onClick={handleEnableTrading}
                disabled={status === 'loading'}
                className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${status === 'loading'
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'}
                    ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
                `}
            >
                {status === 'loading' ? (
                    <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enabling...
                    </span>
                ) : status === 'error' ? (
                    'Retry'
                ) : (
                    '🔓 Enable Trading'
                )}
            </button>
            {errorMessage && (
                <p className="text-red-400 text-xs">{errorMessage}</p>
            )}
        </div>
    );
}
