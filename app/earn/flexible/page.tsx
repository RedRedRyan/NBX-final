"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const FlexibleEarningPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the staking request to an API
    alert(`Staked ${amount} USD for flexible earning`);
    setAmount('');
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  // Calculate estimated earnings based on amount and APY
  const apy = 5; // 5% APY for flexible earning
  const estimatedEarnings = amount ? (parseFloat(amount) * (apy / 100) * (parseInt(duration) / 365)).toFixed(2) : '0.00';

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
        <h1 className="text-2xl font-bold mb-2 text-left">Flexible Earning</h1>
        <p className="text-light-100">Earn interest on your assets with the flexibility to withdraw anytime</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Staking form */}
        <div className="bg-dark-100 border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Stake Assets</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2">
                Amount to Stake
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
                Estimated Duration (Days)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">365 days</option>
              </select>
            </div>
            
            <div className="bg-dark-200 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-light-100">Annual Percentage Yield:</span>
                <span className="text-primary font-bold">5% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-100">Estimated Earnings:</span>
                <span className="text-primary font-bold">${estimatedEarnings} USD</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90"
            >
              Stake Now
            </button>
          </form>
        </div>
        
        {/* Right side - Info and benefits */}
        <div className="space-y-6">
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Flexible Earning Benefits</h2>
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
                <span className="text-light-100">Withdraw your assets at any time without penalties</span>
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
                <span className="text-light-100">Earn up to 5% APY on your assets</span>
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
                <span className="text-light-100">Interest accrues daily and is paid weekly</span>
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
                <span className="text-light-100">No minimum deposit required</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">1</span>
                <div>
                  <h3 className="font-medium">Deposit Assets</h3>
                  <p className="text-light-100 text-sm">Choose the amount you want to stake</p>
                </div>
              </li>
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">2</span>
                <div>
                  <h3 className="font-medium">Earn Interest</h3>
                  <p className="text-light-100 text-sm">Your assets start earning interest immediately</p>
                </div>
              </li>
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">3</span>
                <div>
                  <h3 className="font-medium">Withdraw Anytime</h3>
                  <p className="text-light-100 text-sm">Access your funds whenever you need them</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexibleEarningPage;