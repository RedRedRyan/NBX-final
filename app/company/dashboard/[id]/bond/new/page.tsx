"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { ATSService, type SecurityResult, type CreateBondParams } from '@/lib/hedera/ATSService';
import ConnectButton from '@/components/connectButton';
import Toggle from '@/components/ui/Toggle';
import CountrySelect from '@/components/ui/CountrySelect';
import DatePicker from '@/components/ui/DatePicker';

const STEPS = [
  { id: 1, name: 'General Information' },
  { id: 2, name: 'Bond Details' },
  { id: 3, name: 'External Lists' },
  { id: 4, name: 'ERC3643' },
  { id: 5, name: 'Regulation' },
  { id: 6, name: 'Review' },
];

const CreateBondPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token, isLoading: authLoading } = useAuth();
  const { currentCompany, fetchCompanyById, isLoading: companyLoading } = useCompany();
  const { isConnected, account } = useWallet();

  const companyId = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: General Information
    name: '',
    symbol: '',
    isin: '',
    decimals: '0',
    currency: 'USD',
    // Digital Security Permissions
    isControllable: true,
    isBlocklist: true,
    // Digital Security Configuration
    clearingModeEnabled: false,
    internalKycActivated: false,

    // Step 2: Bond Details
    numberOfUnits: '',
    nominalValue: '1000',
    couponRate: '',
    startingDate: new Date().toISOString().split('T')[0],
    maturityDate: '',

    // Step 3: External Lists
    externalPauseIds: '',
    externalControlIds: '',
    externalKycIds: '',

    // Step 4: ERC3643
    complianceId: '',
    identityRegistryId: '',

    // Step 5: Regulation
    regulationType: 'REG_D' as 'REG_D' | 'REG_S' | 'REG_CF',
    regulationSubType: '506-B',
    jurisdiction: 'US',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<SecurityResult | null>(null);

  useEffect(() => {
    if (companyId && token) {
      fetchCompanyById(companyId);
    }
  }, [companyId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.symbol || !formData.isin) {
        setError('Please fill in Name, Symbol, and ISIN');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.numberOfUnits || !formData.nominalValue || !formData.couponRate || !formData.maturityDate) {
        setError('Please fill in all bond details');
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

    setIsCreating(true);
    setError('');

    try {
      if (!ATSService.isSDKInitialized()) {
        await ATSService.init();
      }
      if (!ATSService.isWalletConnected()) {
        await ATSService.connectWallet();
      }

      const deployParams: CreateBondParams = {
        name: formData.name,
        symbol: formData.symbol,
        isin: formData.isin,
        decimals: parseInt(formData.decimals) || 0,
        isControllable: formData.isControllable,
        isBlocklist: formData.isBlocklist,
        clearingModeEnabled: formData.clearingModeEnabled,
        internalKycActivated: formData.internalKycActivated,
        nominalValue: formData.nominalValue,
        currency: formData.currency,
        numberOfUnits: formData.numberOfUnits,
        startingDate: new Date(formData.startingDate),
        maturityDate: new Date(formData.maturityDate),
        couponRate: parseInt(formData.couponRate),
        externalPauseIds: formData.externalPauseIds ? formData.externalPauseIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        externalControlIds: formData.externalControlIds ? formData.externalControlIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        externalKycIds: formData.externalKycIds ? formData.externalKycIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        complianceId: formData.complianceId || undefined,
        identityRegistryId: formData.identityRegistryId || undefined,
        regulationType: formData.regulationType,
        regulationSubType: formData.regulationSubType,
        companyName: currentCompany.name,
        companyAccountId: account.accountId,
      };

      const deployResult = await ATSService.createBond(deployParams);

      if (!deployResult.success) {
        throw new Error(deployResult.error || 'Failed to deploy bond token');
      }

      setResult(deployResult);

      // Save to Backend
      try {
        // Construct payload for backend
        // We include the on-chain address and txId
        const backendPayload = {
          ...deployParams,
          assetAddress: deployResult.assetAddress,
          transactionId: deployResult.transactionId,
          status: 'Active', // Default status
          // Ensure dates are strings or Date objects as expected by backend DTO
          startingDate: new Date(formData.startingDate),
          maturityDate: new Date(formData.maturityDate),
        };

        // We assume ApiClient is imported. If not, we rely on it being available or import it.
        // Checking imports... ApiClient is NOT imported in the file view I saw.
        // I need to add import ApiClient or use what's available?
        // The file has imports from '@/lib/hedera/ATSService'.
        // I need to add `import { ApiClient } from '@/lib/api/client';` at the top.
        // But I can't add imports with this tool easily in one go if they are far apart.
        // I will assume ApiClient needs to be imported. I'll split this into 2 edits if needed.
        // For now, let's look at the imports. Line 8 is ATSService.
        // I will use a separate edit to add the import.

        await import('@/lib/api/client').then(({ ApiClient }) => {
          return ApiClient.createBond(companyId, backendPayload, token!);
        });

        setSuccess(`Bond deployed and saved! Asset Address: ${deployResult.assetAddress}`);
      } catch (backendError: any) {
        console.error("Failed to save bond to backend:", backendError);
        // Don't fail the whole flow, but warn
        setSuccess(`Bond deployed (Chain Only)! Asset Address: ${deployResult.assetAddress}. Backend save failed: ${backendError.message}`);
      }

      setTimeout(() => router.push(`/company/dashboard/${companyId}`), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to create bond');
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-2 overflow-x-auto">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-colors flex-shrink-0 ${isActive || isCompleted ? 'bg-primary border-primary text-white' : 'bg-transparent border-light-200 text-light-200'}`}>
              {step.id}
            </div>
            <span className={`ml-2 text-xs font-medium whitespace-nowrap hidden sm:inline ${isActive ? 'text-white' : 'text-light-200'}`}>
              {step.name}
            </span>
            {index < STEPS.length - 1 && (
              <div className={`h-0.5 w-4 sm:w-10 mx-2 sm:mx-4 transition-colors flex-shrink-0 ${isCompleted ? 'bg-primary' : 'bg-light-200/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">General Information</h3>
              <p className="text-light-100 text-sm mb-6">Enter the basic details of the bond.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Green Energy Bond Series A" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Symbol *</label>
                <input name="symbol" value={formData.symbol} onChange={handleChange} placeholder="e.g. GEB25" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">ISIN *</label>
                <input name="isin" value={formData.isin} onChange={handleChange} placeholder="US1234567890" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Decimals</label>
                <input name="decimals" type="number" min="0" max="18" value={formData.decimals} onChange={handleChange} className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-light-100 mb-1">Currency *</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary">
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="GBP">🇬🇧 GBP - British Pound</option>
                  <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                  <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-white mb-4">Digital Security Permissions</h4>
              <div className="space-y-3">
                <Toggle id="isControllable" label="Controllable" description="Allow issuer to control and manage transfers" checked={formData.isControllable} onChange={handleToggle('isControllable')} />
                <Toggle id="isBlocklist" label="Blocklist" description="Enable blocklist functionality for compliance" checked={formData.isBlocklist} onChange={handleToggle('isBlocklist')} />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-white mb-4">Digital Security Configuration</h4>
              <div className="space-y-3">
                <Toggle id="clearingModeEnabled" label="Clearing Mode Enabled" description="Enable clearing mode for settlement" checked={formData.clearingModeEnabled} onChange={handleToggle('clearingModeEnabled')} />
                <Toggle id="internalKycActivated" label="Internal KYC Activated" description="Use internal KYC verification" checked={formData.internalKycActivated} onChange={handleToggle('internalKycActivated')} />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Bond Specification</h3>
              <p className="text-light-100 text-sm mb-6">Configure the bond's financial parameters.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-1">Number of Units *</label>
                  <input name="numberOfUnits" type="text" value={formData.numberOfUnits} onChange={handleChange} placeholder="e.g. 100000" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-1">Face Value (Par Value) *</label>
                  <input name="nominalValue" type="text" value={formData.nominalValue} onChange={handleChange} className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Coupon Rate (Basis Points) *</label>
                <input name="couponRate" type="number" value={formData.couponRate} onChange={handleChange} placeholder="e.g. 500 (for 5.00%)" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-light-200 mt-1">Enter 100 for 1%, 500 for 5%. Current: {formData.couponRate ? `${(parseInt(formData.couponRate) / 100).toFixed(2)}%` : '0%'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Starting Date"
                  value={formData.startingDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, startingDate: date }))}
                />
                <DatePicker
                  label="Maturity Date *"
                  value={formData.maturityDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, maturityDate: date }))}
                  minDate={formData.startingDate}
                />
              </div>
              <div className="p-4 bg-dark-100 rounded-lg border border-border">
                <h5 className="text-sm font-semibold text-white mb-3">Bond Summary</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Total Issue Value</div>
                  <div className="text-white font-medium text-right">{formData.numberOfUnits && formData.nominalValue ? (parseFloat(formData.numberOfUnits.replace(/,/g, '')) * parseFloat(formData.nominalValue)).toLocaleString() : '0'} {formData.currency}</div>
                  <div className="text-light-200">Annual Coupon</div>
                  <div className="text-white font-medium text-right">{formData.couponRate ? `${(parseInt(formData.couponRate) / 100).toFixed(2)}%` : '0%'}</div>
                  <div className="text-light-200">Term</div>
                  <div className="text-white font-medium text-right">{formData.startingDate && formData.maturityDate ? `${Math.round((new Date(formData.maturityDate).getTime() - new Date(formData.startingDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">External Lists</h3>
              <p className="text-light-100 text-sm mb-6">Add external lists configurations (optional).</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External Pause List</label>
                <input name="externalPauseIds" value={formData.externalPauseIds} onChange={handleChange} placeholder="0.0.xxxxx" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External Control List</label>
                <input name="externalControlIds" value={formData.externalControlIds} onChange={handleChange} placeholder="0.0.xxxxx" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">External KYC List</label>
                <input name="externalKycIds" value={formData.externalKycIds} onChange={handleChange} placeholder="0.0.xxxxx" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">ERC3643 Configuration</h3>
              <p className="text-light-100 text-sm mb-6">Add ERC3643 compliance configurations (optional).</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Compliance ID</label>
                <input name="complianceId" value={formData.complianceId} onChange={handleChange} placeholder="0.0.123456" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Identity Registry ID</label>
                <input name="identityRegistryId" value={formData.identityRegistryId} onChange={handleChange} placeholder="0.0.123456" className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Regulation</h3>
              <p className="text-light-100 text-sm mb-6">Configure regulatory compliance.</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
              <p className="text-orange-200 text-sm">⚠️ Consult your legal and financial advisor for regulations applicable to your bond offering.</p>
            </div>
            <div className="space-y-4">
              <CountrySelect label="Jurisdiction *" value={formData.jurisdiction} onChange={(code) => setFormData(prev => ({ ...prev, jurisdiction: code }))} />
              <div>
                <label className="block text-sm font-medium text-light-100 mb-1">Regulation Type *</label>
                <select name="regulationType" value={formData.regulationType} onChange={handleChange} className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary">
                  <option value="REG_D">Regulation D (US Private Placement)</option>
                  <option value="REG_S">Regulation S (International)</option>
                  <option value="REG_CF">Regulation CF (Crowdfunding)</option>
                </select>
              </div>
              {formData.regulationType === 'REG_D' && (
                <div>
                  <label className="block text-sm font-medium text-light-100 mb-1">Reg D Sub-Type</label>
                  <select name="regulationSubType" value={formData.regulationSubType} onChange={handleChange} className="w-full px-4 py-3 bg-dark-100 border border-border rounded-lg text-white focus:ring-2 focus:ring-primary">
                    <option value="506-B">506(b)</option>
                    <option value="506-C">506(c)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4">Review & Deploy</h3>
            <div className="bg-dark-100 p-6 rounded-lg border border-border space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3">General Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Name</div>
                  <div className="text-white font-medium text-right">{formData.name}</div>
                  <div className="text-light-200">Symbol</div>
                  <div className="text-white font-medium text-right">{formData.symbol}</div>
                  <div className="text-light-200">ISIN</div>
                  <div className="text-white font-medium text-right">{formData.isin}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Bond Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Units (Supply)</div>
                  <div className="text-white font-medium text-right">{formData.numberOfUnits}</div>
                  <div className="text-light-200">Face Value</div>
                  <div className="text-white font-medium text-right">{formData.nominalValue} {formData.currency}</div>
                  <div className="text-light-200">Coupon</div>
                  <div className="text-white font-medium text-right">{parseInt(formData.couponRate || '0') / 100}%</div>
                  <div className="text-light-200">Maturity</div>
                  <div className="text-white font-medium text-right">{formData.maturityDate}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Configuration</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.isControllable && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Controllable</span>}
                  {formData.isBlocklist && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Blocklist</span>}
                  {formData.internalKycActivated && <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Internal KYC</span>}
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-semibold text-primary mb-3">Regulation</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-light-200">Type</div>
                  <div className="text-white font-medium text-right">{formData.regulationType}</div>
                </div>
              </div>
            </div>
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
        <div className="mb-8">
          <button onClick={() => router.back()} className="text-light-200 hover:text-white text-sm flex items-center mb-4 transition-colors">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Bond Creation</h1>
          <p className="text-light-200 mt-1">Create a new digital bond security</p>
        </div>

        {renderStepIndicator()}

        <div className="bg-dark-200 rounded-xl border border-border p-8 shadow-xl">
          {!isConnected && (
            <div className="mb-8 flex justify-end">
              <ConnectButton />
            </div>
          )}

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

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!success && (
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <button onClick={handleBack} disabled={currentStep === 1 || isCreating} className="px-6 py-3 border border-border text-white rounded-lg hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              {currentStep < STEPS.length ? (
                <button onClick={handleNext} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20">
                  Next Step
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isCreating || !isConnected} className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg shadow-primary/20 flex items-center">
                  {isCreating ? (<><span className="animate-spin mr-2">⟳</span> Deploying...</>) : 'Deploy Bond'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBondPage;
