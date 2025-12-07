"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { walletActions } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';
import Image from "next/image";

const WalletPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [hideBalance, setHideBalance] = useState(false);
  
  // Mock wallet data
  const walletData = {
    totalBalance: 17200.12, // Updated total balance to match the sum of asset values
    assets: [
      { name: 'KESY', symbol: 'KESY', balance: 5000.00, value: 5000.00, icon: '/icons/kesy.png' },
      { name: 'USDT', symbol: 'USDT', balance: 5000.00, value: 5000.00, icon: '/icons/usdt.png' },
      { name: 'HBAR', symbol: 'HBAR', balance: 0.12, value: 4200.00, icon: '/icons/hbar.png' },
      { name: 'USDC', symbol: 'USDC', balance: 3000.00, value: 3000.00, icon: '/icons/usdc.png' },
    ]
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
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
          <h3 className="text-3xl font-bold">
            {hideBalance ? '••••••' : `$${walletData.totalBalance.toLocaleString()}`}
          </h3>
        </div>
        
        {/* KYC/KYB Button */}
        <div className="mb-2">
          <button
            className="bg-primary/10 text-primary text-sm px-4 py-1 rounded-full hover:bg-primary/20"
          >
            {user.accountType === 'individual' ? 'Complete KYC' : 'Complete KYB'}
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
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-dark-200 font-medium">
            <div className="col-span-5">Asset</div>
            <div className="col-span-3 text-right">Balance</div>
            <div className="col-span-3 text-right">Value</div>
            <div className="col-span-1 text-right"></div>
          </div>
          
          {/* Table body */}
          {walletData.assets.map((asset) => (
            <div key={asset.symbol} className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-dark-200/30">
              {/* Asset name and symbol */}
              <div className="col-span-5 flex items-center">
                <div className=" bg-dark-200 rounded-full flex items-center justify-center mr-3">
                  <Image src={asset.icon} alt={asset.symbol} width={24} height={24} />
                </div>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-light-200">{asset.symbol}</div>
                </div>
              </div>
              
              {/* Balance */}
              <div className="col-span-3 text-right self-center">
                {hideBalance ? '••••••' : asset.balance.toLocaleString()} {asset.symbol}
              </div>
              
              {/* Value */}
              <div className="col-span-3 text-right self-center">
                {hideBalance ? '••••••' : `$${asset.value.toLocaleString()}`}
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
        </div>
      </div>
    </div>
  );
};

export default WalletPage;