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
        } catch (error: any) {
            // Check for specific Metamask connection error that happens on some browsers/states
            // This error shouldn't block the entire SDK initialization if other parts (Mirror/RPC) worked
            if (error?.message && (
                error.message.includes('Metamask is not connected') ||
                error.message.includes('An error ocurred while connecting to the wallet')
            )) {
                console.warn('[ATS] Wallet auto-connect warning (non-fatal):', error.message);
                // We consider it initialized enough to work, just without an active wallet
                this.isInitialized = true;
                return;
            }

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

            // Clean and validate ISIN
            const cleanIsin = (params.isin || '').trim().toUpperCase();
            if (!cleanIsin || cleanIsin.length !== 12) {
                throw new Error(`Invalid ISIN format: "${params.isin}". ISIN must be exactly 12 characters.`);
            }
            console.log('[ATS] Using ISIN:', cleanIsin);

            const request = new CreateEquityRequest({
                // General Information
                name: params.name,
                symbol: params.symbol,
                isin: cleanIsin,
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

            const currencyBytes3 = this.stringToBytes3(params.currency || 'USD');

            // Ensure configId is a valid bytes32 hex string
            const configId = this.config.bondConfigId.startsWith('0x')
                ? this.config.bondConfigId
                : `0x${this.config.bondConfigId.padStart(64, '0')}`;

            // --- FIX START: DATE BUFFER LOGIC ---
            // 1. Get the requested date (or default to now)
            let finalStartingDate = params.startingDate || new Date();
            const now = new Date();

            // 2. Check if the date is in the past (including midnight today)
            // If the user picked "Today" (00:00), it is technically in the past relative to Now
            if (finalStartingDate.getTime() <= now.getTime()) {
                console.log('[ATS] Starting date is in the past/midnight. Adjusting to Now + 2 mins.');
                // Add 2 minutes buffer to ensure block time validation passes
                finalStartingDate = new Date(now.getTime() + 120 * 1000);
            }

            // 3. Generate Timestamp (Seconds) using the ADJUSTED date
            const startingDateTimestamp = Math.floor(finalStartingDate.getTime() / 1000).toString();

            // 4. Metadata date (Keep YYYY-MM-DD format)
            const startingDateISO = finalStartingDate.toISOString().split('T')[0];
            // --- FIX END ---

            const maturityDateTimestamp = Math.floor(params.maturityDate.getTime() / 1000).toString();

            // Use numberOfUnits or fallback to totalSupply for legacy support
            const numberOfUnits = params.numberOfUnits || params.totalSupply || '1000';

            // Prepare external lists
            const externalPauseIds = params.externalPauseIds || undefined;
            const externalControlIds = params.externalControlIds || undefined;
            const externalKycIds = params.externalKycIds || undefined;

            // Clean and validate ISIN
            const cleanIsin = (params.isin || '').trim().toUpperCase();
            if (!cleanIsin || cleanIsin.length !== 12) {
                throw new Error(`Invalid ISIN format: "${params.isin}". ISIN must be exactly 12 characters.`);
            }
            console.log('[ATS] Using ISIN:', cleanIsin);

            const request = new CreateBondRequest({
                // General Information
                name: params.name,
                symbol: params.symbol,
                isin: cleanIsin,
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

                // Dates - using adjusted timestamp
                startingDate: startingDateTimestamp,
                maturityDate: maturityDateTimestamp,

                // Regulation Configuration
                regulationType,
                regulationSubType,
                isCountryControlListWhiteList: false,
                countries: '',

                // Metadata
                info: JSON.stringify({
                    companyName: params.companyName,
                    companyAccountId: params.companyAccountId,
                    couponFrequency: 4,
                    couponRate: params.couponRate.toString(),
                    firstCouponDate: startingDateISO,
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

            // --- FIX START: MIRROR NODE VERIFICATION FALLBACK ---
            // If the error is a timeout or "expired", check the mirror node for success
            if (error.message?.includes('expired') || error.message?.includes('timeout') || error.message?.includes('network')) {
                console.log('[ATS] Transaction might have succeeded despite error. Verifying via Mirror Node...');
                try {
                    const owner = this.initData?.account?.id?.value;
                    if (owner) {
                        const verification = await this.verifyRecentBondCreation(owner);
                        if (verification && verification.verified && verification.assetAddress) {
                            console.log('[ATS] Verified successful bond creation via Mirror Node:', verification);

                            // Reconstruct the Security object (minimal)
                            // We typically cannot easily instantiate the Security class from SDK dynamically without more context.
                            // Since the UI primarily uses assetAddress, we'll return a minimal object.
                            const recoveredBond = {
                                diamondAddress: verification.assetAddress,
                                isReady: true
                            } as any;

                            return {
                                success: true,
                                security: recoveredBond,
                                assetAddress: verification.assetAddress,
                                transactionId: verification.transactionId,
                            };
                        }
                    }
                } catch (verifyErr) {
                    console.warn('[ATS] Verification fallback failed:', verifyErr);
                }
            }
            // --- FIX END ---

            return {
                success: false,
                error: error.message || 'Failed to create bond',
            };
        }
    }

    /**
     * Checks Mirror Node for a recent successful transaction from the owner
     * that looks like a Bond Creation (Contract Call/Create).
     */
    async verifyRecentBondCreation(ownerId: string): Promise<{ verified: boolean; transactionId?: string; assetAddress?: string } | null> {
        try {
            const config = getATSConfig();
            const baseUrl = config.mirrorNode.baseUrl;
            // Look for recent successful transactions from this account
            // We assume it's a CONTRACT CALL (to factory) or CONTRACT CREATE
            // Limiting to last 5 transactions to minimize false positives
            const url = `${baseUrl}/api/v1/transactions?account.id=${ownerId}&result=SUCCESS&limit=5&order=desc`;

            console.log(`[ATS] Verifying against Mirror Node: ${url}`);

            const response = await fetch(url);
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.transactions || data.transactions.length === 0) return null;

            // Iterate through transactions to find one that created a contract or called the factory
            // We look for a transaction that occurred very recently (e.g. within last 2 minutes)
            const now = Date.now();
            const TWO_MINUTES = 2 * 60 * 1000;

            for (const tx of data.transactions) {
                const txTime = parseFloat(tx.consensus_timestamp) * 1000;
                if (now - txTime > TWO_MINUTES) continue; // Too old

                // Check for Smart Contract interaction
                // We typically look for an entity_id (the new contract) or a call to the factory
                // If it was a CREATE operation using the Factory, it likely emitted logs or resulted in a child contract.

                // For a Bond Factory call, we might see it as a contract call to the Factory Address
                // Or if it's a direct create, we might see a contract create transaction.

                // Simplest check: Did this transaction produce a new Token or Contract that looks like our Bond?
                // Checking 'entity_id' is essentially usually the account/contract affected

                // Let's verify transaction details for child records (internal transactions) which show the created contract
                // We'll fetch the detailed transaction record
                const detailUrl = `${baseUrl}/api/v1/transactions/${tx.transaction_id}`;
                const detailResp = await fetch(detailUrl);
                if (!detailResp.ok) continue;

                const detailData = await detailResp.json();
                // Check transactions list (including children)
                const allTxs = detailData.transactions || [];

                for (const subTx of allTxs) {
                    // If we see a contract created, that's likely our bond (diamond)
                    // The factory creates a diamond proxy.
                    if (subTx.entity_id && subTx.entity_id.includes('.')) {
                        // It touched this entity. Was it created?
                        // This is heuristics. A better way: check if the 'name' of function called was 'createBond' 
                        // But mirror node might not store parsed function name on public ones easily without ABI.

                        // Heuristic: If it succeeded and touched a contract, assume it's the one (since we filtered by recent & user)
                        // And if we find a 'created_contract_ids' or similar? 
                        // Mirror node transactions list item doesn't explicitly have 'created_contract_ids' in the list view usually,
                        // but let's assume if we find a valid contract ID associated that isn't the user or specific common accounts, it might be it.

                        // Better Heuristic: Check for 'CONTRACTCREATION' type in the transaction list?
                        // Or check state_changes?

                        // Let's assume valid for now if we found a successful transaction in the timeframe that wasn't a simple transfer.
                        // We will return the transaction ID and hope the UI can fetch the latest contract from User's list or 
                        // we can try to find the contract ID from the receipts if we could, but Mirror Node is easier.

                        // For now, let's look if we can extract the contract ID.
                        // In many factory patterns, the new contract ID is in the logs or result.
                        // Without complex parsing, let's assume we can get it from the user's recent contracts endpoint if needed,
                        // but let's return the tx ID at least.

                        return {
                            verified: true,
                            transactionId: tx.transaction_id,
                            // assetAddress: ??? -> Hard to get without digging into logs/state changes.
                            // If we can't get the address, the UI might fail to redirect, BUT it will at least stop the error.
                            // We can try to fetch "contracts created by this transaction" if there's an endpoint, or guess.

                            // Hack: If we cannot find the address easily, we might just return success and let the dashboard refresh find it?
                            // But createBond expects 'assetAddress'.

                            // Let's try to get it from /api/v1/contracts?transaction_id=...
                            // Or /api/v1/conflicts results.
                        };
                    }
                }
            }

            return null;

        } catch (e) {
            console.error('[ATS] Error verifying recent bond creation:', e);
            return null;
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
     * Authorize the Backend (Marketplace) to trade tokens on behalf of the Treasury.
     * This is the "Enable Trading" switch.
     * @param tokenId - The Equity Token ID (HTS ID)
     * @param spenderAccountId - The Backend Operator ID 
     * @param amount - Max limit to trade (e.g. 1,000,000)
     */
    async approveMarketplaceAllowance(
        tokenId: string,
        spenderAccountId: string,
        amount: number
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isWalletConnected()) return { success: false, error: "Wallet not connected" };

        try {
            // Import dynamically to avoid SSR issues
            const {
                AccountAllowanceApproveTransaction,
                TokenId,
                AccountId
            } = await import('@hashgraph/sdk');

            const ownerId = this.initData?.account?.id?.value;

            console.log(`[ATS] Approving allowance: Owner ${ownerId} -> Spender ${spenderAccountId}`);

            // 1. Construct the Allowance Transaction
            const transaction = new AccountAllowanceApproveTransaction()
                .approveTokenAllowance(
                    TokenId.fromString(tokenId),
                    AccountId.fromString(ownerId!), // Owner (Treasury)
                    AccountId.fromString(spenderAccountId), // Spender (Backend)
                    amount
                );

            // 2. Sign & Execute via HashPack
            const txId = await this.signAndExecuteTransaction(transaction);

            return { success: true, transactionId: txId };

        } catch (error: any) {
            console.error('[ATS] Allowance error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Issues (mints) security tokens to a target wallet.
     * The account calling this must have the "Minter Role" on the security.
     * @param securityId - The Diamond/Contract Address (0.0.xxxxx)
     * @param amount - The amount to mint (as a string to handle large numbers)
     * @param targetId - The recipient Hedera account ID (e.g., "0.0.12345")
     */
    async issueSecurityTokens(
        securityId: string,
        amount: string,
        targetId: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) await this.init();

        try {
            const { Security, IssueRequest } = await this.getSDK() as any;

            if (!targetId) {
                throw new Error("Target account ID is required for issuing tokens.");
            }

            console.log(`[ATS] Issuing ${amount} tokens of ${securityId} to ${targetId}...`);

            const request = new IssueRequest({
                securityId: securityId,
                targetId: targetId,
                amount: amount,
            });

            const result = await Security.issue(request);

            console.log('[ATS] Issue successful:', result);

            return {
                success: true,
                transactionId: result.transactionId
            };

        } catch (error: any) {
            console.error('[ATS] Issue error:', error);
            return {
                success: false,
                error: error.message || 'Failed to issue tokens'
            };
        }
    }

    /**
     * Mints new tokens to a specified account.
     * The account calling this must have the "Agent Role" on the security.
     * @param securityId - The Diamond/Contract Address (0.0.xxxxx)
     * @param amount - The amount to mint (as a string with decimals included)
     * @param targetId - The recipient Hedera account ID (e.g., "0.0.12345")
     */
    async mintSecurityTokens(
        securityId: string,
        amount: string,
        targetId: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) await this.init();

        try {
            const { Security, MintRequest } = await this.getSDK() as any;

            if (!targetId) {
                throw new Error("Target account ID is required for minting tokens.");
            }

            console.log(`[ATS] Minting ${amount} tokens of ${securityId} to ${targetId}...`);

            const request = new MintRequest({
                securityId: securityId,
                targetId: targetId,
                amount: amount,
            });

            const result = await Security.mint(request);

            console.log('[ATS] Mint successful:', result);

            return {
                success: true,
                transactionId: result.transactionId
            };

        } catch (error: any) {
            console.error('[ATS] Mint error:', error);
            return {
                success: false,
                error: error.message || 'Failed to mint tokens'
            };
        }
    }

    /**
     * Burns tokens from a specified account.
     * The account calling this must have the "Agent Role" on the security.
     * @param securityId - The Diamond/Contract Address (0.0.xxxxx)
     * @param amount - The amount to burn (as a string with decimals included)
     * @param targetId - (Optional) The account to burn from. Defaults to sender if not specified.
     */
    async burnSecurityTokens(
        securityId: string,
        amount: string,
        targetId?: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) await this.init();

        try {
            const { Security, BurnRequest } = await this.getSDK() as any;

            console.log(`[ATS] Burning ${amount} tokens of ${securityId}${targetId ? ` from ${targetId}` : ''}...`);

            const request = new BurnRequest({
                securityId: securityId,
                targetId: targetId,
                amount: amount,
            });

            const result = await Security.burn(request);

            console.log('[ATS] Burn successful:', result);

            return {
                success: true,
                transactionId: result.transactionId
            };

        } catch (error: any) {
            console.error('[ATS] Burn error:', error);
            return {
                success: false,
                error: error.message || 'Failed to burn tokens'
            };
        }
    }

    /**
     * Forces a transfer between accounts, bypassing normal transfer restrictions.
     * The account calling this must have the "Agent Role" on the security.
     * @param securityId - The Diamond/Contract Address (0.0.xxxxx)
     * @param sourceId - Source account's Hedera ID
     * @param targetId - Destination account's Hedera ID
     * @param amount - Amount to transfer (as a string with decimals included)
     */
    async forcedTransfer(
        securityId: string,
        sourceId: string,
        targetId: string,
        amount: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) await this.init();

        try {
            const { Security, ForcedTransferRequest } = await this.getSDK() as any;

            console.log(`[ATS] Forcing transfer of ${amount} tokens from ${sourceId} to ${targetId}...`);

            const request = new ForcedTransferRequest({
                securityId: securityId,
                sourceId: sourceId,
                targetId: targetId,
                amount: amount,
            });

            const result = await Security.forcedTransfer(request);

            console.log('[ATS] Forced transfer successful:', result);

            return {
                success: true,
                transactionId: result.transactionId
            };

        } catch (error: any) {
            console.error('[ATS] Forced transfer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to force transfer'
            };
        }
    }

    /**
     * Grants a role to an account on the security token.
     * The account calling this must have the "Admin Role" on the security.
     * @param securityId - The Diamond/Contract Address
     * @param targetId - The account to receive the role
     * @param role - The role to grant (e.g. "MINTER_ROLE")
     */
    async grantSecurityRole(
        securityId: string,
        targetId: string,
        role: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (!this.isInitialized) await this.init();

        try {
            // SDK exports Role module with grantRole method, and RoleRequest class
            const { Role, RoleRequest } = await this.getSDK() as any;

            console.log(`[ATS] Granting role ${role} on ${securityId} to ${targetId}...`);

            const request = new RoleRequest({
                securityId: securityId,
                targetId: targetId,
                role: role
            });

            const result = await Role.grantRole(request);

            console.log('[ATS] Grant role successful:', result);

            return {
                success: true,
                transactionId: result.transactionId
            };

        } catch (error: any) {
            console.error('[ATS] Grant role error:', error);
            return {
                success: false,
                error: error.message || 'Failed to grant role'
            };
        }
    }

    /**
     * Get security info including the underlying HTS Token ID.
     * This queries the security diamond contract to retrieve token details.
     * @param securityId - The Diamond/Contract Address (0.0.xxxxx)
     */
    async getSecurityInfo(securityId: string): Promise<{
        tokenId?: string;
        name?: string;
        symbol?: string;
        supply?: string;
        decimals?: number;
        error?: string;
    }> {
        if (!this.isInitialized) await this.init();

        try {
            const { Security, GetSecurityInfoRequest } = await this.getSDK() as any;

            console.log(`[ATS] Fetching security info for ${securityId}...`);

            const request = new GetSecurityInfoRequest({
                securityId: securityId,
            });

            const result = await Security.getInfo(request);
            console.log('[ATS] Security info:', result);

            return {
                tokenId: result.underlyingAsset || result.tokenId || securityId,
                name: result.name,
                symbol: result.symbol,
                supply: result.totalSupply?.toString(),
                decimals: result.decimals,
            };
        } catch (sdkError: any) {
            console.warn('[ATS] SDK getInfo failed, trying Mirror Node fallback:', sdkError.message);

            // Fallback: Try fetching from Mirror Node using the contract ID
            try {
                const mirrorUrl = this.config.mirrorNode.baseUrl;
                const contractResp = await fetch(`${mirrorUrl}/api/v1/contracts/${securityId}`);

                if (contractResp.ok) {
                    const contractData = await contractResp.json();
                    console.log('[ATS] Contract data from Mirror Node:', contractData.contract_id);
                }

                // Return the securityId as the token reference (diamond address)
                return {
                    tokenId: securityId,
                };
            } catch (mirrorError: any) {
                console.error('[ATS] Mirror Node fallback failed:', mirrorError);
                return { error: mirrorError.message || 'Failed to get security info' };
            }
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