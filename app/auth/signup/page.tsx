"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/lib/context/AuthContext';
import ConnectButton from '@/components/connectButton';

const SignupPage = () => {
  const router = useRouter();
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('investor');
  const [accountId, setAccountId] = useState(''); // Store wallet account ID
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Callback to receive account ID from ConnectButton
  const handleAccountConnected = (connectedAccountId: string) => {
    setAccountId(connectedAccountId);
    if (connectedAccountId) {
      setError(''); // Clear any wallet-related errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate wallet connection
    if (!accountId) {
      setError('Please connect your Hedera wallet before creating an account');
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password, role, accountId); // Pass the connected account ID

      // Redirect based on user role
      if (role === 'company') {
        router.push('/company/setup');
      } else if (role === 'auditor') {
        router.push('/auditor/dashboard');
      } else {
        router.push('/wallet');
      }
    } catch (error: any) {
      setError(error?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    investor: 'Browse and invest in tokenized SME shares',
    company: 'Issue security tokens and manage shareholders',
    auditor: 'Access and verify financial disclosures',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-dark-100 rounded-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-light-100">Join NBX to start trading equities and bonds</p>
        </div>

        {/* User Role Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-light-100">Account Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['investor', 'company', 'auditor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-3 px-2 rounded-md text-xs font-medium transition-colors ${role === r
                    ? 'bg-primary text-white'
                    : 'bg-dark-200 text-light-100 hover:bg-dark-300'
                  }`}
              >
                <div className="capitalize">{r}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-light-100">{roleDescriptions[role]}</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-100">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-light-100">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-100">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Wallet Connection Component */}
          <ConnectButton onAccountConnected={handleAccountConnected} />

          <div>
            <button
              type="submit"
              disabled={isLoading || !accountId}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-light-100">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;