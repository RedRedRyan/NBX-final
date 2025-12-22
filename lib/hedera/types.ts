// lib/hedera/types.ts

/**
 * Supported regulation types for security tokens
 */
export type RegulationType = 'REG_D' | 'REG_S' | 'REG_CF';

/**
 * Supported deal types
 */
export type DealType = 'PRIMARY_ISSUANCE' | 'SECONDARY_TRADING' | 'PRIVATE_PLACEMENT';

/**
 * Parameters for creating a new equity token
 */
export interface CreateEquityParams {
  // Basic token information
  name: string;
  symbol: string;
  numberOfShares: string;
  denomination: string;

  // Regulatory information
  regulationType: RegulationType;
  regulationSubType?: string;
  dealType?: DealType;

  // Financial terms
  dividendYield?: number;
  votingRights: boolean;

  // Company information
  companyName: string;
  companyAccountId: string;

  // Compliance addresses (optional)
  kycProviderAddress?: string;
  pauseAddress?: string;

  // Metadata (for display purposes)
  description?: string;
  companyLogo?: string;
  companyWebsite?: string;
}

/**
 * Response from deploying an equity token
 */
export interface EquityDeploymentResult {
  assetAddress: string;
  transactionId: string;
  success: boolean;
  error?: string;
}

/**
 * Parameters for minting new shares
 */
export interface MintEquityParams {
  assetAddress: string;
  amount: string;
  targetAddress: string;
}

/**
 * Parameters for creating dividends
 */
export interface CreateDividendParams {
  assetAddress: string;
  amount: string;
  snapshotDate: Date;
  paymentDate: Date;
  currency?: string;
}

/**
 * Transaction data that needs to be signed by the wallet
 */
export interface TransactionToSign {
  transactionData: string; // Base64 encoded transaction
  metadata: {
    type: 'EQUITY_DEPLOYMENT' | 'MINT' | 'DIVIDEND';
    description: string;
  };
}

/**
 * Result from signing a transaction
 */
export interface SignedTransaction {
  signedTransaction: string; // Base64 encoded signed transaction
  accountId: string; // The account that signed the transaction
}

/**
 * Transaction status types
 */
export type TransactionStatus =
  | 'PREPARED'
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'FAILED';

/**
 * Transaction status update
 */
export interface TransactionStatusUpdate {
  transactionId: string;
  status: TransactionStatus;
  timestamp: Date;
  message?: string;
}

/**
 * Basic equity token information
 */
export interface EquityTokenInfo {
  assetAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  owner: string;
  createdAt: Date;
  regulationType: RegulationType;
  isPaused: boolean;
}

/**
 * Detailed equity token information
 */
export interface EquityTokenDetails extends EquityTokenInfo {
  dividendYield: number;
  hasVotingRights: boolean;
  kycProvider?: string;
  complianceInfo: {
    isKycRequired: boolean;
    isAccreditedOnly: boolean;
  };
}

/**
 * Wallet connection state
 */
export interface WalletConnection {
  accountId: string;
  isConnected: boolean;
  network: string;
  walletType: 'HASH_PACK' | 'BLADE' | 'OTHER';
}

/**
 * Server response for equity operations
 */
export interface EquityOperationResponse {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
}

/**
 * Parameters for getting token information
 */
export interface GetTokenInfoParams {
  assetAddress: string;
  includeHolders?: boolean;
  includeTransfers?: boolean;
}

/**
 * Token holder information
 */
export interface TokenHolder {
  accountId: string;
  balance: string;
  kycStatus: 'PASSED' | 'PENDING' | 'FAILED' | 'NOT_REQUIRED';
  isAccredited: boolean;
}

/**
 * Transaction history item
 */
export interface TransactionHistoryItem {
  transactionId: string;
  type: 'DEPLOYMENT' | 'MINT' | 'BURN' | 'TRANSFER' | 'DIVIDEND';
  amount: string;
  from?: string;
  to?: string;
  timestamp: Date;
  status: TransactionStatus;
}

/**
 * Hedera network configuration
 */
export interface HederaNetworkConfig {
  network: 'mainnet' | 'testnet';
  mirrorNodeUrl: string;
  rpcNodeUrl: string;
  factoryAddress: string;
  resolverAddress: string;
}

/**
 * Corporate action types
 */
export type CorporateActionType =
  | 'DIVIDEND'
  | 'STOCK_SPLIT'
  | 'MERGER'
  | 'SPIN_OFF'
  | 'VOTING';

/**
 * Corporate action event
 */
export interface CorporateActionEvent {
  actionType: CorporateActionType;
  assetAddress: string;
  parameters: Record<string, any>;
  effectiveDate: Date;
  createdAt: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
