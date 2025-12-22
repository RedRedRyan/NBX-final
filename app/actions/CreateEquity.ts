// app/actions/createEquity.ts
'use server';

import { CreateEquityParams } from '@/lib/hedera/types';
import { ApiClient } from '@/lib/api/client';
import { Equity, CreateEquityRequest } from '@hashgraph/asset-tokenization-sdk';

export async function deployEquityOnServer(params: CreateEquityParams, token: string, companyId: string) {
  try {
    // Create proper request object
    const deploymentRequest = new CreateEquityRequest({
      name: params.name,
      symbol: params.symbol,
      isin: '', // Required
      decimals: 18, // Required
      isWhiteList: false, // Required
      erc20VotesActivated: false, // Required
      isControllable: false, // Required
      arePartitionsProtected: false, // Required
      clearingActive: false, // Required
      internalKycActivated: false, // Required
      isMultiPartition: false, // Required
      votingRight: params.votingRights,
      informationRight: false,
      liquidationRight: false,
      subscriptionRight: false,
      conversionRight: false,
      redemptionRight: false,
      putRight: false,
      dividendRight: params.dividendYield || 0,
      currency: 'USD',
      numberOfShares: params.numberOfShares,
      nominalValue: params.denomination,
      nominalValueDecimals: 2,
      regulationType: getRegulationTypeNumber(params.regulationType),
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

    // Deploy using the request object
    const deployResult = await Equity.create(deploymentRequest);

    // Save to database
    const equityPayload = {
      name: params.name,
      symbol: params.symbol,
      totalSupply: params.numberOfShares,
      decimals: 18,
      dividendYield: params.dividendYield || 0,
      votingRights: params.votingRights,
      regulationType: params.regulationType,
      companyId,
      assetAddress: deployResult.security.diamondAddress,
      transactionId: deployResult.transactionId,
      treasuryAccountId: params.companyAccountId,
      network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
    };

    await ApiClient.createEquity(companyId, equityPayload, token);

    return {
      success: true,
      assetAddress: deployResult.security.diamondAddress,
      transactionId: deployResult.transactionId
    };
  } catch (error: unknown) {
    console.error('Server deployment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to map regulation types to numbers
function getRegulationTypeNumber(regulationType: string): number {
  switch (regulationType) {
    case 'REG_D': return 1;
    case 'REG_S': return 2;
    case 'REG_CF': return 3;
    default: return 1;
  }
}
