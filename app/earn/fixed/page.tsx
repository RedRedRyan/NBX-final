"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const FixedEarningPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the staking request to an API
    alert(`Locked ${amount} USD for ${lockPeriod} days in fixed earning`);
    setAmount('');
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  // Calculate APY based on lock period
  const getAPY = (period: string) => {
    switch (period) {
      case '30': return 6;
      case '60': return 7;
      case '90': return 8;
      case '180': return 10;
      case '365': return 12;
      default: return 6;
    }
  };
  
  const apy = getAPY(lockPeriod);
  const estimatedEarnings = amount ? (parseFloat(amount) * (apy / 100) * (parseInt(lockPeriod) / 365)).toFixed(2) : '0.00';

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => router.push('/earn')}
        className="flex items-center text-light-100 hover:text-primary mb-6"
      >
        <svg
          className="h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Earn
      </button>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Fixed Earning</h1>
        <p className="text-light-100">Lock your assets for a fixed period to earn higher interest rates</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Staking form */}
        <div className="bg-dark-100 border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Lock Assets</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2">
                Amount to Lock
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                  required
                />
                <span className="absolute right-3 top-2 text-light-200">
                  USD
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2">
                Lock Period (Days)
              </label>
              <select
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value)}
                className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
              >
                <option value="30">30 days (6% APY)</option>
                <option value="60">60 days (7% APY)</option>
                <option value="90">90 days (8% APY)</option>
                <option value="180">180 days (10% APY)</option>
                <option value="365">365 days (12% APY)</option>
              </select>
            </div>
            
            <div className="bg-dark-200 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-light-100">Annual Percentage Yield:</span>
                <span className="text-primary font-bold">{apy}% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-100">Estimated Earnings:</span>
                <span className="text-primary font-bold">${estimatedEarnings} USD</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-light-100">Unlock Date:</span>
                <span className="text-primary font-bold">
                  {new Date(Date.now() + parseInt(lockPeriod) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 text-sm">
              <p className="text-light-100">
                <span className="text-primary font-bold">Note:</span> Your assets will be locked for the selected period. 
                Early withdrawal will result in a penalty of 50% of earned interest.
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90"
            >
              Lock Now
            </button>
          </form>
        </div>
        
        {/* Right side - Info and benefits */}
        <div className="space-y-6">
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Fixed Earning Benefits</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-light-100">Higher interest rates compared to flexible earning</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-light-100">Earn up to 12% APY on your assets</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-light-100">Interest is guaranteed for the entire lock period</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-light-100">Minimum deposit of $100 USD</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">APY Comparison</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-light-100">30 days lock:</span>
                <span className="text-primary font-bold">6% APY</span>
              </div>
              <div className="w-full bg-dark-200 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-100">60 days lock:</span>
                <span className="text-primary font-bold">7% APY</span>
              </div>
              <div className="w-full bg-dark-200 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: '58%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-100">90 days lock:</span>
                <span className="text-primary font-bold">8% APY</span>
              </div>
              <div className="w-full bg-dark-200 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-100">180 days lock:</span>
                <span className="text-primary font-bold">10% APY</span>
              </div>
              <div className="w-full bg-dark-200 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-100">365 days lock:</span>
                <span className="text-primary font-bold">12% APY</span>
              </div>
              <div className="w-full bg-dark-200 h-2 rounded-full">
                <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedEarningPage;