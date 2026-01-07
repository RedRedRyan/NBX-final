"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { walletActions, KESY_TOKEN } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import Image from "next/image";
import DepositModal from '@/components/DepositModal';
import KYCModal from '@/components/KYCModal';

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
  const {
    isConnected,
    account,
    connect,
    disconnect,
    loading: walletLoading,
    error: walletError,
    associateToken,
    isTokenAssociated,
    getTokenBalance,
  } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const [hideBalance, setHideBalance] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // KESy token state
  const [kesyBalance, setKesyBalance] = useState<number | null>(null);
  const [isKesyAssociated, setIsKesyAssociated] = useState<boolean | null>(null);
  const [kesyLoading, setKesyLoading] = useState(false);
  const [associating, setAssociating] = useState(false);

  // Check KESy token association and balance
  useEffect(() => {
    const checkKesyToken = async () => {
      if (!isConnected || !account?.accountId) {
        setIsKesyAssociated(null);
        setKesyBalance(null);
        return;
      }

      setKesyLoading(true);
      try {
        // Check if wallet is associated with KESy
        const associated = await isTokenAssociated(KESY_TOKEN.tokenId);
        setIsKesyAssociated(associated);

        if (associated) {
          // Fetch KESy balance
          const balanceData = await getTokenBalance(KESY_TOKEN.tokenId);
          setKesyBalance(balanceData?.balance ?? 0);
        } else {
          setKesyBalance(null);
        }
      } catch (err) {
        console.error('Error checking KESy token:', err);
        setIsKesyAssociated(false);
      } finally {
        setKesyLoading(false);
      }
    };

    checkKesyToken();
  }, [isConnected, account?.accountId, isTokenAssociated, getTokenBalance]);

  // Handle KESy token association
  const handleAssociateKesy = async () => {
    setAssociating(true);
    try {
      const result = await associateToken(KESY_TOKEN.tokenId);
      if (result.success) {
        setIsKesyAssociated(true);
        setKesyBalance(0);
      } else {
        setError(result.error || 'Failed to associate token');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to associate token');
    } finally {
      setAssociating(false);
    }
  };

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

        // Fetch real HBAR price from CoinGecko
        let hbarPriceUsd = 0.05; // Default fallback
        let kesUsdRate = 0.0077; // Default KES to USD rate (approx 1 USD = 130 KES)
        try {
          const priceResponse = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd'
          );
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            hbarPriceUsd = priceData['hedera-hashgraph']?.usd || 0.05;
          }
        } catch (priceErr) {
          console.warn('Failed to fetch HBAR price, using fallback:', priceErr);
        }

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
        let totalUsd = 0;

        // Add HBAR with real price
        if (hbarBalance > 0) {
          const hbarValueUsd = hbarBalance * hbarPriceUsd;
          assetsList.push({
            name: 'HBAR',
            symbol: 'HBAR',
            balance: hbarBalance,
            value: hbarValueUsd,
            icon: '/icons/hbar.png',
          });
          totalUsd += hbarValueUsd;
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

              // Calculate value based on token type
              let tokenValueUsd = 0;
              let tokenIcon = '/icons/token.png';

              // Check if this is KESy token (KES stablecoin - 1:1 with KES)
              if (token.token_id === KESY_TOKEN.tokenId ||
                tokenInfo.symbol?.toLowerCase().includes('kesy') ||
                tokenInfo.symbol?.toLowerCase().includes('kes')) {
                // KESy is 1:1 with KES, convert to USD
                tokenValueUsd = balance * kesUsdRate;
                tokenIcon = KESY_TOKEN.icon;
              } else {
                // For other tokens, use 1:1 as placeholder (you'd need price feeds)
                tokenValueUsd = balance * hbarPriceUsd; // Rough estimate
              }

              assetsList.push({
                name: tokenInfo.name || token.token_id,
                symbol: tokenInfo.symbol || 'TOKEN',
                balance: balance,
                value: tokenValueUsd,
                icon: tokenIcon,
                tokenId: token.token_id,
              });
              totalUsd += tokenValueUsd;
            } catch (err) {
              console.error(`Failed to fetch token info for ${token.token_id}:`, err);
            }
          }
        }

        setAssets(assetsList);
        setTotalBalance(totalUsd);
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

        {/* Wallet Connection Status */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {isConnected ? (
                <span className="text-green-400">
                  Wallet Connected {account?.accountId && `(${account.accountId})`}
                </span>
              ) : (
                <span className="text-red-400">Wallet Not Connected</span>
              )}
            </span>
          </div>
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={walletLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isConnected
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-primary hover:bg-primary/90 text-white'
              } ${walletLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {walletLoading ? 'Connecting...' : isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
        </div>
        {walletError && (
          <div className="mb-4 text-red-400 text-sm">
            {walletError}
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

      {/* KESy Stablecoin Balance Card */}
      {isConnected && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center overflow-hidden">
                <Image src={KESY_TOKEN.icon} alt={KESY_TOKEN.symbol} width={48} height={48} className="object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{KESY_TOKEN.name}</h3>
                <p className="text-sm text-light-200">Token ID: {KESY_TOKEN.tokenId}</p>
              </div>
            </div>

            <div className="text-right">
              {kesyLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                  <span className="text-light-200">Loading...</span>
                </div>
              ) : isKesyAssociated === false ? (
                <button
                  onClick={handleAssociateKesy}
                  disabled={associating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {associating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Associating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                      </svg>
                      <span>Associate Token</span>
                    </>
                  )}
                </button>
              ) : isKesyAssociated === true ? (
                <div>
                  <p className="text-3xl font-bold text-white">
                    {hideBalance ? '••••••' : `${kesyBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                  </p>
                  <p className="text-sm text-green-400">{KESY_TOKEN.symbol}</p>
                </div>
              ) : null}
            </div>
          </div>

          {isKesyAssociated === false && (
            <p className="text-sm text-light-200 mt-4">
              💡 Associate your wallet with {KESY_TOKEN.symbol} to receive deposits. This is a one-time transaction.
            </p>
          )}

          {isKesyAssociated === true && (
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Deposit KES
              </button>
              <span className="text-sm text-light-200">
                Deposit Kenyan Shillings to receive {KESY_TOKEN.symbol} tokens
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {walletActions.map((action) => (
            <button
              key={action.id}
              className="bg-dark-100 border border-border rounded-lg p-4 hover:border-primary transition-colors flex flex-col items-center"
              onClick={() => {
                switch (action.id) {
                  case 'deposit':
                    setShowDepositModal(true);
                    break;
                  case 'withdraw':
                    // TODO: setShowWithdrawModal(true);
                    break;
                  case 'transfer':
                    // TODO: setShowTransferModal(true);
                    break;
                  case 'convert':
                    // TODO: setShowConvertModal(true);
                    break;
                  case 'gift':
                    // TODO: setShowGiftModal(true);
                    break;
                }
              }}
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
                onClick={() => setShowDepositModal(true)}>
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
                      <Image src='/icons/trade.png' alt='trade' width={24} height={24} />
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
      {/* Deposit Modal */}
      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
    </div>
  );
};

export default WalletPage;