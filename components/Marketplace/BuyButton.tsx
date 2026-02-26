"use client";

import { useState } from 'react';
import ATSService from '@/lib/hedera/ATSService';
// Transaction import not strictly needed effectively since we handle it inside ATSService helper or pass bytes, 
// but user requested explicit flow. 
// ATSService.signAndExecuteTransaction handles the bytes directly.

interface BuyButtonProps {
    equityTokenId: string;
    stableCoinId: string;
    treasuryAccountId: string; // The seller
    amount: number;
    totalPrice: number;
    backendUrl?: string; // Optional URL override
}

export default function BuyButton({
    equityTokenId,
    stableCoinId,
    treasuryAccountId,
    amount,
    totalPrice,
    backendUrl = 'http://localhost:3000' // Default to localhost, should be env var in prod
}: BuyButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleBuy = async () => {
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
            const apiUrl = `${backendUrl}/trade/create-swap`;
            console.log(`Sending trade request to ${apiUrl}`);

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
                throw new Error(errorData.message || "Failed to create trade");
            }

            const { transactionBytes } = await response.json();

            // 3. Sign & Execute (Buyer pays the fees usually, or the backend paid)
            // We use the ATSService helper we saw earlier
            const txId = await ATSService.signAndExecuteTransaction(transactionBytes);

            console.log("✅ Trade Executed:", txId);
            setStatus('success');

        } catch (error: any) {
            console.error("❌ Trade Failed:", error);
            setStatus('error');
            setErrorMessage(error.message || "Trade failed");
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleBuy}
                disabled={status === 'loading'}
                className={`
                    font-bold py-2 px-4 rounded w-full transition-colors
                    ${status === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'}
                    ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                    ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
                `}
            >
                {status === 'loading' ? 'Processing...' :
                    status === 'success' ? 'Trade Complete!' :
                        status === 'error' ? 'Retry Buy' :
                            `Buy for $${totalPrice}`}
            </button>
            {errorMessage && (
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}
        </div>
    );
}
