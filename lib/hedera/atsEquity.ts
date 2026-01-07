import { Equity, CreateEquityRequest, SetDividendsRequest, SetScheduledBalanceAdjustmentRequest, GetEquityDetailsRequest } from '@hashgraph/asset-tokenization-sdk';
import { getATSConfig } from './atsConfig';

// Map regulation type strings to numbers
const getRegulationTypeNumber = (regulationType: string): number => {
  switch (regulationType) {
    case 'REG_S': return 1;
    case 'REG_D': return 2;
    case 'REG_CF': return 2; // SDK does not support REG_CF, defaulting to REG_D
    default: return 2; // Default to REG_D
  }
};

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

export class ATSEquityService {
  async initialize() {
    await getATSConfig();
  }

  async deployEquity(params: CreateEquityParams, walletSigner: any) {
    await this.initialize();

    // Map regulation type
    const regulationType = getRegulationTypeNumber(params.regulationType);

    // Build CreateEquityRequest expected by the SDK
    const request = new CreateEquityRequest({
      name: params.name,
      symbol: params.symbol,
      isin: '',
      decimals: 18,
      isWhiteList: false,
      erc20VotesActivated: false,
      isControllable: false,
      arePartitionsProtected: false,
      clearingActive: false,
      internalKycActivated: false,
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

    // Deploy using Asset Tokenization SDK
    const result = await Equity.create(request);

    return {
      assetAddress: result.security.diamondAddress!,
      transactionId: result.transactionId,
    };
  }

  async mintEquity(params: { assetAddress: string; amount: string; targetAddress: string }, walletSigner: any) {
    await this.initialize();

    // Create request with correct property names
    const request = new SetScheduledBalanceAdjustmentRequest({
      securityId: params.assetAddress, // Changed from assetAddress to securityId
      factor: params.amount, // Changed from amount to factor
      executionDate: new Date().toISOString(), // Added required field
      decimals: '4', // Added required field
    });

    const result = await Equity.setScheduledBalanceAdjustment(request);
    return { transactionId: result.transactionId };
  }

  async createDividend(params: { assetAddress: string; amount: string; snapshotDate: Date; paymentDate: Date }, walletSigner: any) {
    await this.initialize();

    // Create request with correct property names
    const request = new SetDividendsRequest({
      securityId: params.assetAddress, // Changed from assetAddress to securityId
      amountPerUnitOfSecurity: params.amount, // Changed from amount to amountPerUnitOfSecurity
      recordTimestamp: params.snapshotDate.toISOString(), // Changed from snapshotDate to recordTimestamp
      executionTimestamp: params.paymentDate.toISOString(), // Changed from paymentDate to executionTimestamp
    });

    const result = await Equity.setDividends(request);
    return { transactionId: result.transactionId };
  }

  async getAssetInfo(assetAddress: string) {
    await this.initialize();

    // Create proper request object with correct property name
    const request = new GetEquityDetailsRequest({
      equityId: assetAddress, // Changed from securityId to equityId
    });

    return await Equity.getEquityDetails(request);
  }
}

// Singleton instance
export const atsEquityService = new ATSEquityService();
