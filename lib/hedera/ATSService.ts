// lib/hedera/ATSService.ts
"use client";

import type {
    InitializationData,
    NetworkData,
    WalletEvent,
    SecurityViewModel,
    SupportedWallets as SupportedWalletsType,
    CreateEquityRequest,
    CreateBondRequest,

} from '@hashgraph/asset-tokenization-sdk';


import type { SignAndExecuteTransactionParams, SignAndExecuteTransactionResult } from '@hashgraph/hedera-wallet-connect';
import type { MintEquityParams, CreateDividendParams } from './types';
import type { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import type { Transaction } from '@hashgraph/sdk';

// Configuration from environment
const getATSConfig = () => ({
    network: (process.env.NEXT_PUBLIC_NETWORK as 'testnet' | 'mainnet') || (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
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
    equityConfigId: process.env.NEXT_PUBLIC_EQUITY_CONFIG_ID || '0x0000000000000000000000000000000000000000000000000000000000000001',
    equityConfigVersion: parseInt(process.env.NEXT_PUBLIC_EQUITY_CONFIG_VERSION || '0', 10),
    bondConfigId: process.env.NEXT_PUBLIC_BOND_CONFIG_ID || '0x0000000000000000000000000000000000000000000000000000000000000002',
    bondConfigVersion: parseInt(process.env.NEXT_PUBLIC_BOND_CONFIG_VERSION || '0', 10),
});

export interface ATSWalletState {
    isConnected: boolean;
    address: string;
    initData: InitializationData | null;
    networkData: NetworkData | null;
}

export interface CreateEquityParams {
    // General Information
    name: string;
    symbol: string;
    isin: string;
    decimals?: number; // Default: 4

    // Digital Security Permissions
    isControllable?: boolean; // "Controllable" toggle
    isBlocklist?: boolean; // "Blocklist" toggle - maps to !isWhiteList
    isApprovalList?: boolean; // "Approval list" toggle

    // Digital Security Configuration
    clearingModeEnabled?: boolean; // "Clearing mode enabled" toggle
    internalKycActivated?: boolean; // "Internal Kyc Activated" toggle

    // Economic Information
    nominalValue: string; // e.g. "1.00"
    currency: string; // e.g. "USD"
    numberOfShares: string;

    // Rights and Privileges
    votingRights?: boolean;
    informationRights?: boolean;
    liquidationRights?: boolean;
    conversionRights?: boolean;
    subscriptionRights?: boolean;
    redemptionRights?: boolean;
    putRight?: boolean;

    // Dividend type: 0=None, 1=Preferred, 2=Common
    dividendType?: 0 | 1 | 2;

    // External Lists (optional Hedera account IDs)
    externalPauseIds?: string[];
    externalControlIds?: string[];
    externalKycIds?: string[];

    // ERC3643 Configuration (optional Hedera account IDs like "0.0.123456")
    complianceId?: string;
    identityRegistryId?: string;

    // Regulation
    regulationType: 'REG_D' | 'REG_S' | 'REG_CF';
    regulationSubType?: string;

    // Metadata
    companyName: string;
    companyAccountId: string;
    dealType?: string;

    // Legacy compatibility
    denomination?: string;
    denominationValue?: string;
    dividendYield?: number;
    kycProviderAddress?: string;
    pauseAddress?: string;
}

export interface CreateBondParams {
    // General Information
    name: string;
    symbol: string;
    isin: string;
    decimals?: number; // Default: 0 for bonds

    // Digital Security Permissions
    isControllable?: boolean;
    isBlocklist?: boolean;

    // Digital Security Configuration
    clearingModeEnabled?: boolean;
    internalKycActivated?: boolean;

    // Economic Information
    nominalValue: string;
    currency: string;
    numberOfUnits: string; // renamed from totalSupply for clarity
    totalSupply?: string; // legacy alias

    // Bond-specific dates
    startingDate?: Date;
    maturityDate: Date;
    couponRate: number;

    // External Lists (optional Hedera account IDs)
    externalPauseIds?: string[];
    externalControlIds?: string[];
    externalKycIds?: string[];

    // ERC3643 Configuration
    complianceId?: string;
    identityRegistryId?: string;

    // Proceed Recipients
    proceedRecipientsIds?: string[];
    proceedRecipientsData?: string[];

    // Regulation
    regulationType: 'REG_D' | 'REG_S' | 'REG_CF';
    regulationSubType?: string;

    // Metadata
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
    private dAppConnector: DAppConnector | null = null;

    /**
     * Helper to load SDK dynamically to avoid "dynamic usage of require" errors in Next.js
     */
    private async getSDK() {
        return await import('@hashgraph/asset-tokenization-sdk');
    }

    /**
     * This sets up network configuration
     */
    async init(events?: Partial<WalletEvent>): Promise<void> {
        if (this.isInitialized) {
            console.log('[ATS] SDK already initialized');
            return;
        }

        try {
            const { Network, InitializationRequest } = await this.getSDK();

            console.log('[ATS] Initializing SDK with config:', {
                network: this.config.network,
                mirror: this.config.mirrorNode.baseUrl,
                rpc: this.config.rpcNode.baseUrl,
                factory: this.config.factoryAddress,
                resolver: this.config.resolverAddress,
                projectId: this.config.walletConnectProjectId ? '(set)' : '(missing)'
            });

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
    async connectWallet(walletType?: SupportedWalletsType): Promise<InitializationData> {
        try {
            const { Network, ConnectRequest, SupportedWallets } = await this.getSDK();

            const selectedWallet = walletType || SupportedWallets.HWALLETCONNECT;

            // Build HWC settings if using WalletConnect
            let hwcSettings;
            if (selectedWallet === SupportedWallets.HWALLETCONNECT && this.config.walletConnectProjectId) {
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
                wallet: selectedWallet,
            });

            this.initData = await Network.connect(connectRequest);
            console.log('[ATS] Wallet connected:', this.initData?.account?.id?.value);

            // Initialize DAppConnector for direct transaction signing
            await this.initDAppConnector();

            return this.initData;
        } catch (error) {
            console.error('[ATS] Wallet connection error:', error);
            throw error;
        }
    }

    /**
     * Initialize DAppConnector for direct transaction signing
     */
    private async initDAppConnector(): Promise<void> {
        if (this.dAppConnector) return;

        try {
            const { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } = await import('@hashgraph/hedera-wallet-connect');
            const { LedgerId } = await import('@hashgraph/sdk');

            const metadata = {
                name: 'NBX - Nairobi Stock Exchange',
                description: 'SME Capital Markets Platform',
                url: typeof window !== 'undefined' ? window.location.origin : 'https://nbx.co.ke',
                icons: [],
            };

            const ledgerId = this.config.network === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
            const chainId = this.config.network === 'mainnet' ? HederaChainId.Mainnet : HederaChainId.Testnet;

            this.dAppConnector = new DAppConnector(
                metadata,
                ledgerId,
                this.config.walletConnectProjectId,
                Object.values(HederaJsonRpcMethod),
                [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
                [chainId],
            );

            await this.dAppConnector.init({ logger: 'error' });
            console.log('[ATS] DAppConnector initialized for transaction signing');
        } catch (error) {
            console.error('[ATS] Failed to initialize DAppConnector:', error);
            // Don't throw - we can still use the ATS SDK for its built-in operations
        }
    }

    /**
     * Sign and execute a transaction via WalletConnect
     * @param transaction - Transaction bytes, base64 string, or Hedera Transaction object
     */
    async signAndExecuteTransaction(transaction: Uint8Array | string | Transaction): Promise<string> {
        if (!this.dAppConnector) {
            // Try to initialize if not done yet
            await this.initDAppConnector();
        }

        if (!this.dAppConnector) {
            throw new Error('DAppConnector is not initialized. Ensure wallet is connected.');
        }

        const accountId = this.initData?.account?.id?.value;
        if (!accountId) {
            throw new Error('No account ID found. Wallet may not be connected.');
        }

        // Convert to bytes
        let txBytes: Uint8Array;
        if (typeof transaction === 'string') {
            txBytes = Buffer.from(transaction, 'base64');
        } else if ('toBytes' in transaction && typeof transaction.toBytes === 'function') {
            // Transaction object with toBytes method
            txBytes = (transaction as Transaction).toBytes();
        } else {
            // Already Uint8Array
            txBytes = transaction as Uint8Array;
        }

        // Format account ID for WalletConnect (hedera:testnet:0.0.xxx)
        const networkPrefix = this.config.network === 'mainnet' ? 'hedera:mainnet' : 'hedera:testnet';
        const signerAccountId = `${networkPrefix}:${accountId}`;

        const params: SignAndExecuteTransactionParams = {
            signerAccountId,
            transactionList: Buffer.from(txBytes).toString('base64'),
        };

        try {
            console.log('[ATS] Signing transaction via WalletConnect...');
            const result = await this.dAppConnector.signAndExecuteTransaction(params);
            console.log('[ATS] Transaction signed and executed:', result);
            // The SignAndExecuteTransactionResult type may not include transactionId in .d.ts
            // but it exists at runtime - safely extract it
            const txResult = result as unknown as { transactionId?: string };
            return txResult.transactionId || (typeof result === 'string' ? result : 'completed');
        } catch (error: any) {
            console.error('[ATS] WalletConnect signing error:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    async disconnectWallet(): Promise<boolean> {
        try {
            const { Network } = await this.getSDK();
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
            const { Equity, CreateEquityRequest } = await this.getSDK();

            const regulationType = this.getRegulationTypeNumber(params.regulationType);
            const regulationSubType = this.getRegulationSubTypeNumber(params.regulationSubType);

            // Ensure we have a connected account to set as owner
            const owner = this.initData?.account?.id?.value;
            if (!owner) {
                throw new Error("Wallet not connected. Cannot determine Diamond Owner.");
            }

            const ownerEvmAddress = this.hederaIdToEvmAddress(owner);
            // Use currency from params, with fallback to denomination for legacy support
            const currencyStr = params.currency || params.denomination || 'USD';
            const currencyBytes3 = this.stringToBytes3(currencyStr);

            // Ensure configId is a valid bytes32 hex string
            const configId = this.config.equityConfigId.startsWith('0x')
                ? this.config.equityConfigId
                : `0x${this.config.equityConfigId.padStart(64, '0')}`;

            // Map dividend type: 0=None, 1=Preferred, 2=Common
            const dividendRight = params.dividendType ?? (params.dividendYield && params.dividendYield > 0 ? 1 : 0);

            // Prepare external lists - convert Hedera IDs to EVM addresses if provided
            const externalPauseIds = params.externalPauseIds || (params.pauseAddress ? [params.pauseAddress] : undefined);
            const externalControlIds = params.externalControlIds || undefined;
            const externalKycIds = params.externalKycIds || (params.kycProviderAddress ? [params.kycProviderAddress] : undefined);

            const request = new CreateEquityRequest({
                // General Information
                name: params.name,
                symbol: params.symbol,
                isin: params.isin || 'KE0000000000',
                decimals: params.decimals ?? 4, // ATS Studio default is 4

                // Digital Security Permissions
                isWhiteList: !(params.isBlocklist ?? true), // Blocklist = !isWhiteList
                isControllable: params.isControllable ?? true,
                arePartitionsProtected: false,
                isMultiPartition: false,

                // Digital Security Configuration
                clearingActive: params.clearingModeEnabled ?? false,
                internalKycActivated: params.internalKycActivated ?? true, // Default on in ATS
                erc20VotesActivated: params.votingRights ?? false,

                // Rights and Privileges
                votingRight: params.votingRights ?? false,
                informationRight: params.informationRights ?? false,
                liquidationRight: params.liquidationRights ?? false,
                subscriptionRight: params.subscriptionRights ?? false,
                conversionRight: params.conversionRights ?? false,
                redemptionRight: params.redemptionRights ?? false,
                putRight: params.putRight ?? false,
                dividendRight: dividendRight,

                // Economic Information
                currency: currencyBytes3,
                numberOfShares: params.numberOfShares,
                // Convert decimal nominalValue to integer string (BigNumber compatible)
                // e.g., "1.09" with 2 decimals becomes "109"
                nominalValue: this.convertToIntegerString(params.nominalValue || params.denominationValue || '1', 2),
                nominalValueDecimals: 2,

                // Regulation Configuration
                regulationType,
                regulationSubType,
                isCountryControlListWhiteList: false,
                countries: '',

                // Metadata
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                    dealType: params.dealType || 'IPO',
                }),

                // Required Configuration IDs
                configId: configId,
                configVersion: this.config.equityConfigVersion,

                // External Lists
                externalPausesIds: externalPauseIds,
                externalControlListsIds: externalControlIds,
                externalKycListsIds: externalKycIds,

                // Owner Account
                diamondOwnerAccount: ownerEvmAddress,

                // ERC3643 Compliance/Identity Registry
                complianceId: params.complianceId,
                identityRegistryId: params.identityRegistryId,
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
    /**
     * Mint equity by scheduling a balance adjustment.
     */
    async mintEquity(params: MintEquityParams): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const { Equity, SetScheduledBalanceAdjustmentRequest } = await this.getSDK();

            const request = new SetScheduledBalanceAdjustmentRequest({
                securityId: params.assetAddress,
                factor: params.amount,
                executionDate: new Date().toISOString(),
                decimals: '4',
            });

            const result = await Equity.setScheduledBalanceAdjustment(request);
            return { success: true, transactionId: result.transactionId };
        } catch (error: any) {
            console.error('[ATS] mintEquity error:', error);
            return { success: false, error: error.message || 'Failed to mint equity' };
        }
    }

    /**
     * Create a dividend for an equity security.
     */
    async createDividend(params: CreateDividendParams): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const { Equity, SetDividendsRequest } = await this.getSDK();

            const request = new SetDividendsRequest({
                securityId: params.assetAddress,
                amountPerUnitOfSecurity: params.amount,
                recordTimestamp: params.snapshotDate.toISOString(),
                executionTimestamp: params.paymentDate.toISOString(),
            });

            const result = await Equity.setDividends(request);
            return { success: true, transactionId: result.transactionId };
        } catch (error: any) {
            console.error('[ATS] createDividend error:', error);
            return { success: false, error: error.message || 'Failed to create dividend' };
        }
    }

    /**
     * Retrieve equity details from the SDK.
     */
    async getAssetInfo(assetAddress: string): Promise<any> {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const { Equity, GetEquityDetailsRequest } = await this.getSDK();
            const request = new GetEquityDetailsRequest({ equityId: assetAddress });
            return await Equity.getEquityDetails(request);
        } catch (error: any) {
            console.error('[ATS] getAssetInfo error:', error);
            throw error;
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
            const { Bond, CreateBondRequest } = await this.getSDK();

            const regulationType = this.getRegulationTypeNumber(params.regulationType);
            const regulationSubType = this.getRegulationSubTypeNumber(params.regulationSubType);

            // Ensure we have a connected account to set as owner
            const owner = this.initData?.account?.id?.value;
            if (!owner) {
                throw new Error("Wallet not connected. Cannot determine Diamond Owner.");
            }
            const ownerEvmAddress = this.hederaIdToEvmAddress(owner);

            // Bond currency presumably needs to be bytes3 as well if it's following the same pattern
            // If params.currency is "USD", convert it. 
            const currencyBytes3 = this.stringToBytes3(params.currency || 'USD');

            // Ensure configId is a valid bytes32 hex string
            const configId = this.config.bondConfigId.startsWith('0x')
                ? this.config.bondConfigId
                : `0x${this.config.bondConfigId.padStart(64, '0')}`;

            // Format dates as ISO strings
            const startingDate = params.startingDate || new Date();
            const startingDateStr = startingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            const maturityDateStr = params.maturityDate.toISOString().split('T')[0];

            // Use numberOfUnits or fallback to totalSupply for legacy support
            const numberOfUnits = params.numberOfUnits || params.totalSupply || '1000';

            // Prepare external lists
            const externalPauseIds = params.externalPauseIds || undefined;
            const externalControlIds = params.externalControlIds || undefined;
            const externalKycIds = params.externalKycIds || undefined;

            const request = new CreateBondRequest({
                // General Information
                name: params.name,
                symbol: params.symbol,
                isin: params.isin || 'KE0000000000',
                decimals: params.decimals ?? 0,

                // Digital Security Permissions
                isWhiteList: !(params.isBlocklist ?? true),
                isControllable: params.isControllable ?? true,
                arePartitionsProtected: false,
                isMultiPartition: false,

                // Digital Security Configuration
                clearingActive: params.clearingModeEnabled ?? false,
                internalKycActivated: params.internalKycActivated ?? false,
                erc20VotesActivated: false,

                // Economic Information
                currency: currencyBytes3,
                numberOfUnits: numberOfUnits,
                nominalValue: params.nominalValue,
                nominalValueDecimals: 2,

                // Dates - using YYYY-MM-DD format
                startingDate: startingDateStr,
                maturityDate: maturityDateStr,

                // Regulation Configuration
                regulationType,
                regulationSubType,
                isCountryControlListWhiteList: false,
                countries: '',

                // Metadata
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                    couponFrequency: 4, // Quarterly
                    couponRate: params.couponRate.toString(),
                    firstCouponDate: startingDateStr,
                }),

                // Required Configuration IDs
                configId: configId,
                configVersion: this.config.bondConfigVersion,

                // External Lists
                externalPausesIds: externalPauseIds,
                externalControlListsIds: externalControlIds,
                externalKycListsIds: externalKycIds,

                // Owner Account
                diamondOwnerAccount: ownerEvmAddress,

                // ERC3643 Compliance/Identity Registry
                complianceId: params.complianceId,
                identityRegistryId: params.identityRegistryId,

                // Proceed Recipients
                proceedRecipientsIds: params.proceedRecipientsIds,
                proceedRecipientsData: params.proceedRecipientsData,
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

    private getRegulationTypeNumber(regulationType: string): number {
        switch (regulationType) {
            case 'REG_S': return 1;
            case 'REG_D': return 2;
            case 'REG_CF': return 2; // SDK does not support REG_CF, defaulting to REG_D
            default: return 2;
        }
    }

    private getRegulationSubTypeNumber(subType?: string): number {
        // SDK expects 1 = 506 B, 2 = 506 C - never return 0 as it's invalid
        if (!subType) return 1; // Default to 506 B
        switch (subType.toUpperCase().replace(/\s+/g, '-').replace('(', '').replace(')', '')) {
            case '506-B':
            case '506B':
                return 1;
            case '506-C':
            case '506C':
                return 2;
            default:
                return 1; // Default to 506 B
        }
    }

    /**
     * Convert a decimal string to an integer string for BigNumber compatibility
     * e.g., "1.09" with 2 decimals becomes "109"
     * e.g., "1000" with 2 decimals becomes "100000"
     */
    private convertToIntegerString(value: string, decimals: number): string {
        if (!value) return '0';

        // Remove any commas from the value
        const cleanValue = value.replace(/,/g, '');

        // Check if it contains a decimal point
        if (cleanValue.includes('.')) {
            const [intPart, decPart = ''] = cleanValue.split('.');
            // Pad or truncate decimal part to match desired decimals
            const paddedDecimal = decPart.padEnd(decimals, '0').slice(0, decimals);
            // Combine and remove leading zeros (except for "0")
            const result = (intPart + paddedDecimal).replace(/^0+/, '') || '0';
            return result;
        } else {
            // No decimal point - multiply by 10^decimals
            return cleanValue + '0'.repeat(decimals);
        }
    }

    /**
     * Associate wallet with a token (required before receiving HTS tokens)
     * Uses Hedera SDK TokenAssociateTransaction with WalletConnect signing
     * @param tokenId - The Hedera token ID (e.g., "0.0.7228867")
     */
    async associateToken(tokenId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isWalletConnected()) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            // Dynamically import Hedera SDK
            const { TokenAssociateTransaction, AccountId, TokenId: HTokenId } = await import('@hashgraph/sdk');

            const accountId = this.initData?.account?.id?.value;
            if (!accountId) {
                return { success: false, error: 'No account ID found' };
            }

            console.log(`[ATS] Associating token ${tokenId} with account ${accountId}`);

            // Create the token associate transaction
            const transaction = new TokenAssociateTransaction()
                .setAccountId(AccountId.fromString(accountId))
                .setTokenIds([HTokenId.fromString(tokenId)]);

            // Sign and execute via WalletConnect using the DAppConnector
            const transactionId = await this.signAndExecuteTransaction(transaction);

            console.log('[ATS] Token association successful:', transactionId);

            return {
                success: true,
                transactionId,
            };
        } catch (error: any) {
            console.error('[ATS] Token association error:', error);

            // Check for common errors
            if (error.message?.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
                return { success: true, transactionId: 'already_associated' };
            }

            return {
                success: false,
                error: error.message || 'Failed to associate token',
            };
        }
    }

    /**
     * Check if wallet is associated with a token via Mirror Node
     * @param tokenId - The Hedera token ID (e.g., "0.0.7228867")
     */
    async isTokenAssociated(tokenId: string): Promise<boolean> {
        const accountId = this.initData?.account?.id?.value;
        if (!accountId) {
            return false;
        }

        try {
            const mirrorUrl = this.config.mirrorNode.baseUrl;
            const response = await fetch(
                `${mirrorUrl}/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`
            );

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.tokens && data.tokens.length > 0;
        } catch (error) {
            console.error('[ATS] Error checking token association:', error);
            return false;
        }
    }

    /**
     * Get token balance for connected wallet
     * @param tokenId - The Hedera token ID (e.g., "0.0.7228867")
     */
    async getTokenBalance(tokenId: string): Promise<{ balance: number; decimals: number } | null> {
        const accountId = this.initData?.account?.id?.value;
        if (!accountId) {
            return null;
        }

        try {
            const mirrorUrl = this.config.mirrorNode.baseUrl;

            // Fetch token balance for account
            const response = await fetch(
                `${mirrorUrl}/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (!data.tokens || data.tokens.length === 0) {
                return null;
            }

            const tokenData = data.tokens[0];

            // Fetch token info to get decimals
            const tokenInfoResponse = await fetch(
                `${mirrorUrl}/api/v1/tokens/${tokenId}`
            );

            if (!tokenInfoResponse.ok) {
                return { balance: tokenData.balance, decimals: 0 };
            }

            const tokenInfo = await tokenInfoResponse.json();
            const decimals = parseInt(tokenInfo.decimals || '0', 10);
            const balance = tokenData.balance / Math.pow(10, decimals);

            return { balance, decimals };
        } catch (error) {
            console.error('[ATS] Error fetching token balance:', error);
            return null;
        }
    }
}

export const ATSService = new ATSServiceClass();
export default ATSService;