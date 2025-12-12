"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';

const CreateBondPage = () => {
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
    faceValue: '',
    maturityDate: '',
    couponRate: '',
    issuer: '',
    regulationType: 'REG_S',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      // Convert maturityDate to Unix timestamp
      const maturityDate = Math.floor(new Date(formData.maturityDate).getTime() / 1000);

      const bondPayload = {
        name: formData.name,
        symbol: formData.symbol,
        totalSupply: formData.totalSupply,
        faceValue: formData.faceValue,
        maturityDate,
        couponRate: parseInt(formData.couponRate),
        issuer: formData.issuer || user?.useremail,
        regulationType: formData.regulationType,
        companyId,
      };

      const response = await ApiClient.createBond(companyId, bondPayload, token);
      
      setSuccess('Bond created successfully!');
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push(`/company/dashboard/${companyId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create bond');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-200 rounded-lg border border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create Bond</h1>
            <p className="mt-2 text-light-100">Issue a fixed-income security token</p>
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
                  Bond Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Senior Bond 2025"
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
                  placeholder="e.g., BOND"
                  required
                />
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
                <label htmlFor="faceValue" className="block text-sm font-medium text-light-100">
                  Face Value *
                </label>
                <input
                  id="faceValue"
                  name="faceValue"
                  type="number"
                  step="0.01"
                  value={formData.faceValue}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 1000"
                  required
                />
              </div>

              <div>
                <label htmlFor="maturityDate" className="block text-sm font-medium text-light-100">
                  Maturity Date *
                </label>
                <input
                  id="maturityDate"
                  name="maturityDate"
                  type="date"
                  value={formData.maturityDate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label htmlFor="couponRate" className="block text-sm font-medium text-light-100">
                  Coupon Rate (basis points) *
                </label>
                <input
                  id="couponRate"
                  name="couponRate"
                  type="number"
                  value={formData.couponRate}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 450 (4.50%)"
                  required
                />
              </div>

              <div>
                <label htmlFor="issuer" className="block text-sm font-medium text-light-100">
                  Issuer
                </label>
                <input
                  id="issuer"
                  name="issuer"
                  type="text"
                  value={formData.issuer}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Leave blank to use company email"
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
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Creating Bond...' : 'Create Bond'}
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

export default CreateBondPage;
