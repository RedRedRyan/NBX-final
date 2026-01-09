"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { companies, marketFilters } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';

// Security interface for IPO listings
interface Security {
  id: string;
  type: 'equity' | 'bond';
  name: string;
  symbol: string;
  isin?: string;
  assetAddress: string;
  totalSupply: string;
  nominalValue: string;
  currency: string;
  dividendYield?: number;
  couponRate?: number;
  maturityDate?: string;
  status: string;
  tokenizedAt: string;
  company: {
    id: string;
    name: string;
    ticker: string;
    symbol: string;
    sector: string;
    description: string;
    marketCap: string;
    documents: Array<{
      name: string;
      type: string;
      url: string;
    }>;
    team: Array<{
      name: string;
      role: string;
    }>;
    highlights: string[];
  } | null;
}

const MarketsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const email = user?.email ?? user?.useremail ?? '';
  const emailInitial = email ? email.charAt(0).toUpperCase() : 'U';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  // IPO/Premarket state
  const [securities, setSecurities] = useState<Security[]>([]);
  const [securitiesLoading, setSecuritiesLoading] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState<Security | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Fetch securities when premarket tab is active
  useEffect(() => {
    const fetchSecurities = async () => {
      if (activeFilter !== 'premarket') return;

      setSecuritiesLoading(true);
      try {
        const response = await ApiClient.getAllSecurities('all', 'active');
        if (response.success) {
          setSecurities(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch securities:', error);
      } finally {
        setSecuritiesLoading(false);
      }
    };

    fetchSecurities();
  }, [activeFilter]);

  // Filter companies based on search term and active filter
  useEffect(() => {
    if (activeFilter === 'premarket') return; // Skip company filtering for premarket

    let result = companies;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(company =>
        company.name.toLowerCase().includes(term) ||
        company.symbol.toLowerCase().includes(term) ||
        company.sector.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'hot':
          result = result.filter(company => company.isHot);
          break;
        case 'gainers':
          result = result.filter(company => company.change24h > 0);
          break;
        case 'losers':
          result = result.filter(company => company.change24h < 0);
          break;
        case 'new':
          result = result.filter(company => company.isNew);
          break;
      }
    }

    setFilteredCompanies(result);
  }, [searchTerm, activeFilter]);

  const handleViewDetails = (security: Security) => {
    setSelectedSecurity(security);
    setShowDetailModal(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with search and profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {activeFilter === 'premarket' ? 'IPO & New Offerings' : 'Markets'}
          </h1>
          {activeFilter === 'premarket' && (
            <p className="text-light-200 text-sm mt-1">
              Discover and invest in newly tokenized securities
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder={activeFilter === 'premarket' ? "Search IPOs..." : "Search markets..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-200 border border-border rounded-md py-2 px-4 pl-10 w-full md:w-64"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-light-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Profile icon */}
          <div className="hidden md:flex w-10 h-10 bg-dark-200 rounded-full items-center justify-center cursor-pointer flex-shrink-0">
            <span className="text-sm font-medium">
              {emailInitial}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {marketFilters.map((filter) => (
          <button
            key={filter.id}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${activeFilter === filter.id
              ? filter.id === 'premarket'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                : 'bg-primary text-white'
              : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
              }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.id === 'premarket' ? '🚀 IPO / Premarket' : filter.label}
          </button>
        ))}
      </div>

      {/* Premarket/IPO View */}
      {activeFilter === 'premarket' ? (
        <div>
          {securitiesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : securities.length === 0 ? (
            <div className="bg-dark-100 rounded-lg border border-border p-16 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium mb-2">No IPOs Available</h3>
              <p className="text-light-200">
                There are currently no securities available for investment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securities.map((security) => (
                <div
                  key={security.id}
                  className="bg-dark-100 rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
                >
                  {/* Security Header */}
                  <div className={`p-4 ${security.type === 'equity' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${security.type === 'equity' ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>
                          {security.type === 'equity' ? 'EQUITY' : 'BOND'}
                        </span>
                        <h3 className="text-lg font-bold mt-2">{security.name}</h3>
                        <p className="text-sm text-light-200">{security.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-light-200">Value</p>
                        <p className="font-bold">{security.nominalValue} {security.currency}</p>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  {security.company && (
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{security.company.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{security.company.name}</p>
                          <p className="text-xs text-light-200">{security.company.sector}</p>
                        </div>
                      </div>
                      <p className="text-sm text-light-200 line-clamp-2">
                        {security.company.description}
                      </p>
                    </div>
                  )}

                  {/* Security Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-light-200">Total Supply</span>
                      <span>{parseInt(security.totalSupply).toLocaleString()}</span>
                    </div>
                    {security.type === 'equity' && security.dividendYield !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-light-200">Dividend Yield</span>
                        <span className="text-green-400">{security.dividendYield}%</span>
                      </div>
                    )}
                    {security.type === 'bond' && security.couponRate !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-light-200">Coupon Rate</span>
                        <span className="text-green-400">{security.couponRate}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-light-200">Market Cap</span>
                      <span>{security.company?.marketCap || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => handleViewDetails(security)}
                      className="flex-1 py-2 px-4 bg-dark-200 hover:bg-dark-200/80 text-white rounded-md text-sm transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/trade?symbol=${security.symbol}&type=${security.type}`)}
                      className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Regular Markets View */
        <div className="bg-dark-100 rounded-lg border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-dark-200 font-medium">
            <div className="col-span-1"></div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">24h</div>
            <div className="col-span-2 text-right md:inline hidden">Market Cap</div>
            <div className="col-span-1 text-right"></div>
          </div>

          {/* Table body */}
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div key={company.symbol} className="grid grid-cols-12 gap-4 p-4 border-b border-border hover:bg-dark-200/30">
                {/* Favorite star */}
                <div className="col-span-1 flex items-center">
                  <button className="text-light-200 hover:text-primary">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Company name and info */}
                <div className="col-span-4 flex items-center">
                  <div className="w-8 h-8 bg-dark-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-bold">{company.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-light-200">{company.symbol}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-right self-center">
                  ${company.price.toFixed(2)}
                </div>

                {/* 24h Change */}
                <div className={`col-span-2 text-right self-center ${company.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {company.change24h >= 0 ? '+' : ''}{company.change24h}%
                </div>

                {/* Market Cap */}
                <div className="col-span-2 text-right self-center md:inline hidden">
                  {company.marketCap}
                </div>

                {/* Trade button */}
                <div className="col-span-1 text-right self-center">
                  <button
                    className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary/90"
                    onClick={() => router.push(`/trade?symbol=${company.symbol}`)}
                  >
                    Trade
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-light-200">
              No companies found matching your criteria
            </div>
          )}
        </div>
      )}

      {/* Security Detail Modal */}
      {showDetailModal && selectedSecurity && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-100 rounded-lg border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`p-6 ${selectedSecurity.type === 'equity' ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20' : 'bg-gradient-to-r from-green-600/20 to-emerald-600/20'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedSecurity.type === 'equity' ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>
                    {selectedSecurity.type.toUpperCase()}
                  </span>
                  <h2 className="text-2xl font-bold mt-2">{selectedSecurity.name}</h2>
                  <p className="text-light-200">{selectedSecurity.symbol} • {selectedSecurity.isin || 'No ISIN'}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-light-200 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Company Info */}
            {selectedSecurity.company && (
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-dark-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">{selectedSecurity.company.symbol.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium">{selectedSecurity.company.name}</h4>
                    <p className="text-sm text-primary">{selectedSecurity.company.sector}</p>
                    <p className="text-sm text-light-200 mt-2">{selectedSecurity.company.description}</p>
                  </div>
                </div>

                {/* Highlights */}
                {selectedSecurity.company.highlights && selectedSecurity.company.highlights.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-light-200 mb-2">Highlights</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedSecurity.company.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Financials Panel */}
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold mb-4">📊 Financials & Terms</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-dark-200 p-4 rounded-lg">
                  <p className="text-xs text-light-200 mb-1">Nominal Value</p>
                  <p className="text-lg font-bold">{selectedSecurity.nominalValue} {selectedSecurity.currency}</p>
                </div>
                <div className="bg-dark-200 p-4 rounded-lg">
                  <p className="text-xs text-light-200 mb-1">Total Supply</p>
                  <p className="text-lg font-bold">{parseInt(selectedSecurity.totalSupply).toLocaleString()}</p>
                </div>
                <div className="bg-dark-200 p-4 rounded-lg">
                  <p className="text-xs text-light-200 mb-1">Market Cap</p>
                  <p className="text-lg font-bold">{selectedSecurity.company?.marketCap || 'N/A'}</p>
                </div>
                {selectedSecurity.type === 'equity' && selectedSecurity.dividendYield !== undefined && (
                  <div className="bg-dark-200 p-4 rounded-lg">
                    <p className="text-xs text-light-200 mb-1">Dividend Yield</p>
                    <p className="text-lg font-bold text-green-400">{selectedSecurity.dividendYield}%</p>
                  </div>
                )}
                {selectedSecurity.type === 'bond' && (
                  <>
                    <div className="bg-dark-200 p-4 rounded-lg">
                      <p className="text-xs text-light-200 mb-1">Coupon Rate</p>
                      <p className="text-lg font-bold text-green-400">{selectedSecurity.couponRate}%</p>
                    </div>
                    <div className="bg-dark-200 p-4 rounded-lg">
                      <p className="text-xs text-light-200 mb-1">Maturity Date</p>
                      <p className="text-lg font-bold">{selectedSecurity.maturityDate ? new Date(selectedSecurity.maturityDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Documents Section */}
            {selectedSecurity.company?.documents && selectedSecurity.company.documents.length > 0 && (
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold mb-4">📁 Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSecurity.company.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-dark-200 rounded-lg hover:bg-dark-200/80 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-light-200">{doc.type}</p>
                      </div>
                      <svg className="w-5 h-5 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Team Section */}
            {selectedSecurity.company?.team && selectedSecurity.company.team.length > 0 && (
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold mb-4">👥 Leadership Team</h3>
                <div className="flex flex-wrap gap-4">
                  {selectedSecurity.company.team.map((member, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-dark-200 p-3 rounded-lg">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-light-200">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 flex gap-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 px-6 bg-dark-200 hover:bg-dark-200/80 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  router.push(`/trade?symbol=${selectedSecurity.symbol}&type=${selectedSecurity.type}`);
                }}
                className="flex-1 py-3 px-6 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Invest Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsPage;