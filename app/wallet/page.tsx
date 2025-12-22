"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { walletActions } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';
import Image from "next/image";

// KYC Verification Modal Component
const KYCModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    frontImage: null as File | null,
    backImage: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [`${side}Image`]: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement KYC submission to your backend
    console.log('KYC Data:', formData);
    alert('KYC verification submitted successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">KYC Verification</h2>
            <button onClick={onClose} className="text-light-200 hover:text-light-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-primary text-dark-300' : 'bg-dark-200 text-light-200'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-dark-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-dark-200 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ID Number</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  className="w-full bg-dark-200 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Enter your ID/Passport number"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.idNumber}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Upload Front of ID */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Front of ID</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {formData.frontImage ? (
                    <div>
                      <p className="text-primary mb-2">{formData.frontImage.name}</p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, frontImage: null }))}
                        className="text-sm text-light-200 hover:text-light-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-2 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-light-200">Click to upload front of ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-dark-200 text-light-100 py-2 rounded-lg hover:bg-dark-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.frontImage}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Back of ID */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Back of ID</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {formData.backImage ? (
                    <div>
                      <p className="text-primary mb-2">{formData.backImage.name}</p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, backImage: null }))}
                        className="text-sm text-light-200 hover:text-light-100"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <svg className="w-12 h-12 mx-auto mb-2 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-light-200">Click to upload back of ID</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-dark-200 text-light-100 py-2 rounded-lg hover:bg-dark-300"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.backImage}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface Asset {
  name: string;
  symbol: string;
  balance: number;
  value: number;
  icon: string;
  tokenId?: string;
}

const WalletPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [hideBalance, setHideBalance] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showKYCModal, setShowKYCModal] = useState(false);
  
  // Fetch assets from Hedera
  useEffect(() => {
    const fetchHederaAssets = async () => {
      if (!user?.hederaAccountId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch account balance from Hedera Mirror Node (testnet)
        const response = await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${user.hederaAccountId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }

        const accountData = await response.json();

        // Fetch token balances
        const tokensResponse = await fetch(
          `https://testnet.mirrornode.hedera.com/api/v1/accounts/${user.hederaAccountId}/tokens`
        );

        const tokensData = tokensResponse.ok ? await tokensResponse.json() : { tokens: [] };

        // Process HBAR balance
        const hbarBalance = accountData.balance?.balance 
          ? accountData.balance.balance / 100000000 // Convert tinybars to HBAR
          : 0;

        const assetsList: Asset[] = [];
        let total = 0;

        // Add HBAR
        if (hbarBalance > 0) {
          const hbarValue = hbarBalance * 0.05; // Mock price, you should fetch real price
          assetsList.push({
            name: 'HBAR',
            symbol: 'HBAR',
            balance: hbarBalance,
            value: hbarValue,
            icon: '/icons/hbar.png',
          });
          total += hbarValue;
        }

        // Add tokens
        if (tokensData.tokens && tokensData.tokens.length > 0) {
          for (const token of tokensData.tokens) {
            // Fetch token info to get name and symbol
            try {
              const tokenInfoResponse = await fetch(
                `https://testnet.mirrornode.hedera.com/api/v1/tokens/${token.token_id}`
              );
              const tokenInfo = await tokenInfoResponse.json();

              const balance = token.balance / Math.pow(10, tokenInfo.decimals || 0);
              const mockValue = balance; // Mock 1:1 value, you should fetch real prices

              assetsList.push({
                name: tokenInfo.name || token.token_id,
                symbol: tokenInfo.symbol || 'TOKEN',
                balance: balance,
                value: mockValue,
                icon: '/icons/token.png', // Default icon
                tokenId: token.token_id,
              });
              total += mockValue;
            } catch (err) {
              console.error(`Failed to fetch token info for ${token.token_id}:`, err);
            }
          }
        }

        setAssets(assetsList);
        setTotalBalance(total);
      } catch (err) {
        console.error('Error fetching Hedera assets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchHederaAssets();
  }, [user?.hederaAccountId]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleKYCClick = () => {
    if (user?.role === 'company') {
      router.push('/company/setup');
    } else {
      setShowKYCModal(true);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Wallet</h1>
        
        <Link 
          href="/wallet/settings" 
          className="text-light-100 hover:text-primary"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Link>
      </div>
      
      {/* Total Balance Card */}
      <div className="bg-dark-100 border border-border rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Total Assets</h2>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="text-light-100 hover:text-primary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {hideBalance ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                />
              )}
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span className="text-light-200">Loading balance...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">
              <p className="font-medium">Error loading balance</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <h3 className="text-3xl font-bold">
              {hideBalance ? '••••••' : `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
          )}
        </div>
        
        {/* Account ID Display */}
        {user.hederaAccountId && (
          <div className="mb-4">
            <p className="text-sm text-light-200">
              Account: <span className="text-primary font-mono">{user.hederaAccountId}</span>
            </p>
          </div>
        )}
        
        {/* KYC/KYB Button */}
        <div className="mb-2">
          <button
            className="bg-primary/10 text-primary text-sm px-4 py-1 rounded-full hover:bg-primary/20"
            onClick={handleKYCClick}
          >
            {user.role === 'company' ? 'Complete KYB' : 'Complete KYC'}
          </button>
          <span className="text-light-200 text-sm ml-2">
            Verify your identity to unlock all features
          </span>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {walletActions.map((action) => (
            <button
              key={action.id}
              className="bg-dark-100 border border-border rounded-lg p-4 hover:border-primary transition-colors flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Image src={action.icon} alt="action" width={24} height={24} />
              </div>
              <span className="text-light-100">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Assets List */}
      <div>
        <h2 className="text-xl font-medium mb-4">Your Assets</h2>
        <div className="bg-dark-100 border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-light-200">Loading assets...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-light-100 font-medium mb-2">Failed to load assets</p>
              <p className="text-light-200 text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-medium mb-2">No Assets Yet</h3>
              <p className="text-light-200 mb-4">
                Your wallet is empty. Start by depositing some HBAR or tokens.
              </p>
              <button
                onClick={() => router.push('/deposit')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Deposit Funds
              </button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-dark-200 font-medium">
                <div className="col-span-5">Asset</div>
                <div className="col-span-3 text-right">Balance</div>
                <div className="col-span-3 text-right">Value</div>
                <div className="col-span-1 text-right"></div>
              </div>
              
              {/* Table body */}
              {assets.map((asset) => (
                <div key={asset.symbol + (asset.tokenId || '')} className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-dark-200/30">
                  {/* Asset name and symbol */}
                  <div className="col-span-5 flex items-center">
                    <div className="bg-dark-200 rounded-full flex items-center justify-center mr-3">
                      <Image src={asset.icon} alt={asset.symbol} width={24} height={24} />
                    </div>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-light-200">{asset.symbol}</div>
                    </div>
                  </div>
                  
                  {/* Balance */}
                  <div className="col-span-3 text-right self-center">
                    {hideBalance ? '••••••' : `${asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${asset.symbol}`}
                  </div>
                  
                  {/* Value */}
                  <div className="col-span-3 text-right self-center">
                    {hideBalance ? '••••••' : `$${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  
                  {/* Trade button */}
                  <div className="col-span-1 text-right self-center">
                    <button 
                      className="text-primary hover:text-primary/80"
                      onClick={() => router.push(`/trade?symbol=${asset.symbol}`)}
                    >
                      <Image src='/icons/trade.png' alt='trade' width={24} height={24}/>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* KYC Modal */}
      <KYCModal isOpen={showKYCModal} onClose={() => setShowKYCModal(false)} />
    </div>
  );
};

export default WalletPage;