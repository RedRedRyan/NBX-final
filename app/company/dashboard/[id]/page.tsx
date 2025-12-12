"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';
import Link from 'next/link';

interface Company {
  _id: string;
  name: string;
  symbol: string;
  ticker: string;
  sector: string;
  description: string;
  totalSupply: string;
  circulatingSupply: string;
  marketCap: string;
  price: number;
  status?: string;
}

const CompanyDashboardPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user && user.role !== 'company') {
      router.push('/');
      return;
    }

    if (!token || !companyId) return;

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const response = await ApiClient.getCompany(companyId, token);
        setCompany(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load company');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, token, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="text-light-100">Loading...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-dark-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error || 'Company not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            <p className="mt-2 text-light-100">Company Dashboard</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Link href={`/company/dashboard/${companyId}/bond/new`}>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Create Bond
              </button>
            </Link>
            <Link href={`/company/dashboard/${companyId}/equity/new`}>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Create Equity
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            {['dashboard', 'tokenization', 'shareholders', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-light-100 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Company Status Card */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Company Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-light-100">Company Name</p>
                  <p className="text-white font-medium">{company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100">Token Symbol</p>
                  <p className="text-white font-medium">{company.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100">Status</p>
                  <p className="text-green-500 font-medium">Active</p>
                </div>
              </div>
            </div>

            {/* Market Data Card */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Market Data</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-light-100">Current Price</p>
                  <p className="text-2xl font-bold text-white">${company.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100">Market Cap</p>
                  <p className="text-white font-medium">{company.marketCap}</p>
                </div>
              </div>
            </div>

            {/* Supply Card */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Token Supply</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-light-100">Total Supply</p>
                  <p className="text-white font-medium">{company.totalSupply}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100">Circulating</p>
                  <p className="text-white font-medium">{company.circulatingSupply}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tokenization Tab */}
        {activeTab === 'tokenization' && (
          <div className="bg-dark-200 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Token Management</h3>
            <p className="text-light-100 mb-6">Manage your security tokens (Bonds and Equities)</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Link href={`/company/dashboard/${companyId}/bond/new`}>
                <div className="bg-dark-100 border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                  <h4 className="text-white font-semibold mb-2">Create Bond</h4>
                  <p className="text-sm text-light-100">Issue fixed-income security tokens</p>
                </div>
              </Link>
              
              <Link href={`/company/dashboard/${companyId}/equity/new`}>
                <div className="bg-dark-100 border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
                  <h4 className="text-white font-semibold mb-2">Create Equity</h4>
                  <p className="text-sm text-light-100">Issue equity security tokens</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Shareholders Tab */}
        {activeTab === 'shareholders' && (
          <div className="bg-dark-200 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Shareholder Management</h3>
            <p className="text-light-100">Shareholder information will appear here</p>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-dark-200 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Company Documents</h3>
            <p className="text-light-100">Upload and manage company documents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
