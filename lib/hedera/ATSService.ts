// lib/hedera/ATSService.ts
// Client-side Asset Tokenization SDK service
// This runs entirely in the browser with wallet signing

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
    numberOfShares: string;
    denomination: string;
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
     * Initialize the SDK (without wallet connection)
     * This sets up network configuration
     */
    async init(events?: Partial<WalletEvent>): Promise<void> {
        if (this.isInitialized) return;

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

            // Improved mock for Metamask to satisfy stricter SDK checks
            if (typeof window !== 'undefined' && !(window as any).ethereum) {
                console.log('[ATS] Injecting enhanced mock Metamask provider');
                const mockProvider = {
                    isMetaMask: true,
                    isConnected: () => true,
                    request: async (args: any) => {
                        console.log('[ATS] Mock Metamask request:', args.method);
                        switch (args.method) {
                            case 'eth_accounts':
                                return []; // No accounts connected yet
                            case 'eth_chainId':
                                return '0x12a'; // Hedera Testnet (298)
                            default:
                                return null;
                        }
                    },
                    on: (event: string, callback: any) => {
                        console.log('[ATS] Mock Metamask event listener added:', event);
                    },
                    removeListener: () => { },
                    _metamask: {
                        isUnlocked: async () => true
                    }
                };
                (window as any).ethereum = mockProvider;
            }

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
     * This will prompt the user to sign the transaction in their wallet
     */
    async createEquity(params: CreateEquityParams): Promise<SecurityResult> {
        // Ensure SDK is initialized
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const regulationType = this.getRegulationTypeNumber(params.regulationType);

            const request = new CreateEquityRequest({
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
                votingRight: params.votingRights,
                informationRight: false,
                liquidationRight: false,
                subscriptionRight: false,
                conversionRight: false,
                redemptionRight: false,
                putRight: false,
                dividendRight: params.dividendYield || 0,
                currency: 'KES',
                numberOfShares: params.numberOfShares,
                nominalValue: params.denomination,
                nominalValueDecimals: 2,
                regulationType,
                regulationSubType: 0,
                isCountryControlListWhiteList: false,
                countries: '',
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                }),
                configId: '',
                configVersion: 1,
                externalPausesIds: params.pauseAddress ? [params.pauseAddress] : undefined,
                externalKycListsIds: params.kycProviderAddress ? [params.kycProviderAddress] : undefined,
                complianceId: '',
                identityRegistryId: '',
                diamondOwnerAccount: '',
            });

            console.log('[ATS] Creating equity with request:', request);

            // This call prompts the connected wallet for signing
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

    /**
     * Create a bond token
     * This will prompt the user to sign the transaction in their wallet
     */
    async createBond(params: CreateBondParams): Promise<SecurityResult> {
        // Ensure SDK is initialized
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
                    couponFrequency: 4, // Quarterly
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

            // This call prompts the connected wallet for signing
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
     * Map regulation type string to number
     */
    private getRegulationTypeNumber(regulationType: string): number {
        switch (regulationType) {
            case 'REG_D': return 1;
            case 'REG_S': return 2;
            case 'REG_CF': return 3;
            default: return 1;
        }
    }
}

// Singleton instance
export const ATSService = new ATSServiceClass();
export default ATSService;
