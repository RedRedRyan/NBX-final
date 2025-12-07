"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

const SignupPage = () => {
  const router = useRouter();
  const { signup } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'institution'>('individual');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    
    try {
      setIsLoading(true);
      await signup(email, password, accountType);
      router.push('/markets'); // Redirect to markets page after signup
    } catch (error) {
      setError('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-dark-100 rounded-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-light-100">Join NBX to start trading equities and bonds</p>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-md ${
              accountType === 'individual' 
                ? 'bg-primary text-white' 
                : 'bg-dark-200 text-light-100'
            }`}
            onClick={() => setAccountType('individual')}
          >
            Individual
            <img src='/icons/individual.png' alt='Individual Icon' className='inline-block w-5 h-5 -mt-1 mx-auto' />
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-md ${
              accountType === 'institution' 
                ? 'bg-primary text-white' 
                : 'bg-dark-200 text-light-100'
            }`}
            onClick={() => setAccountType('institution')}
          >
            Institution
            <img src='/icons/group.png' alt='Institution Icon' className='inline-block w-5 h-5 -mt-1 mx-auto' />
          </button>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md">
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
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md"
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
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md"
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
              className="mt-1 block w-full px-3 py-2 bg-dark-200 border border-border rounded-md"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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