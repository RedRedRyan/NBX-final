"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const ReferralsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [copied, setCopied] = useState(false);
  
  // Mock referral data
  const referralCode = "NBX" + (user?.email?.substring(0, 5) || "USER").toUpperCase();
  const referralLink = `https://nbx.com/signup?ref=${referralCode}`;
  const referralStats = {
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    availableEarnings: 0
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

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
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-light-100">Earn rewards by referring friends and family to NBX</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Referral code and stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Referral link */}
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
            <p className="text-light-100 mb-4">Share this link with friends and earn up to 40% commission on their trading fees</p>
            
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-dark-200 border border-border rounded-l-md py-2 px-3"
              />
              <button
                onClick={copyToClipboard}
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#1DA1F2] text-white py-2 rounded-md hover:bg-[#1DA1F2]/90">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Share on Twitter
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#4267B2] text-white py-2 rounded-md hover:bg-[#4267B2]/90">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Share on Facebook
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 rounded-md hover:bg-[#25D366]/90">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
          
          {/* Referral stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-100 border border-border rounded-lg p-4 text-center">
              <p className="text-light-200 text-sm mb-1">Total Referrals</p>
              <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
            </div>
            <div className="bg-dark-100 border border-border rounded-lg p-4 text-center">
              <p className="text-light-200 text-sm mb-1">Active Referrals</p>
              <p className="text-2xl font-bold">{referralStats.activeReferrals}</p>
            </div>
            <div className="bg-dark-100 border border-border rounded-lg p-4 text-center">
              <p className="text-light-200 text-sm mb-1">Pending Referrals</p>
              <p className="text-2xl font-bold">{referralStats.pendingReferrals}</p>
            </div>
          </div>
          
          {/* Earnings */}
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Earnings</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-200 rounded-lg p-4">
                <p className="text-light-200 text-sm mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">${referralStats.totalEarnings.toFixed(2)} USD</p>
              </div>
              <div className="bg-dark-200 rounded-lg p-4">
                <p className="text-light-200 text-sm mb-1">Available to Withdraw</p>
                <p className="text-2xl font-bold">${referralStats.availableEarnings.toFixed(2)} USD</p>
              </div>
            </div>
            
            <button
              disabled={referralStats.availableEarnings <= 0}
              className={`w-full py-3 rounded-md font-medium ${
                referralStats.availableEarnings > 0
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-dark-200 text-light-200 cursor-not-allowed'
              }`}
            >
              Withdraw Earnings
            </button>
          </div>
        </div>
        
        {/* Right side - How it works and commission rates */}
        <div className="space-y-6">
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">1</span>
                <div>
                  <h3 className="font-medium">Share Your Link</h3>
                  <p className="text-light-100 text-sm">Send your unique referral link to friends</p>
                </div>
              </li>
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">2</span>
                <div>
                  <h3 className="font-medium">Friends Sign Up</h3>
                  <p className="text-light-100 text-sm">They create an account using your link</p>
                </div>
              </li>
              <li className="flex">
                <span className="bg-primary/20 text-primary font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3">3</span>
                <div>
                  <h3 className="font-medium">Earn Rewards</h3>
                  <p className="text-light-100 text-sm">Get up to 40% of their trading fees</p>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Commission Rates</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-light-100">Standard</span>
                  <span className="text-primary font-bold">20%</span>
                </div>
                <div className="w-full bg-dark-200 h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-light-100">Silver Tier (5+ referrals)</span>
                  <span className="text-primary font-bold">25%</span>
                </div>
                <div className="w-full bg-dark-200 h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-light-100">Gold Tier (15+ referrals)</span>
                  <span className="text-primary font-bold">30%</span>
                </div>
                <div className="w-full bg-dark-200 h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-light-100">Platinum Tier (30+ referrals)</span>
                  <span className="text-primary font-bold">40%</span>
                </div>
                <div className="w-full bg-dark-200 h-2 rounded-full">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;