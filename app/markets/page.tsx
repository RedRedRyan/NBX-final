"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { companies, marketFilters } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';

const MarketsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredCompanies, setFilteredCompanies] = useState(companies);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Filter companies based on search term and active filter
  useEffect(() => {
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
        case 'premarket':
          // In a real app, this would filter for premarket data
          result = result.filter(company => company.marketCap.includes('B'));
          break;
      }
    }
    
    setFilteredCompanies(result);
  }, [searchTerm, activeFilter]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with search and profile */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Markets</h1>
        
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-200 border border-border rounded-md py-2 px-4 pl-10 w-64"
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
          <div className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-sm font-medium">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {marketFilters.map((filter) => (
          <button
            key={filter.id}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${
              activeFilter === filter.id
                ? 'bg-primary text-white'
                : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
            }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Companies list */}
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
              <div className={`col-span-2 text-right self-center ${
                company.change24h >= 0 ? 'text-green-500' : 'text-red-500'
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
    </div>
  );
};

export default MarketsPage;