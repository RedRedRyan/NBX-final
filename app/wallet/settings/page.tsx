"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const WalletSettingsPage = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const email = user?.email ?? user?.useremail ?? '';
  const accountTypeLabel = user?.accountType === 'individual' ? 'Individual' : 'Institution';
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  
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
      <button 
        onClick={() => router.push('/wallet')}
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
        Back to Wallet
      </button>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Wallet Settings</h1>
        <p className="text-light-100">Manage your wallet preferences and security</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Settings options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-light-100 mb-2">
                  Account Type
                </label>
                <input
                  type="text"
                  value={accountTypeLabel}
                  readOnly
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-light-100 mb-2">
                  Verification Status
                </label>
                <div className="flex items-center">
                  <span className="bg-yellow-500/20 text-yellow-500 text-sm px-3 py-1 rounded-full">
                    Pending Verification
                  </span>
                  <button className="text-primary hover:text-primary/80 ml-4 text-sm">
                    Complete {user.accountType === 'individual' ? 'KYC' : 'KYB'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preferences */}
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-100 mb-2">
                  Default Currency
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-light-200 text-sm">Receive alerts for transactions and price changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Security */}
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Security</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-light-200 text-sm">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div>
                <button className="text-primary hover:text-primary/80 text-sm">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Additional options */}
        <div className="space-y-6">
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Session</h2>
            <p className="text-light-100 text-sm mb-4">
              You are currently logged in from this device. For security reasons, remember to log out when using a shared device.
            </p>
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
          
          <div className="bg-dark-100 border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Support</h2>
            <div className="space-y-3">
              <button className="w-full bg-dark-200 text-light-100 py-2 rounded-md hover:bg-dark-200/80 flex items-center justify-center">
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
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Contact Support
              </button>
              
              <button className="w-full bg-dark-200 text-light-100 py-2 rounded-md hover:bg-dark-200/80 flex items-center justify-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Documentation
              </button>
              
              <button className="w-full bg-dark-200 text-light-100 py-2 rounded-md hover:bg-dark-200/80 flex items-center justify-center">
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettingsPage;