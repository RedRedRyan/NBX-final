"use client";

// Force dynamic rendering - useSearchParams requires it for prerendering
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { companies, tradeModes } from '@/lib/constants';
import { useAuth } from '@/lib/context/AuthContext';

// Wrapper component to use searchParams inside Suspense
const TradePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [symbol, setSymbol] = useState(searchParams?.get('symbol') || 'SCOM');
  const [tradeMode, setTradeMode] = useState('spot');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy'); // buy/sell for spot, long/short for futures
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  // Get company data based on symbol
  const company = companies.find(c => c.symbol === symbol) || companies[0];

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the order to an API
    alert(`Order placed: ${side} ${amount} ${symbol} at ${orderType === 'market' ? 'market price' : `$${price}`}`);
    setAmount('');
    setPrice('');
  };

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Trade options */}
        <div className="w-full lg:w-1/3 bg-dark-100 rounded-lg border border-border p-6">
          {/* Trade mode selector */}
          <div className="flex mb-6">
            {tradeModes.map((mode) => (
              <button
                key={mode.id}
                className={`flex-1 py-2 text-center ${tradeMode === mode.id
                  ? 'bg-primary text-white rounded-md'
                  : 'text-light-100 hover:bg-dark-200 rounded-md'
                  }`}
                onClick={() => {
                  setTradeMode(mode.id);
                  setSide(mode.id === 'spot' ? 'buy' : 'long');
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Symbol selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-light-100 mb-2">
              Symbol
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
            >
              {companies.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buy/Sell or Long/Short selector */}
          <div className="flex mb-6">
            <button
              className={`flex-1 py-3 rounded-l-md ${side === (tradeMode === 'spot' ? 'buy' : 'long')
                ? 'bg-green-600 text-white'
                : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
                }`}
              onClick={() => setSide(tradeMode === 'spot' ? 'buy' : 'long')}
            >
              {tradeMode === 'spot' ? 'Buy' : 'Long'}
            </button>
            <button
              className={`flex-1 py-3 rounded-r-md ${side === (tradeMode === 'spot' ? 'sell' : 'short')
                ? 'bg-red-600 text-white'
                : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
                }`}
              onClick={() => setSide(tradeMode === 'spot' ? 'sell' : 'short')}
            >
              {tradeMode === 'spot' ? 'Sell' : 'Short'}
            </button>
          </div>

          {/* Order type selector */}
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 rounded-l-md ${orderType === 'market'
                ? 'bg-primary text-white'
                : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
                }`}
              onClick={() => setOrderType('market')}
            >
              Market
            </button>
            <button
              className={`flex-1 py-2 rounded-r-md ${orderType === 'limit'
                ? 'bg-primary text-white'
                : 'bg-dark-200 text-light-100 hover:bg-dark-200/80'
                }`}
              onClick={() => setOrderType('limit')}
            >
              Limit
            </button>
          </div>

          {/* Order form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-100 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                  required
                />
                <span className="absolute right-3 top-2 text-light-200">
                  {symbol}
                </span>
              </div>
            </div>

            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-light-100 mb-2">
                  Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={company.price.toString()}
                    className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                    required
                  />
                  <span className="absolute right-3 top-2 text-light-200">
                    USD
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-light-100 mb-2">
                Total
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount && (orderType === 'market' ? (parseFloat(amount) * company.price).toFixed(2) : (parseFloat(amount) * (parseFloat(price) || company.price)).toFixed(2))}
                  className="w-full bg-dark-200 border border-border rounded-md py-2 px-3"
                  disabled
                />
                <span className="absolute right-3 top-2 text-light-200">
                  USD
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-md font-medium ${side === (tradeMode === 'spot' ? 'buy' : 'long')
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
            >
              {side === (tradeMode === 'spot' ? 'buy' : 'long')
                ? tradeMode === 'spot' ? 'Buy' : 'Long'
                : tradeMode === 'spot' ? 'Sell' : 'Short'} {symbol}
            </button>
          </form>
        </div>

        {/* Right side - Chart and order book */}
        <div className="w-full lg:w-2/3 space-y-6">
          {/* Chart */}
          <div className="bg-dark-100 rounded-lg border border-border p-6 h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl font-bold mb-2">{company.name} ({company.symbol})</p>
              <p className="text-3xl mb-4">${company.price.toFixed(2)}</p>
              <p className={`text-lg ${company.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {company.change24h >= 0 ? '+' : ''}{company.change24h}%
              </p>
              <p className="text-light-200 mt-8">Chart visualization would be displayed here</p>
            </div>
          </div>

          {/* Order book / Positions tabs */}
          <div className="bg-dark-100 rounded-lg border border-border">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                className={`flex-1 py-3 text-center ${activeTab === 'orders'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-light-100 hover:bg-dark-200/30'
                  }`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
              <button
                className={`flex-1 py-3 text-center ${activeTab === 'positions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-light-100 hover:bg-dark-200/30'
                  }`}
                onClick={() => setActiveTab('positions')}
              >
                Positions
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'orders' ? (
                <div className="text-center py-8">
                  <p className="text-light-200">No active orders</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-light-200">No open positions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main export wraps content in Suspense for useSearchParams
const TradePage = () => (
  <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
    <TradePageContent />
  </Suspense>
);

export default TradePage;