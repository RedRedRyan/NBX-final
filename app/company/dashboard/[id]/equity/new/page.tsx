"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';
import { createEquityToken } from '@/lib/hedera/atsClient';

const CreateEquityPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
    dividendYield: '',
    votingRights: false,
    regulationType: 'REG_D',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);

      const equityPayload = {
        name: formData.name,
        symbol: formData.symbol,
        totalSupply: formData.totalSupply,
        dividendYield: formData.dividendYield ? parseInt(formData.dividendYield) : 0,
        votingRights: formData.votingRights,
        regulationType: formData.regulationType,
        companyId,
      };

      const response = await ApiClient.createEquity(companyId, equityPayload, token);
      
      setSuccess('Equity created successfully!');
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push(`/company/dashboard/${companyId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create equity');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create Equity</h1>
            <p className="mt-2 text-light-100">Issue equity security tokens (shares)</p>
          </div>

          {error && (
            <div className="mb-6 bg-destructive/10 text-destructive p-4 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 text-green-500 p-4 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-100">
                  Equity Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Common Stock"
                  required
                />
              </div>

              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-light-100">
                  Symbol *
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="text"
                  value={formData.symbol}
                  onChange={handleChange}
                  maxLength={5}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  placeholder="e.g., STOCK"
                  required
                />
              </div>

              <div>
                <label htmlFor="totalSupply" className="block text-sm font-medium text-light-100">
                  Total Supply (Shares) *
                </label>
                <input
                  id="totalSupply"
                  name="totalSupply"
                  type="number"
                  value={formData.totalSupply}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 1000000"
                  required
                />
              </div>

              <div>
                <label htmlFor="dividendYield" className="block text-sm font-medium text-light-100">
                  Dividend Yield (%)
                </label>
                <input
                  id="dividendYield"
                  name="dividendYield"
                  type="number"
                  step="0.01"
                  value={formData.dividendYield}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 5.5"
                />
              </div>

              <div>
                <label htmlFor="regulationType" className="block text-sm font-medium text-light-100">
                  Regulation Type *
                </label>
                <select
                  id="regulationType"
                  name="regulationType"
                  value={formData.regulationType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="REG_D">Reg D</option>
                  <option value="REG_S">Reg S</option>
                  <option value="REG_CF">Reg CF</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <input
                  id="votingRights"
                  name="votingRights"
                  type="checkbox"
                  checked={formData.votingRights}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label htmlFor="votingRights" className="ml-2 block text-sm font-medium text-light-100">
                  Voting Rights
                </label>
              </div>
            </div>

            <div className="bg-dark-100 border border-border rounded-lg p-4">
              <p className="text-sm text-light-100">
                <strong>Note:</strong> Equity tokens represent ownership shares in your company. 
                Shareholders will have rights to dividends and potentially voting rights on company decisions.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Creating Equity...' : 'Create Equity'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-2 px-4 bg-dark-100 text-white border border-border rounded-md hover:bg-dark-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEquityPage;
