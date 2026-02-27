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
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountConnected = (connectedAccountId: string) => {
    setAccountId(connectedAccountId);
    if (connectedAccountId) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    if (!accountId) {
      setError('Please connect your Hedera wallet before creating an account');
      return;
    }

    try {
      setIsLoading(true);
      await signup(email, password, role, accountId);

      if (role === 'company') {
        router.push('/company/setup');
      } else if (role === 'auditor') {
        router.push('/auditor/dashboard');
      } else {
        router.push('/wallet');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
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
    <div className="min-h-screen bg-[#050505] text-[#f1f1f1]">
      <div className="border-b border-[#2e2e2e] bg-gradient-to-r from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9f9f9f]">Account Application</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#fb4f1f]">Create Your NBX Account</h1>
          <p className="mt-2 text-sm text-[#b7b7b7]">
            Personal information and wallet setup for access to tokenized assets.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#343434] bg-[#0d0d0d] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fb4f1f] text-xs font-bold text-black">
            1
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f5f5f5]">Personal Information</p>
            <p className="text-xs text-[#9d9d9d]">Single-step signup form</p>
          </div>
        </div>

        <section className="rounded-2xl border border-[#313131] bg-[#0d0d0d]">
          <div className="border-b border-[#282828] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#fb4f1f]">
              Application Details
            </h2>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-6 sm:py-7">
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b3b3b3]">
                Account Type
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(['investor', 'company', 'auditor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium capitalize transition ${
                      role === r
                        ? 'border-[#fb4f1f] bg-[#1a120f] text-[#fb4f1f]'
                        : 'border-[#383838] bg-[#101010] text-[#d4d4d4] hover:border-[#fb4f1f]/60 hover:text-[#fb4f1f]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#9e9e9e]">{roleDescriptions[role]}</p>
            </div>

            {error && (
              <div className="rounded-lg border border-[#6a1d0f] bg-[#2a1410] p-3 text-sm text-[#ffb4a0]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b3b3b3]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-[#373737] bg-[#111111] px-3 py-2.5 text-sm text-white placeholder-[#737373] focus:border-[#fb4f1f] focus:outline-none focus:ring-2 focus:ring-[#fb4f1f]/30"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b3b3b3]"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-[#373737] bg-[#111111] px-3 py-2.5 text-sm text-white placeholder-[#737373] focus:border-[#fb4f1f] focus:outline-none focus:ring-2 focus:ring-[#fb4f1f]/30"
                    placeholder="********"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#b3b3b3]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-[#373737] bg-[#111111] px-3 py-2.5 text-sm text-white placeholder-[#737373] focus:border-[#fb4f1f] focus:outline-none focus:ring-2 focus:ring-[#fb4f1f]/30"
                    placeholder="********"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#2f2f2f] bg-[#101010] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#b3b3b3]">
                  Wallet Connection
                </p>
                <ConnectButton onAccountConnected={handleAccountConnected} />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#8f8f8f]">
                  By continuing, you confirm your details are accurate and you agree to NBX terms.
                </p>
                <button
                  type="submit"
                  disabled={isLoading || !accountId}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#fb4f1f] bg-[#fb4f1f] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#ff6438] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="pt-1 text-sm text-[#b9b9b9]">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-[#fb4f1f] hover:text-[#ff6f47]">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignupPage;
