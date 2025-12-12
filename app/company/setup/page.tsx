"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';

const CompanySetupPage = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    ticker: '',
    sector: '',
    description: '',
    marketCap: '',
    totalSupply: '',
    circulatingSupply: '',
    price: '0',
  });

  // Redirect if not a company user
  React.useEffect(() => {
    if (user && user.role !== 'company') {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

      const companyPayload = {
        ...formData,
        useremail: user?.useremail,
      };

      const response = await ApiClient.createCompany(companyPayload, token);
      
      setSuccess('Company profile created successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push(`/company/dashboard/${response._id || response.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create company profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Company Setup</h1>
            <p className="mt-2 text-light-100">Create your company profile on NBX</p>
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
                  Company Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="symbol" className="block text-sm font-medium text-light-100">
                  Token Symbol *
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="text"
                  value={formData.symbol}
                  onChange={handleChange}
                  maxLength={5}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  placeholder="e.g., TECH"
                  required
                />
              </div>

              <div>
                <label htmlFor="ticker" className="block text-sm font-medium text-light-100">
                  Ticker *
                </label>
                <input
                  id="ticker"
                  name="ticker"
                  type="text"
                  value={formData.ticker}
                  onChange={handleChange}
                  maxLength={5}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  placeholder="e.g., TECH"
                  required
                />
              </div>

              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-light-100">
                  Sector *
                </label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a sector</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Energy">Energy</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="totalSupply" className="block text-sm font-medium text-light-100">
                  Total Supply *
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
                <label htmlFor="circulatingSupply" className="block text-sm font-medium text-light-100">
                  Circulating Supply *
                </label>
                <input
                  id="circulatingSupply"
                  name="circulatingSupply"
                  type="number"
                  value={formData.circulatingSupply}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 850000"
                  required
                />
              </div>

              <div>
                <label htmlFor="marketCap" className="block text-sm font-medium text-light-100">
                  Market Cap *
                </label>
                <input
                  id="marketCap"
                  name="marketCap"
                  type="text"
                  value={formData.marketCap}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., $1.2M"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-light-100">
                  Current Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 12.45"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-light-100">
                Company Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your company..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Creating Profile...' : 'Create Company Profile'}
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

export default CompanySetupPage;
