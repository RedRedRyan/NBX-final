"use client";

import { useState } from 'react';
import ATSService from '@/lib/hedera/ATSService';

interface InvestButtonProps {
    equityTokenId: string;
    stableCoinId: string;
    treasuryAccountId: string; // The seller (Company Treasury)
    amount: number;
    totalPrice: number;
    backendUrl?: string; // Optional URL override
    onSuccess?: (txId: string) => void;
}

export default function InvestButton({
    equityTokenId,
    stableCoinId,
    treasuryAccountId,
    amount,
    totalPrice,
    backendUrl = 'http://localhost:3000', // Default to localhost, should be env var in prod
    onSuccess
}: InvestButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleInvest = async () => {
        setStatus('loading');
        setErrorMessage('');
        try {
            // 1. Ensure Wallet Connected
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }
            const walletState = ATSService.getWalletState();
            if (!walletState.isConnected || !walletState.address) {
                throw new Error("Wallet not connected");
            }
            const buyerId = walletState.address;

            // 2. Request Transaction from Backend
            // Using the same trade endpoint as it handles the DvP logic correctly
            const apiUrl = `${backendUrl}/trade/create-swap`;
            console.log(`Sending investment request to ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerId,
                    equityTokenId,
                    stableCoinId,
                    treasuryId: treasuryAccountId,
                    amount,
                    price: totalPrice
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create investment transaction");
            }

            const { transactionBytes } = await response.json();

            // 3. Sign & Execute (Investor signs the swap)
            const txId = await ATSService.signAndExecuteTransaction(transactionBytes);

            console.log("✅ Investment Executed:", txId);
            setStatus('success');
            if (onSuccess) onSuccess(txId);

        } catch (error: any) {
            console.error("❌ Investment Failed:", error);
            setStatus('error');
            setErrorMessage(error.message || "Investment failed");
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <button
                onClick={handleInvest}
                disabled={status === 'loading' || status === 'success'}
                className={`
                    font-bold py-3 px-6 rounded-lg w-full transition-all duration-200 transform hover:scale-[1.02]
                    ${status === 'loading'
                        ? 'bg-gray-600 cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-lg shadow-primary/20'}
                    ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                    ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
                `}
            >
                {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : status === 'success' ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Investment Complete!
                    </span>
                ) : status === 'error' ? (
                    'Retry Investment'
                ) : (
                    `Invest $${totalPrice.toLocaleString()}`
                )}
            </button>
            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                    <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                </div>
            )}
            {status === 'success' && (
                <p className="text-green-500 text-sm text-center mt-1">
                    Holdings will update shortly.
                </p>
            )}
        </div>
    );
}
