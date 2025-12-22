"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { deployEquityOnServer } from '@/app/actions/CreateEquity';
import { ApiClient } from '@/lib/api/client';
import { CreateEquityParams ,DealType} from '@/lib/hedera/types';
import ConnectButton from '@/components/connectButton';

const CreateEquityPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const { currentCompany, fetchCompanyById } = useCompany();
  const { connect, disconnect, isConnected, account } = useWallet();

  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'connect' | 'form' | 'deploying' | 'complete'>('connect');

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    numberOfShares: '',
    denomination: 'USD',
    dividendYield: '',
    votingRights: false,
    regulationType: 'REG_D' as 'REG_D' | 'REG_S' | 'REG_CF',
    regulationSubType: '506-B',
    dealType: 'PRIMARY_ISSUANCE' as DealType,
  });

  // Fetch company on mount
  useEffect(() => {
    if (companyId) {
      fetchCompanyById(companyId);
    }
  }, [companyId]);

  // Auto-advance to form if already connected
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('form');
    }
  }, [isConnected, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConnect = async () => {
    try {
      setError('');
      await connect();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token || !user || !currentCompany || !isConnected || !account) {
      setError('Missing required data or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setStep('deploying');
      setSuccess('Deploying equity token on Hedera...');

      // Prepare equity deployment params
      const deployParams: CreateEquityParams = {
        name: formData.name,
        symbol: formData.symbol,
        numberOfShares: formData.numberOfShares,
        denomination: formData.denomination,
        regulationType: formData.regulationType,
        regulationSubType: formData.regulationSubType,
        dealType: formData.dealType as DealType,
        dividendYield: parseFloat(formData.dividendYield) || 0,
        votingRights: formData.votingRights,
        companyName: currentCompany.name,
        companyAccountId: account.accountId,
        kycProviderAddress: '', // Add if you have KYC provider address
        pauseAddress: '', // Add if you have pause address
      };

      setSuccess('Processing your request...');

      // Call server action for deployment
      const result = await deployEquityOnServer(deployParams, token, companyId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to deploy equity');
      }

      setSuccess(`Equity deployed! Asset Address: ${result.assetAddress}`);

      // The server action already saved to backend, so no need for separate API call

      setStep('complete');
      setSuccess('Equity token created successfully!');

      setTimeout(() => {
        router.push(`/company/dashboard/${companyId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Equity creation error:', err);
      setError(err.message || 'Failed to create equity');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCompany) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create Equity Token</h1>
            <p className="mt-2 text-light-100">
              Issue ERC-1400 compliant equity tokens for {currentCompany.name}
            </p>
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-primary">Powered by Hedera Asset Tokenization Studio</p>
                  <ul className="mt-2 text-xs text-light-100 space-y-1">
                    <li>• ERC-1400 & ERC-3643 compliant security tokens</li>
                    <li>• Built-in regulatory compliance (SEC Reg D, S, CF)</li>
                    <li>• On-chain KYC/AML and transfer restrictions</li>
                    <li>• Automated corporate actions (dividends, voting)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection Step */}
          {step === 'connect' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-light-100 mb-6">
                Connect HashPack or Blade wallet to deploy equity tokens
              </p>

             <ConnectButton onAccountConnected={() => {setStep("form")}} />
             <p className="mt-6 text-sm text-light-200">
                Don't have a wallet?{' '}
                <a href="https://www.hashpack.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Get HashPack
                </a>
              </p>
            </div>
          )}

          {/* Connected Wallet Display */}
          {isConnected && account && step !== 'connect' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-100 mb-1">Connected Wallet</p>
                  <p className="text-green-500 font-mono text-sm">{account.accountId}</p>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-sm text-light-200 hover:text-destructive transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 text-green-500 p-4 rounded-md border border-green-500/20">
              <div className="flex items-center space-x-2">
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 flex-shrink-0"></div>
                )}
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {(step === 'form' || step === 'deploying') && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-light-100 mb-1">
                      Equity Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Common Stock"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="symbol" className="block text-sm font-medium text-light-100 mb-1">
                      Symbol *
                    </label>
                    <input
                      id="symbol"
                      name="symbol"
                      type="text"
                      value={formData.symbol}
                      onChange={handleChange}
                      maxLength={5}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                      placeholder="e.g., CS"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="numberOfShares" className="block text-sm font-medium text-light-100 mb-1">
                      Number of Shares *
                    </label>
                    <input
                      id="numberOfShares"
                      name="numberOfShares"
                      type="number"
                      value={formData.numberOfShares}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 1000000"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="denomination" className="block text-sm font-medium text-light-100 mb-1">
                      Denomination
                    </label>
                    <select
                      id="denomination"
                      name="denomination"
                      value={formData.denomination}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="KES">KES</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Regulation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Regulatory Compliance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="regulationType" className="block text-sm font-medium text-light-100 mb-1">
                      Regulation Type *
                    </label>
                    <select
                      id="regulationType"
                      name="regulationType"
                      value={formData.regulationType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={isLoading}
                    >
                      <option value="REG_D">Reg D (US Private Placement)</option>
                      <option value="REG_S">Reg S (International)</option>
                      <option value="REG_CF">Reg CF (Crowdfunding)</option>
                    </select>
                  </div>

                  {formData.regulationType === 'REG_D' && (
                    <div>
                      <label htmlFor="regulationSubType" className="block text-sm font-medium text-light-100 mb-1">
                        Reg D Sub-Type
                      </label>
                      <select
                        id="regulationSubType"
                        name="regulationSubType"
                        value={formData.regulationSubType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                      >
                        <option value="506-B">506(b) - No General Solicitation</option>
                        <option value="506-C">506(c) - Accredited Only</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Corporate Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Corporate Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dividendYield" className="block text-sm font-medium text-light-100 mb-1">
                      Dividend Yield (%)
                    </label>
                    <input
                      id="dividendYield"
                      name="dividendYield"
                      type="number"
                      step="0.01"
                      value={formData.dividendYield}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 5.5"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <input
                      id="votingRights"
                      name="votingRights"
                      type="checkbox"
                      checked={formData.votingRights}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor="votingRights" className="ml-2 text-sm font-medium text-light-100">
                      Voting Rights
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-dark-100 border border-border rounded-lg p-4">
                <h4 className="font-medium text-white mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  What You're Creating
                </h4>
                <ul className="text-sm text-light-100 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>ERC-1400/3643 Compliant:</strong> Industry-standard security token with partition management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>On-Chain Compliance:</strong> Built-in KYC, transfer restrictions, and regulatory checks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Corporate Actions:</strong> Automated dividend payments and voting mechanisms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Immutable Audit Trail:</strong> All transactions recorded on Hedera for compliance</span>
                  </li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deploying Token...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Deploy Equity Token
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-dark-100 text-white border border-border rounded-md hover:bg-dark-200 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Equity Token Created!</h3>
              <p className="text-light-100 mb-6">
                Your security token has been successfully deployed on Hedera
              </p>
              <button
                onClick={() => router.push(`/company/dashboard/${companyId}`)}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEquityPage;