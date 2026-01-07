"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { useCreateEquity } from '@/hooks/useCreateEquity';
import type { CreateEquityParams } from '@/lib/hedera/ATSService';
import ConnectButton from '@/components/connectButton';
import Toggle from '@/components/ui/Toggle';
import CountrySelect from '@/components/ui/CountrySelect';
import { PAYMENT_TOKENS } from '@/lib/constants';

const STEPS = [
  { id: 1, name: 'General Information' },
  { id: 2, name: 'Specific Details' },
  { id: 3, name: 'Rights & Privileges' },
  { id: 4, name: 'External Lists' },
  { id: 5, name: 'ERC3643' },
  { id: 6, name: 'Regulation' },
  { id: 7, name: 'Review' },
];

const DIVIDEND_TYPES = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Preferred' },
  { value: 2, label: 'Common' },
];

const CreateEquityPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token, isLoading: authLoading } = useAuth();
  const { currentCompany, fetchCompanyById, isLoading: companyLoading } = useCompany();
  const { isConnected, account } = useWallet();

  const companyId = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);

  // Form State - organized by step
  const [formData, setFormData] = useState({
    // Step 1: General Information
    name: '',
    symbol: '',
    decimals: '4',
    isin: '',
    // Digital Security Permissions
    isControllable: true,
    isBlocklist: true,
    isApprovalList: false,
    // Digital Security Configuration
    clearingModeEnabled: false,
    internalKycActivated: true,

    // Step 2: Specific Details (Economic Information)
    numberOfShares: '',
    nominalValue: '1.00',
    currency: 'USD',

    // Step 3: Rights & Privileges
    votingRights: false,
    informationRights: false,
    liquidationRights: false,
    conversionRights: false,
    subscriptionRights: false,
    redemptionRights: false,
    putRight: false,
    dividendType: 0 as 0 | 1 | 2,

    // Step 4: External Lists
    externalPauseIds: '',
    externalControlIds: '',
    externalKycIds: '',

    // Step 5: ERC3643
    complianceId: '',
    identityRegistryId: '',

    // Step 6: Regulation
    regulationType: 'REG_D' as 'REG_D' | 'REG_S' | 'REG_CF',
    regulationSubType: '506-B',
    jurisdiction: 'US',

    // Payment Tokens (default to KESy)
    paymentTokens: ['0.0.7228867'], // KESy token ID as default
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

  const handleToggle = (field: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleNext = () => {
    // Basic validation per step
    if (currentStep === 1) {
      if (!formData.name || !formData.symbol || !formData.isin) {
        setError('Please fill in all mandatory fields (Name, Symbol, ISIN)');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.numberOfShares || !formData.nominalValue) {
        setError('Please fill in Number of Shares and Nominal Value');
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
        // General Information
        name: formData.name,
        symbol: formData.symbol,
        isin: formData.isin,
        decimals: parseInt(formData.decimals) || 4,

        // Digital Security Permissions
        isControllable: formData.isControllable,
        isBlocklist: formData.isBlocklist,
        isApprovalList: formData.isApprovalList,

        // Digital Security Configuration
        clearingModeEnabled: formData.clearingModeEnabled,
        internalKycActivated: formData.internalKycActivated,

        // Economic Information
        nominalValue: formData.nominalValue,
        currency: formData.currency,
        numberOfShares: formData.numberOfShares,

        // Rights and Privileges
        votingRights: formData.votingRights,
        informationRights: formData.informationRights,
        liquidationRights: formData.liquidationRights,
        conversionRights: formData.conversionRights,
        subscriptionRights: formData.subscriptionRights,
        redemptionRights: formData.redemptionRights,
        putRight: formData.putRight,
        dividendType: formData.dividendType,

        // External Lists
        externalPauseIds: formData.externalPauseIds ? formData.externalPauseIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        externalControlIds: formData.externalControlIds ? formData.externalControlIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        externalKycIds: formData.externalKycIds ? formData.externalKycIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,

        // ERC3643
        complianceId: formData.complianceId || undefined,
        identityRegistryId: formData.identityRegistryId || undefined,

        // Regulation
        regulationType: formData.regulationType,
        regulationSubType: formData.regulationSubType,

        // Payment Tokens
        paymentTokens: formData.paymentTokens,

        // Metadata
        companyName: currentCompany.name,
        companyAccountId: account.accountId,
      };

      await createEquity(deployParams);
    } catch (err: any) {
      setError(err.message || 'Failed to create equity');
    }
  };

  // --- RENDER HELPERS ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-2 overflow-x-auto">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors flex-shrink-0
              ${isActive || isCompleted ? 'bg-primary border-primary text-white' : 'bg-transparent border-light-200 text-light-200'}
            `}>
              {step.id}
            </div>

            {/* Label - hidden on small screens */}
            <span className={`
              ml-2 text-xs font-medium whitespace-nowrap hidden sm:inline
              ${isActive ? 'text-white' : 'text-light-200'}
            `}>
              {step.name}
            </span>

            {/* Connector Line (except last) */}
            {index < STEPS.length - 1 && (
              <div className={`
                h-0.5 w-4 sm:w-8 mx-2 sm:mx-4 transition-colors flex-shrink-0
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
      case 1: // General Information
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">General Information</h3>
              <p className="text-light-100 text-sm mb-6">Enter the basic details of the digital security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. YTECH"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Symbol *</label>
                <input
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="e.g. YTECH"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Decimals *</label>
                <input
                  name="decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={formData.decimals}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-light-200 mt-1">Token decimal places (0-18)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">ISIN *</label>
                <input
                  name="isin"
                  value={formData.isin}
                  onChange={handleChange}
                  placeholder="KE1000001402"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-light-200 mt-1">International Securities Identification Number</p>
              </div>
            </div>

            {/* Digital Security Permissions */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-white mb-4">Digital Security Permissions</h4>
              <div className="space-y-3">
                <Toggle
                  id="isControllable"
                  label="Controllable"
                  description="Allow issuer to control and manage transfers"
                  checked={formData.isControllable}
                  onChange={handleToggle('isControllable')}
                />
                <Toggle
                  id="isBlocklist"
                  label="Blocklist"
                  description="Enable blocklist functionality for compliance"
                  checked={formData.isBlocklist}
                  onChange={handleToggle('isBlocklist')}
                />
                <Toggle
                  id="isApprovalList"
                  label="Approval List"
                  description="Require approval for transfers"
                  checked={formData.isApprovalList}
                  onChange={handleToggle('isApprovalList')}
                />
              </div>
            </div>

            {/* Digital Security Configuration */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-white mb-4">Digital Security Configuration</h4>
              <div className="space-y-3">
                <Toggle
                  id="clearingModeEnabled"
                  label="Clearing Mode Enabled"
                  description="Enable clearing mode for settlement"
                  checked={formData.clearingModeEnabled}
                  onChange={handleToggle('clearingModeEnabled')}
                />
                <Toggle
                  id="internalKycActivated"
                  label="Internal KYC Activated"
                  description="Use internal KYC verification"
                  checked={formData.internalKycActivated}
                  onChange={handleToggle('internalKycActivated')}
                />
              </div>
            </div>
          </div>
        );

      case 2: // Specific Details
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Economic Information</h3>
              <p className="text-light-100 text-sm mb-6">Enter currency, type, amount details.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Nominal Value *</label>
                <input
                  name="nominalValue"
                  type="text"
                  value={formData.nominalValue}
                  onChange={handleChange}
                  placeholder="1.00"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Face value per share</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Currency *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="GBP">🇬🇧 GBP - British Pound</option>
                  <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                  <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                  <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                  <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                  <option value="AED">🇦🇪 AED - UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Number of Shares *</label>
                <input
                  name="numberOfShares"
                  type="text"
                  value={formData.numberOfShares}
                  onChange={handleChange}
                  placeholder="100,000,000.0000"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="p-4 bg-dark-100 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-200">Total Value</span>
                  <span className="text-lg font-semibold text-white">
                    {formData.numberOfShares && formData.nominalValue
                      ? (parseFloat(formData.numberOfShares.replace(/,/g, '')) * parseFloat(formData.nominalValue)).toLocaleString()
                      : '0'} {formData.currency}
                  </span>
                </div>
              </div>

              {/* Payment Tokens Section */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-white mb-2">Accepted Payment Tokens</h4>
                <p className="text-xs text-light-200 mb-4">
                  Select which tokens investors can use to purchase this security. KESy is the platform default.
                </p>
                <div className="space-y-3">
                  {PAYMENT_TOKENS.map((token) => {
                    const isSelected = formData.paymentTokens.includes(token.tokenId);
                    return (
                      <label
                        key={token.tokenId}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-dark-100 hover:border-primary/50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                paymentTokens: [...prev.paymentTokens, token.tokenId]
                              }));
                            } else {
                              // Don't allow unchecking if it's the only token
                              if (formData.paymentTokens.length > 1) {
                                setFormData(prev => ({
                                  ...prev,
                                  paymentTokens: prev.paymentTokens.filter(t => t !== token.tokenId)
                                }));
                              }
                            }
                          }}
                          className="w-4 h-4 text-primary bg-dark-200 border-border rounded focus:ring-primary"
                        />
                        <div className="ml-3 flex items-center flex-1">
                          <div className="w-8 h-8 bg-dark-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                            <span className="text-xs font-bold">{token.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{token.symbol}</p>
                            <p className="text-xs text-light-200">{token.name}</p>
                          </div>
                          {token.isDefault && (
                            <span className="ml-auto text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Rights & Privileges
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Rights and Privileges</h3>
              <p className="text-light-100 text-sm mb-6">Configure shareholder rights for this equity.</p>
            </div>

            <div className="space-y-3">
              <Toggle
                id="votingRights"
                label="Voting Rights"
                description="Shareholders can vote on company decisions"
                checked={formData.votingRights}
                onChange={handleToggle('votingRights')}
              />
              <Toggle
                id="informationRights"
                label="Information Rights"
                description="Shareholders can access company information"
                checked={formData.informationRights}
                onChange={handleToggle('informationRights')}
              />
              <Toggle
                id="liquidationRights"
                label="Liquidation Rights"
                description="Shareholders have claims in case of liquidation"
                checked={formData.liquidationRights}
                onChange={handleToggle('liquidationRights')}
              />
              <Toggle
                id="conversionRights"
                label="Conversion Rights"
                description="Shares can be converted to another class"
                checked={formData.conversionRights}
                onChange={handleToggle('conversionRights')}
              />
              <Toggle
                id="subscriptionRights"
                label="Subscription Rights"
                description="Shareholders have preemptive rights"
                checked={formData.subscriptionRights}
                onChange={handleToggle('subscriptionRights')}
              />
              <Toggle
                id="redemptionRights"
                label="Redemption Rights"
                description="Shares can be redeemed by issuer"
                checked={formData.redemptionRights}
                onChange={handleToggle('redemptionRights')}
              />
              <Toggle
                id="putRight"
                label="Put Right"
                description="Shareholders can sell shares back to issuer"
                checked={formData.putRight}
                onChange={handleToggle('putRight')}
              />
            </div>

            {/* Dividend Type */}
            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-light-100 mb-2">Dividend Type *</label>
              <select
                name="dividendType"
                value={formData.dividendType}
                onChange={(e) => setFormData(prev => ({ ...prev, dividendType: parseInt(e.target.value) as 0 | 1 | 2 }))}
                className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
              >
                {DIVIDEND_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <p className="text-xs text-light-200 mt-1">
                {formData.dividendType === 0 && 'No dividend rights attached'}
                {formData.dividendType === 1 && 'Preferred dividend priority over common shares'}
                {formData.dividendType === 2 && 'Common dividend rights'}
              </p>
            </div>
          </div>
        );

      case 4: // External Lists
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">External Lists</h3>
              <p className="text-light-100 text-sm mb-6">Add external lists configurations (optional).</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External Pause List</label>
                <input
                  name="externalPauseIds"
                  value={formData.externalPauseIds}
                  onChange={handleChange}
                  placeholder="0.0.xxxxx"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Hedera account ID for external pause control</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External Control List</label>
                <input
                  name="externalControlIds"
                  value={formData.externalControlIds}
                  onChange={handleChange}
                  placeholder="0.0.xxxxx"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Hedera account ID for external control list</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External KYC List</label>
                <input
                  name="externalKycIds"
                  value={formData.externalKycIds}
                  onChange={handleChange}
                  placeholder="0.0.xxxxx"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Hedera account ID for external KYC verification</p>
              </div>
            </div>
          </div>
        );

      case 5: // ERC3643
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">ERC3643 Configuration</h3>
              <p className="text-light-100 text-sm mb-6">Add ERC3643 compliance configurations (optional).</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Compliance ID</label>
                <input
                  name="complianceId"
                  value={formData.complianceId}
                  onChange={handleChange}
                  placeholder="0.0.123456"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Hedera account ID for compliance module</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Identity Registry ID</label>
                <input
                  name="identityRegistryId"
                  value={formData.identityRegistryId}
                  onChange={handleChange}
                  placeholder="0.0.123456"
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-light-200 mt-1">Hedera account ID for identity registry</p>
              </div>
            </div>
          </div>
        );

      case 6: // Regulation
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Regulation</h3>
              <p className="text-light-100 text-sm mb-6">Configure regulatory compliance settings.</p>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
              <p className="text-orange-200 text-sm">
                ⚠️ It is recommended to consult your legal and financial advisor for regulations applicable to your asset token.
              </p>
            </div>

            <div className="space-y-4">
              <CountrySelect
                label="Jurisdiction *"
                value={formData.jurisdiction}
                onChange={(code) => setFormData(prev => ({ ...prev, jurisdiction: code }))}
              />

              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Regulation Type *</label>
                <select
                  name="regulationType"
                  value={formData.regulationType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary"
                >
                  <option value="REG_D">Regulation D (US Private Placement)</option>
                  <option value="REG_S">Regulation S (International)</option>
                  <option value="REG_CF">Regulation CF (Crowdfunding)</option>
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

              {/* Regulation Info Box */}
              <div className="p-4 bg-dark-100 rounded-lg border border-border">
                <h5 className="text-sm font-semibold text-white mb-3">Regulation {formData.regulationType.replace('REG_', '')} Restrictions</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Deal Size</div>
                  <div className="text-white">{formData.regulationType === 'REG_S' ? 'Unlimited' : formData.regulationType === 'REG_D' ? 'Unlimited' : 'Up to $5M'}</div>

                  <div className="text-light-200">Accredited Investors</div>
                  <div className="text-white">{formData.regulationType === 'REG_CF' ? 'Not Required' : 'Required'}</div>

                  <div className="text-light-200">International Investors</div>
                  <div className="text-white">{formData.regulationType === 'REG_S' ? 'Allowed' : 'Limited'}</div>

                  <div className="text-light-200">Resale Hold Period</div>
                  <div className="text-white">{formData.regulationType === 'REG_S' ? 'Not applicable' : '6-12 months'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Review
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Review & Deploy</h3>

            <div className="bg-dark-100 p-6 rounded-lg border border-border space-y-6">
              {/* General Information */}
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">General Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Name</div>
                  <div className="text-white font-medium text-right">{formData.name}</div>
                  <div className="text-light-200">Symbol</div>
                  <div className="text-white font-medium text-right">{formData.symbol}</div>
                  <div className="text-light-200">ISIN</div>
                  <div className="text-white font-medium text-right">{formData.isin}</div>
                  <div className="text-light-200">Decimals</div>
                  <div className="text-white font-medium text-right">{formData.decimals}</div>
                </div>
              </div>

              {/* Economic Information */}
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Economic Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Shares</div>
                  <div className="text-white font-medium text-right">{formData.numberOfShares}</div>
                  <div className="text-light-200">Price</div>
                  <div className="text-white font-medium text-right">{formData.nominalValue} {formData.currency}</div>
                </div>
              </div>

              {/* Configuration */}
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Configuration</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.isControllable && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Controllable</span>}
                  {formData.isBlocklist && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Blocklist</span>}
                  {formData.internalKycActivated && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Internal KYC</span>}
                  {formData.votingRights && <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Voting</span>}
                  {formData.informationRights && <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Information</span>}
                  {formData.liquidationRights && <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Liquidation</span>}
                </div>
              </div>

              {/* Regulation */}
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Regulation</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Type</div>
                  <div className="text-white font-medium text-right">{formData.regulationType}</div>
                  <div className="text-light-200">Dividend Type</div>
                  <div className="text-white font-medium text-right">{DIVIDEND_TYPES.find(t => t.value === formData.dividendType)?.label}</div>
                </div>
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
          <p className="text-light-200 mt-1">Create a new digital equity security</p>
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
