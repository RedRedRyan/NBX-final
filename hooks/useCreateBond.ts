"use client";

import { useState, useCallback } from 'react';
import { ATSService, type CreateBondParams, type SecurityResult } from '@/lib/hedera/ATSService';
import { ApiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';

// Re-export CreateBondParams from ATSService for external use
export type { CreateBondParams };

export interface UseCreateBondOptions {
    companyId: string;
    onSuccess?: (result: SecurityResult) => void;
    onError?: (error: string) => void;
}

export interface UseCreateBondReturn {
    createBond: (params: CreateBondParams) => Promise<SecurityResult>;
    isLoading: boolean;
    error: string | null;
    result: SecurityResult | null;
    reset: () => void;
}

/**
 * Helper to convert SDK transactionId object to string format
 * Format: "accountId@seconds.nanos" e.g. "0.0.7504602@1767700128.877901852"
 */
function formatTransactionId(txId: unknown): string {
    if (typeof txId === 'string') return txId;
    if (!txId || typeof txId !== 'object') return '';

    // Try using toString() if available
    if ('toString' in txId && typeof (txId as any).toString === 'function') {
        const str = (txId as any).toString();
        if (str !== '[object Object]') return str;
    }

    // Manual extraction for SDK TransactionId object
    const tx = txId as any;
    if (tx.accountId && tx.validStart) {
        const account = tx.accountId;
        const shard = account.shard?.low ?? 0;
        const realm = account.realm?.low ?? 0;
        const num = account.num?.low ?? 0;
        const seconds = tx.validStart.seconds?.low ?? 0;
        const nanos = tx.validStart.nanos?.low ?? 0;
        return `${shard}.${realm}.${num}@${seconds}.${nanos}`;
    }

    return JSON.stringify(txId);
}

export function useCreateBond(options: UseCreateBondOptions): UseCreateBondReturn {
    const { companyId, onSuccess, onError } = options;
    const { token } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SecurityResult | null>(null);

    const createBond = useCallback(async (params: CreateBondParams): Promise<SecurityResult> => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            console.log('[useCreateBond] Starting bond creation...');

            if (!ATSService.isSDKInitialized()) {
                await ATSService.init();
            }

            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            console.log('[useCreateBond] Creating bond on-chain...');
            const deployResult = await ATSService.createBond(params);

            if (!deployResult.success) {
                throw new Error(deployResult.error || 'Failed to deploy bond token');
            }

            console.log('[useCreateBond] Bond deployed:', deployResult);

            if (token && deployResult.assetAddress) {
                console.log('[useCreateBond] Saving to database...');
                try {
                    // Include all relevant fields from params and deployment result
                    const bondPayload = {
                        // Basic info
                        name: params.name,
                        symbol: params.symbol,
                        isin: params.isin,
                        decimals: params.decimals ?? 0,

                        // Bond economics
                        totalSupply: params.numberOfUnits || params.totalSupply,
                        faceValue: params.nominalValue,
                        nominalValue: params.nominalValue,
                        currency: params.currency,
                        couponRate: params.couponRate,
                        startingDate: params.startingDate instanceof Date
                            ? Math.floor(params.startingDate.getTime() / 1000)
                            : params.startingDate,
                        maturityDate: params.maturityDate instanceof Date
                            ? Math.floor(params.maturityDate.getTime() / 1000)
                            : params.maturityDate,

                        // Configuration
                        isControllable: params.isControllable ?? true,
                        isBlocklist: params.isBlocklist ?? true,
                        clearingModeEnabled: params.clearingModeEnabled ?? false,
                        internalKycActivated: params.internalKycActivated ?? false,

                        // Regulation
                        regulationType: params.regulationType,
                        regulationSubType: params.regulationSubType,

                        // On-chain details from deployment result
                        assetAddress: deployResult.assetAddress,
                        diamondAddress: deployResult.security?.diamondAddress?.toString() || deployResult.assetAddress,
                        transactionId: formatTransactionId(deployResult.transactionId),

                        // Company and network info
                        companyId,
                        issuer: params.companyName,
                        companyName: params.companyName,
                        treasuryAccountId: params.companyAccountId,
                        network: process.env.NEXT_PUBLIC_NETWORK || 'testnet',

                        // Status
                        status: 'active',
                        isTokenized: true,
                        tokenizedAt: new Date().toISOString(),
                    };

                    await ApiClient.createBond(companyId, bondPayload, token);
                    console.log('[useCreateBond] Saved to database successfully');
                } catch (dbError: any) {
                    console.warn('[useCreateBond] Failed to save to database:', dbError);
                }
            }

            setResult(deployResult);
            onSuccess?.(deployResult);
            return deployResult;

        } catch (err: any) {
            console.error('[useCreateBond] Error:', err);
            const errorMessage = err.message || 'Failed to create bond';
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
        createBond,
        isLoading,
        error,
        result,
        reset,
    };
}

export default useCreateBond;
