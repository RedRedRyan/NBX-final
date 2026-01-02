"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { useCreateEquity } from '@/hooks/useCreateEquity';
import type { CreateEquityParams } from '@/lib/hedera/ATSService';
import ConnectButton from '@/components/connectButton';

const STEPS = [
  { id: 1, name: 'Create Equity' },
  { id: 2, name: 'Specific details' },
  { id: 3, name: 'External Lists' },
  { id: 4, name: 'ERC3643' },
  { id: 5, name: 'Regulation' },
  { id: 6, name: 'Review' },
];

const CreateEquityPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token, isLoading: authLoading } = useAuth();
  const { currentCompany, fetchCompanyById, isLoading: companyLoading } = useCompany();
  const { isConnected, account } = useWallet();

  const companyId = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: General
    name: '',
    symbol: '',
    decimals: '18', // Fixed usually
    isin: '', // New required field

    // Step 2: Specifics
    numberOfShares: '',
    nominalValue: '1',
    currency: 'USD',

    // Step 3: External Lists (Placeholder for now)
    kycProviderAddress: '',
    pauseAddress: '',

    // Step 4: ERC3643 (Corporate Actions)
    votingRights: true,
    dividendYield: '',

    // Step 5: Regulation
    regulationType: 'REG_D' as 'REG_D' | 'REG_S' | 'REG_CF',
    regulationSubType: '506-B',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Hook for creation logic
  const { createEquity, isLoading: isCreating } = useCreateEquity({
    companyId,
    onSuccess: (result) => {
      console.log('🎉 Equity created successfully:', result);
      setSuccess(`Equity deployed! Asset Address: ${result.assetAddress}`);
      setTimeout(() => {
        router.push(`/company/dashboard/${companyId}`);
      }, 3000);
    },
    onError: (err) => {
      console.error('🔥 Equity creation error:', err);
      setError(err);
    },
  });

  // Fetch company
  useEffect(() => {
    if (companyId && token) {
      fetchCompanyById(companyId);
    }
  }, [companyId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 1) {
      if (!formData.name || !formData.symbol || !formData.isin) {
        setError('Please fill in all mandatory fields (Name, Symbol, ISIN)');
        return;
      }
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!currentCompany || !account) {
      setError('Missing company data or wallet not connected');
      return;
    }

    try {
      const deployParams: CreateEquityParams = {
        name: formData.name,
        symbol: formData.symbol,
        isin: formData.isin,
        numberOfShares: formData.numberOfShares,
        denomination: formData.currency,
        denominationValue: formData.nominalValue,
        regulationType: formData.regulationType,
        regulationSubType: formData.regulationSubType,
        dividendYield: parseFloat(formData.dividendYield) || 0,
        votingRights: formData.votingRights,
        companyName: currentCompany.name,
        companyAccountId: account.accountId,
        kycProviderAddress: formData.kycProviderAddress,
        pauseAddress: formData.pauseAddress,
      };

      await createEquity(deployParams);
    } catch (err: any) {
      setError(err.message || 'Failed to create equity');
    }
  };

  // --- RENDER HELPERS ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-4 overflow-x-auto">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors
              ${isActive || isCompleted ? 'bg-primary border-primary text-white' : 'bg-transparent border-light-200 text-light-200'}
            `}>
              {step.id}
            </div>

            {/* Label */}
            <span className={`
              ml-2 text-sm font-medium whitespace-nowrap
              ${isActive ? 'text-white' : 'text-light-200'}
            `}>
              {step.name}
            </span>

            {/* Connector Line (except last) */}
            {index < STEPS.length - 1 && (
              <div className={`
                h-0.5 w-8 sm:w-16 mx-4 transition-colors
                ${isCompleted ? 'bg-primary' : 'bg-light-200/20'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1: // Create Equity (General)
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Equity</h3>
              <p className="text-light-100 text-sm mb-6">Enter the basics details to start creating it.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Symbol *</label>
                <input
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="Enter Symbol"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Decimals *</label>
                <input
                  name="decimals"
                  value={formData.decimals}
                  disabled
                  className="w-full px-4 py-3 bg-dark-300 border border-border rounded-lg text-light-200 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">ISIN *</label>
                <input
                  name="isin"
                  value={formData.isin}
                  onChange={handleChange}
                  placeholder="US1234567890"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-light-200 mt-1">International Securities Identification Number</p>
              </div>
            </div>
          </div>
        );

      case 2: // Specific details
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Specific Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Number of Shares *</label>
                <input
                  name="numberOfShares"
                  type="number"
                  value={formData.numberOfShares}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Nominal Value (Price per share) *</label>
                <input
                  name="nominalValue"
                  type="number"
                  value={formData.nominalValue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Currency *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="KES">KES</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3: // External Lists
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">External Lists (Optional)</h3>
            <p className="text-light-200 text-sm mb-4">Configure external compliance providers.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">KYC Provider Address</label>
                <input
                  name="kycProviderAddress"
                  value={formData.kycProviderAddress}
                  onChange={handleChange}
                  placeholder="0.0.xxxxx"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Pause Key Address</label>
                <input
                  name="pauseAddress"
                  value={formData.pauseAddress}
                  onChange={handleChange}
                  placeholder="0.0.xxxxx"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        );

      case 4: // ERC3643
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Corporate Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Dividend Yield (%)</label>
                <input
                  name="dividendYield"
                  type="number"
                  step="0.01"
                  value={formData.dividendYield}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center p-4 bg-dark-100 rounded-lg border border-border">
                <input
                  id="votingRights"
                  name="votingRights"
                  type="checkbox"
                  checked={formData.votingRights}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary border-gray-600 rounded focus:ring-primary"
                />
                <label htmlFor="votingRights" className="ml-3 text-sm font-medium text-white">
                  Enable Voting Rights
                </label>
              </div>
            </div>
          </div>
        );

      case 5: // Regulation
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Regulation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Regulation Type *</label>
                <select
                  name="regulationType"
                  value={formData.regulationType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                >
                  <option value="REG_D">Reg D (US Private Placement)</option>
                  <option value="REG_S">Reg S (International)</option>
                  <option value="REG_CF">Reg CF (Crowdfunding)</option>
                </select>
              </div>
              {formData.regulationType === 'REG_D' && (
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-1">Reg D Sub-Type</label>
                  <select
                    name="regulationSubType"
                    value={formData.regulationSubType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                  >
                    <option value="506-B">506(b)</option>
                    <option value="506-C">506(c)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 6: // Review
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Review & Deploy</h3>
            <div className="bg-dark-100 p-6 rounded-lg border border-border space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-light-200">Name</div>
                <div className="text-white font-medium text-right">{formData.name}</div>

                <div className="text-light-200">Symbol</div>
                <div className="text-white font-medium text-right">{formData.symbol}</div>

                <div className="text-light-200">ISIN</div>
                <div className="text-white font-medium text-right">{formData.isin}</div>

                <div className="text-light-200">Shares</div>
                <div className="text-white font-medium text-right">{formData.numberOfShares}</div>

                <div className="text-light-200">Price</div>
                <div className="text-white font-medium text-right">{formData.nominalValue} {formData.currency}</div>

                <div className="text-light-200">Regulation</div>
                <div className="text-white font-medium text-right">{formData.regulationType}</div>
              </div>
            </div>

            {/* Connection Warning */}
            {!isConnected && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded-lg text-sm">
                Please connect your wallet to deploy.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (authLoading || (companyLoading && !currentCompany)) {
    return <div className="min-h-screen bg-dark-100 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="text-light-200 hover:text-white text-sm flex items-center mb-4 transition-colors">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Equity Creation</h1>
        </div>

        {/* Steps */}
        {renderStepIndicator()}

        {/* Main Card */}
        <div className="bg-dark-200 rounded-xl border border-border p-8 shadow-xl">

          {/* Connection Top Bar (if not connected) */}
          {!isConnected && (
            <div className="mb-8 flex justify-end">
              <ConnectButton />
            </div>
          )}

          {/* Content */}
          <div className="min-h-[400px]">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 text-2xl">✓</div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-light-200">{success}</p>
              </div>
            ) : (
              renderContent()
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Footer / Navigation */}
          {!success && (
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || isCreating}
                className="px-6 py-3 border border-border text-white rounded-lg hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isCreating || !isConnected}
                  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-primary/20 flex items-center"
                >
                  {isCreating ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span> Deploying...
                    </>
                  ) : (
                    'Deploy Equity'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEquityPage;
