// hooks/useCreateEquity.ts
// React hook for creating equity tokens using the ATS SDK

"use client";

import { useState, useCallback } from 'react';
import { ATSService, type CreateEquityParams, type SecurityResult } from '@/lib/hedera/ATSService';
import { ApiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';

export interface UseCreateEquityOptions {
    companyId: string;
    onSuccess?: (result: SecurityResult) => void;
    onError?: (error: string) => void;
}

export interface UseCreateEquityReturn {
    createEquity: (params: CreateEquityParams) => Promise<SecurityResult>;
    isLoading: boolean;
    error: string | null;
    result: SecurityResult | null;
    reset: () => void;
}

export function useCreateEquity(options: UseCreateEquityOptions): UseCreateEquityReturn {
    const { companyId, onSuccess, onError } = options;
    const { token } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SecurityResult | null>(null);

    const createEquity = useCallback(async (params: CreateEquityParams): Promise<SecurityResult> => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('[useCreateEquity] Starting equity creation...');

            // Step 1: Initialize SDK if not already done
            if (!ATSService.isSDKInitialized()) {
                console.log('[useCreateEquity] Initializing ATS SDK...');
                await ATSService.init();
            }

            // Step 2: Check if wallet is connected through ATS
            // Note: The SDK should use the connected wallet
            // If not connected via ATS, we may need to connect
            if (!ATSService.isWalletConnected()) {
                console.log('[useCreateEquity] Connecting wallet through ATS...');
                await ATSService.connectWallet();
            }

            // Step 3: Create the equity token on-chain
            // This will prompt the user to sign in their wallet
            console.log('[useCreateEquity] Creating equity on-chain...');
            const deployResult = await ATSService.createEquity(params);

            if (!deployResult.success) {
                throw new Error(deployResult.error || 'Failed to deploy equity token');
            }

            console.log('[useCreateEquity] Equity deployed:', deployResult);

            // Step 4: Save to backend database
            if (token && deployResult.assetAddress) {
                console.log('[useCreateEquity] Saving to database...');
                try {
                    const equityPayload = {
                        name: params.name,
                        symbol: params.symbol,
                        totalSupply: params.numberOfShares,
                        decimals: 18,
                        dividendYield: params.dividendYield || 0,
                        votingRights: params.votingRights,
                        regulationType: params.regulationType,
                        companyId,
                        assetAddress: deployResult.assetAddress,
                        transactionId: deployResult.transactionId,
                        treasuryAccountId: params.companyAccountId,
                        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
                    };

                    await ApiClient.createEquity(companyId, equityPayload, token);
                    console.log('[useCreateEquity] Saved to database successfully');
                } catch (dbError: any) {
                    console.warn('[useCreateEquity] Failed to save to database:', dbError);
                    // Don't fail the whole operation if DB save fails
                    // The token is already deployed on-chain
                }
            }

            setResult(deployResult);
            onSuccess?.(deployResult);
            return deployResult;

        } catch (err: any) {
            console.error('[useCreateEquity] Error:', err);
            const errorMessage = err.message || 'Failed to create equity';
            setError(errorMessage);
            onError?.(errorMessage);

            const errorResult: SecurityResult = {
                success: false,
                error: errorMessage,
            };
            setResult(errorResult);
            return errorResult;

        } finally {
            setIsLoading(false);
        }
    }, [companyId, token, onSuccess, onError]);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setResult(null);
    }, []);

    return {
        createEquity,
        isLoading,
        error,
        result,
        reset,
    };
}

export default useCreateEquity;
