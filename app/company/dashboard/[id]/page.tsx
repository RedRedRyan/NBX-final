"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useCompany } from '@/lib/context/CompanyContext';
import { ApiClient } from '@/lib/api/client';
import Link from 'next/link';

// Security type for both equities and bonds
interface Security {
  _id: string;
  name: string;
  symbol: string;
  assetAddress: string;
  totalSupply: string;
  status: string;
  type: 'equity' | 'bond';
  currency?: string;
  couponRate?: number;
  maturityDate?: number;
}

const CompanyDashboardPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const { currentCompany, isLoading, error, fetchCompanyById } = useCompany();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [securities, setSecurities] = useState<Security[]>([]);
  const [securitiesLoading, setSecuritiesLoading] = useState(false);

  // Fetch company data on mount
  useEffect(() => {
    if (user && user.role !== 'company') {
      router.push('/');
      return;
    }

    if (companyId) {
      fetchCompanyById(companyId);
    }
  }, [companyId, user, router]);

  // Fetch securities when tokenization tab is active
  useEffect(() => {
    const fetchSecurities = async () => {
      if (activeTab !== 'tokenization' || !companyId) return;

      setSecuritiesLoading(true);
      try {
        const [equitiesRes, bondsRes] = await Promise.all([
          ApiClient.getEquities(companyId, token || undefined),
          ApiClient.getBonds(companyId, token || undefined),
        ]);

        const equities: Security[] = (equitiesRes?.data || []).map((e: any) => ({
          ...e,
          type: 'equity' as const,
        }));

        const bonds: Security[] = (bondsRes?.data || []).map((b: any) => ({
          ...b,
          type: 'bond' as const,
        }));

        setSecurities([...equities, ...bonds]);
      } catch (err) {
        console.error('Failed to fetch securities:', err);
      } finally {
        setSecuritiesLoading(false);
      }
    };

    fetchSecurities();
  }, [activeTab, companyId, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !currentCompany) {
    return (
      <div className="min-h-screen bg-dark-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error || 'Company not found'}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-dark-200 border border-border rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {currentCompany.symbol}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{currentCompany.name}</h1>
                <p className="text-light-100 mt-1">{currentCompany.sector} • {currentCompany.symbol}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Link href={`/company/dashboard/${companyId}/bond/new`}>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  Issue Bond
                </button>
              </Link>
              <Link href={`/company/dashboard/${companyId}/equity/new`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  Issue Equity
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border bg-dark-200 rounded-t-lg">
          <div className="flex gap-8 px-6">
            {['overview', 'tokenization', 'documents', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-light-100 hover:text-white'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-dark-200 border border-border rounded-lg p-6">
                <p className="text-sm text-light-100 mb-2">Market Cap</p>
                <p className="text-2xl font-bold text-white">{currentCompany.marketCap}</p>
              </div>

              <div className="bg-dark-200 border border-border rounded-lg p-6">
                <p className="text-sm text-light-100 mb-2">Token Price</p>
                <p className="text-2xl font-bold text-white">
                  ${currentCompany.price.toFixed(2)}
                </p>
              </div>

              <div className="bg-dark-200 border border-border rounded-lg p-6">
                <p className="text-sm text-light-100 mb-2">Total Supply</p>
                <p className="text-2xl font-bold text-white">
                  {currentCompany.totalSupply}
                </p>
              </div>

              <div className="bg-dark-200 border border-border rounded-lg p-6">
                <p className="text-sm text-light-100 mb-2">Circulating</p>
                <p className="text-2xl font-bold text-white">
                  {currentCompany.circulatingSupply}
                </p>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Company Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-light-100 mb-1">Description</p>
                  <p className="text-white">{currentCompany.description}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100 mb-1">Sector</p>
                  <p className="text-white">{currentCompany.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100 mb-1">Ticker Symbol</p>
                  <p className="text-white font-mono">{currentCompany.ticker}</p>
                </div>
                <div>
                  <p className="text-sm text-light-100 mb-1">Tokenization Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${currentCompany.isTokenized
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {currentCompany.isTokenized ? 'Tokenized' : 'Not Tokenized'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <p className="text-light-100">No recent activity</p>
            </div>
          </div>
        )}

        {/* Tokenization Tab */}
        {activeTab === 'tokenization' && (
          <div className="space-y-6">
            {/* Issue New Securities */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Issue New Securities</h3>
              <p className="text-light-100 mb-6">
                Create new security tokens on the Hedera network
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <Link href={`/company/dashboard/${companyId}/bond/new`}>
                  <div className="bg-dark-100 border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-colors h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Issue Bond</h4>
                    <p className="text-sm text-light-100">
                      Issue fixed-income security tokens with defined maturity and coupon rates
                    </p>
                  </div>
                </Link>

                <Link href={`/company/dashboard/${companyId}/equity/new`}>
                  <div className="bg-dark-100 border border-border rounded-lg p-6 cursor-pointer hover:border-green-500 transition-colors h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Issue Equity</h4>
                    <p className="text-sm text-light-100">
                      Issue equity security tokens representing ownership shares in your company
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Issued Securities List */}
            <div className="bg-dark-200 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Issued Securities</h3>
              <p className="text-light-100 mb-6">
                View and manage your issued security tokens
              </p>

              {securitiesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : securities.length === 0 ? (
                <div className="text-center py-8 text-light-200">
                  <svg className="w-12 h-12 mx-auto mb-4 text-light-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No securities issued yet</p>
                  <p className="text-sm mt-1">Use the buttons above to issue your first security token</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securities.map((security) => (
                    <Link
                      key={security._id}
                      href={`/company/dashboard/${companyId}/security/${security.type}/${security._id}`}
                    >
                      <div className="flex items-center justify-between p-4 bg-dark-100 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${security.type === 'equity'
                            ? 'bg-green-500/10'
                            : 'bg-primary/10'
                            }`}>
                            {security.type === 'equity' ? (
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium group-hover:text-primary transition-colors">
                                {security.name}
                              </p>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${security.type === 'equity'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-primary/10 text-primary'
                                }`}>
                                {security.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-light-200">
                              {security.symbol} •{' '}
                              <a
                                href={`https://hashscan.io/testnet/contract/${security.assetAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary hover:underline transition-colors"
                              >
                                {security.assetAddress}
                              </a>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white font-mono">{Number(security.totalSupply).toLocaleString()}</p>
                            <p className="text-xs text-light-200">Total Supply</p>
                          </div>
                          <svg className="w-5 h-5 text-light-200 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-dark-200 border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Company Documents</h3>
              <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm">
                Upload Document
              </button>
            </div>

            {currentCompany.documents.length === 0 ? (
              <p className="text-light-100">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {currentCompany.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-dark-100 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">{doc.name}</p>
                        <p className="text-sm text-light-200">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`http://localhost:3001/api${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-light-100 hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <a
                        href={`http://localhost:3001/api${doc.url}/download`}
                        className="p-2 text-light-100 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-dark-200 border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Company Settings</h3>
            <p className="text-light-100">Company settings and preferences</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboardPage;