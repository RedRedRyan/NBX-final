// lib/hedera/ATSService.ts
"use client";

import {
    Network,
    ConnectRequest,
    InitializationRequest,
    Equity,
    Bond,
    CreateEquityRequest,
    CreateBondRequest,
    SupportedWallets,
    type InitializationData,
    type NetworkData,
    type WalletEvent,
    type SecurityViewModel,
} from '@hashgraph/asset-tokenization-sdk';
import type { SignAndExecuteTransactionParams, SignAndExecuteTransactionResult } from '@hashgraph/hedera-wallet-connect';

// Configuration from environment
const getATSConfig = () => ({
    network: (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    mirrorNode: {
        name: 'Mirror',
        baseUrl: process.env.NEXT_PUBLIC_MIRROR_NODE || 'https://testnet.mirrornode.hedera.com',
        apiKey: '',
        headerName: '',
    },
    rpcNode: {
        name: 'RPC',
        baseUrl: process.env.NEXT_PUBLIC_RPC_NODE || 'https://testnet.hashio.io/api',
        apiKey: '',
        headerName: '',
    },
    factoryAddress: process.env.NEXT_PUBLIC_RPC_FACTORY || '',
    resolverAddress: process.env.NEXT_PUBLIC_RPC_RESOLVER || '',
    walletConnectProjectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '',
});

export interface ATSWalletState {
    isConnected: boolean;
    address: string;
    initData: InitializationData | null;
    networkData: NetworkData | null;
}

export interface CreateEquityParams {
    name: string;
    symbol: string;
    isin: string;
    numberOfShares: string;
    denomination: string;
    denominationValue?: string; // e.g. "1.00"
    regulationType: 'REG_D' | 'REG_S' | 'REG_CF';
    regulationSubType?: string;
    dealType?: string;
    dividendYield?: number;
    votingRights: boolean;
    kycProviderAddress?: string;
    pauseAddress?: string;
    companyName: string;
    companyAccountId: string;
}

export interface CreateBondParams {
    name: string;
    symbol: string;
    totalSupply: string;
    couponRate: number;
    maturityDate: Date;
    denomination: string;
    regulationType: 'REG_D' | 'REG_S' | 'REG_CF';
    companyName: string;
    companyAccountId: string;
}

export interface SecurityResult {
    success: boolean;
    security?: SecurityViewModel;
    assetAddress?: string;
    transactionId?: string;
    error?: string;
}

class ATSServiceClass {
    private initData: InitializationData | null = null;
    private networkData: NetworkData | null = null;
    private isInitialized = false;
    private config = getATSConfig();

    /**
     * This sets up network configuration
     */
    async init(events?: Partial<WalletEvent>): Promise<void> {
        if (this.isInitialized) {
            // If already initialized, we can't easily re-bind events in the current SDK design 
            // without re-initializing or having a setter. 
            // For now, we assume init is called once by WalletContext.
            console.log('[ATS] SDK already initialized');
            return;
        }

        try {
            const initRequest = new InitializationRequest({
                network: this.config.network,
                mirrorNode: this.config.mirrorNode,
                rpcNode: this.config.rpcNode,
                configuration: {
                    factoryAddress: this.config.factoryAddress,
                    resolverAddress: this.config.resolverAddress,
                },
                events: events || {},
            });

            await Network.init(initRequest);
            this.isInitialized = true;
            console.log('[ATS] SDK initialized successfully');
        } catch (error) {
            console.error('[ATS] SDK initialization error:', error);
            throw error;
        }
    }

    /**
     * Connect wallet using WalletConnect
     * This triggers the wallet modal and gets user approval
     */
    async connectWallet(walletType: SupportedWallets = SupportedWallets.HWALLETCONNECT): Promise<InitializationData> {
        try {
            // Build HWC settings if using WalletConnect
            let hwcSettings;
            if (walletType === SupportedWallets.HWALLETCONNECT && this.config.walletConnectProjectId) {
                hwcSettings = {
                    projectId: this.config.walletConnectProjectId,
                    dappName: 'NBX',
                    dappDescription: 'Nairobi Stock Exchange - SME Capital Markets',
                    dappURL: typeof window !== 'undefined' ? window.location.origin : '',
                    dappIcons: [],
                };
            }

            const connectRequest = new ConnectRequest({
                network: this.config.network,
                mirrorNode: this.config.mirrorNode,
                rpcNode: this.config.rpcNode,
                hwcSettings,
                wallet: walletType,
            });

            this.initData = await Network.connect(connectRequest);
            console.log('[ATS] Wallet connected:', this.initData?.account?.id?.value);

            return this.initData;
        } catch (error) {
            console.error('[ATS] Wallet connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnectWallet(): Promise<boolean> {
        try {
            const result = await Network.disconnect();
            this.initData = null;
            console.log('[ATS] Wallet disconnected');
            return result;
        } catch (error) {
            console.error('[ATS] Disconnect error:', error);
            return false;
        }
    }

    /**
     * Get current wallet state
     */
    getWalletState(): ATSWalletState {
        return {
            isConnected: !!this.initData?.account,
            address: this.initData?.account?.id?.value || '',
            initData: this.initData,
            networkData: this.networkData,
        };
    }

    /**
     * Check if SDK is initialized
     */
    isSDKInitialized(): boolean {
        return this.isInitialized;
    }

    /**
     * Check if wallet is connected
     */
    isWalletConnected(): boolean {
        return !!this.initData?.account;
    }

    /**
     * Create an equity token
     */
    async createEquity(params: CreateEquityParams): Promise<SecurityResult> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const regulationType = this.getRegulationTypeNumber(params.regulationType);
            const regulationSubType = this.getRegulationSubTypeNumber(params.regulationSubType);

            // Ensure we have a connected account to set as owner
            const owner = this.initData?.account?.id?.value;
            if (!owner) {
                throw new Error("Wallet not connected. Cannot determine Diamond Owner.");
            }

            const ownerEvmAddress = this.hederaIdToEvmAddress(owner);
            const currencyBytes3 = this.stringToBytes3(params.denomination || 'USD');
            const zeroBytes32 = '0x' + '0'.repeat(64);
            const zeroAddress = '0x' + '0'.repeat(40);

            const request = new CreateEquityRequest({
                name: params.name,
                symbol: params.symbol,
                isin: params.isin || 'US0000000000',
                decimals: 0,
                isWhiteList: false,
                erc20VotesActivated: true,
                isControllable: true,
                arePartitionsProtected: false,
                clearingActive: false,
                internalKycActivated: true,
                isMultiPartition: false,
                votingRight: params.votingRights,
                informationRight: true,
                liquidationRight: true,
                subscriptionRight: true,
                conversionRight: false,
                redemptionRight: false,
                putRight: false,
                dividendRight: 1,
                currency: currencyBytes3,
                numberOfShares: params.numberOfShares,
                nominalValue: params.denominationValue || '1',
                nominalValueDecimals: 2,
                regulationType,
                regulationSubType,
                isCountryControlListWhiteList: false,
                countries: '',
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                }),
                configId: zeroBytes32,
                configVersion: 1,
                externalPausesIds: params.pauseAddress ? [params.pauseAddress] : [],
                externalKycListsIds: params.kycProviderAddress ? [params.kycProviderAddress] : [],
                complianceId: zeroAddress,
                identityRegistryId: zeroAddress,
                diamondOwnerAccount: ownerEvmAddress,
            });

            console.log('[ATS] Creating equity with request:', request);
            const result = await Equity.create(request);
            console.log('[ATS] Equity created successfully:', result);

            return {
                success: true,
                security: result.security,
                assetAddress: result.security.diamondAddress?.toString(),
                transactionId: result.transactionId,
            };
        } catch (error: any) {
            console.error('[ATS] Equity creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create equity',
            };
        }
    }

    private stringToBytes3(str: string): string {
        let n: number;
        if (str.length !== 3) {
            // Fallback or pad/truncate
            // If shorter than 3, pad with nulls? Or just take first 3 chars. 
            // Simplest: just take first 3 chars.
            str = str.substring(0, 3).padEnd(3, '\0');
        }

        let hex = '0x';
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16);
        }
        return hex;
    }

    private hederaIdToEvmAddress(hederaId: string): string {
        // Simple conversion for 0.0.x to 0x0...x
        // Assumes format x.y.z
        try {
            const parts = hederaId.split('.');
            if (parts.length === 3) {
                const num = parseInt(parts[2], 10);
                const hex = num.toString(16);
                return '0x' + hex.padStart(40, '0');
            }
            // If it's already an EVM address or other format, return as is (but SDK expects EVM)
            return hederaId;
        } catch (e) {
            return hederaId;
        }
    }

    /**
     * Create a bond token
     */
    async createBond(params: CreateBondParams): Promise<SecurityResult> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const regulationType = this.getRegulationTypeNumber(params.regulationType);

            const request = new CreateBondRequest({
                name: params.name,
                symbol: params.symbol,
                isin: '',
                decimals: 18,
                isWhiteList: false,
                erc20VotesActivated: false,
                isControllable: true,
                arePartitionsProtected: false,
                clearingActive: false,
                internalKycActivated: true,
                isMultiPartition: false,
                currency: 'KES',
                numberOfUnits: params.totalSupply,
                nominalValue: params.denomination,
                nominalValueDecimals: 2,
                regulationType,
                regulationSubType: 0,
                isCountryControlListWhiteList: false,
                countries: '',
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                    couponFrequency: 4,
                    couponRate: params.couponRate.toString(),
                    firstCouponDate: new Date().toISOString(),
                }),
                configId: '',
                configVersion: 1,
                complianceId: '',
                identityRegistryId: '',
                diamondOwnerAccount: '',
                startingDate: new Date().toISOString(),
                maturityDate: params.maturityDate.toISOString(),
            });

            console.log('[ATS] Creating bond with request:', request);
            const result = await Bond.create(request);
            console.log('[ATS] Bond created successfully:', result);

            return {
                success: true,
                security: result.security,
                assetAddress: result.security.diamondAddress?.toString(),
                transactionId: result.transactionId,
            };
        } catch (error: any) {
            console.error('[ATS] Bond creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create bond',
            };
        }
    }

    /**
     * Sign and execute a generic transaction
     * Note: This requires access to the underlying connector which might be encapsulated.
     * We will attempt to use the Network's connected state.
     */
    async signAndExecuteTransaction(transaction: Uint8Array | string): Promise<string> {
        // TODO: The Asset Tokenization SDK might not expose a direct generic signer.
        // typically SDKs wrap the connector. 
        // We will try to find a way, but for now we might have to rely on the specific methods.
        // If the user's dApp needs generic signing (e.g. for simple transfers not covered by ATS),
        // we might need to expose the connector from the SDK if possible or use a workaround.

        // For the immediate fix of "Registry" error, we focus on connection.
        console.warn('[ATS] Generic signAndExecuteTransaction requested but implementation depends on SDK exposure.');
        throw new Error("Generic signing is not currently supported via ATSService wrapper. Use specific ATS methods.");
    }

    private getRegulationTypeNumber(regulationType: string): number {
        switch (regulationType) {
            case 'REG_D': return 1;
            case 'REG_S': return 2;
            case 'REG_CF': return 3;
            default: return 1;
        }
    }

    private getRegulationSubTypeNumber(subType?: string): number {
        if (!subType) return 0;
        switch (subType) {
            case '506-B': return 1;
            case '506-C': return 2;
            default: return 0;
        }
    }
}

export const ATSService = new ATSServiceClass();
export default ATSService;