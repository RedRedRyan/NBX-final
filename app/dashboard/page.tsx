"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// --- Mock Data ---

const holdingsData = [
    { id: 1, company: 'SafeFarm Ltd', symbol: 'SFARM', quantity: 500, price: 12.50, value: 6250, change: 5.2, type: 'Equity' },
    { id: 2, company: 'TechFin Solutions', symbol: 'TFIN', quantity: 200, price: 45.00, value: 9000, change: -1.5, type: 'Equity' },
    { id: 3, company: 'Green Energy Co', symbol: 'GECO', quantity: 1000, price: 100.00, value: 100000, change: 0.8, type: 'Bond' },
];

const dividendsData = [
    { id: 1, company: 'SafeFarm Ltd', amount: 250, date: '2025-12-15', status: 'Paid' },
    { id: 2, company: 'TechFin Solutions', amount: 180, date: '2026-03-01', status: 'Pending' },
];

const proposalsData = [
    {
        id: 'PROP-101',
        company: 'SafeFarm Ltd',
        title: 'Expansion to East Africa',
        description: 'Proposal to allocate funds for expansion into neighboring East African countries.',
        endDate: '2026-02-15',
        status: 'Active',
        myVote: null
    },
    {
        id: 'PROP-102',
        company: 'TechFin Solutions',
        title: 'New Board Member',
        description: 'Appointment of Jane Doe as a new board member.',
        endDate: '2025-12-20',
        status: 'Closed',
        myVote: 'For'
    },
];

// --- Components ---

const DonutChart = () => {
    // Mock distribution: Tech 34%, Farm 35%, Finance 31%
    // Circumference = 2 * pi * r. Let r=40, C approx 251.
    // Segments: 
    // 1. 34% -> 85.34 (Tech - Blue)
    // 2. 35% -> 87.85 (Farm - Green)
    // 3. 31% -> 77.81 (Finance - Orange)

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#111" strokeWidth="20" />
                {/* Segment 1: Tech (Blue) */}
                <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="85.34 251.32"
                    strokeDashoffset="0"
                />
                {/* Segment 2: Farm (Green) - starts after 85.34 */}
                <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#22c55e"
                    strokeWidth="20"
                    strokeDasharray="87.85 251.32"
                    strokeDashoffset="-85.34"
                />
                {/* Segment 3: Finance (Orange) - starts after 85.34 + 87.85 = 173.19 */}
                <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="20"
                    strokeDasharray="77.81 251.32"
                    strokeDashoffset="-173.19"
                />
            </svg>
            {/* Hole */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#111] rounded-full"></div>
            </div>
        </div>
    );
};

const LineChart = () => {
    // Simple mock path for performance
    return (
        <div className="w-full h-32 flex items-end">
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path
                    d="M0,80 C50,80 50,40 100,50 C150,60 150,20 200,30 C250,40 250,10 300,20"
                    fill="none"
                    stroke="#fb4f1f"
                    strokeWidth="3"
                />
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <path
                    d="M0,80 C50,80 50,40 100,50 C150,60 150,20 200,30 C250,40 250,10 300,20 V100 H0 Z"
                    fill="url(#gradient)"
                    stroke="none"
                />
            </svg>
        </div>
    );
};

// --- Page Component ---

const InvestorDashboard = () => {
    const [activeTab, setActiveTab] = useState('holdings');
    const [proposals, setProposals] = useState(proposalsData);

    const handleVote = (id: string, vote: 'For' | 'Against') => {
        setProposals(prev => prev.map(p =>
            p.id === id ? { ...p, myVote: vote } : p
        ));
        // In a real app, we would make an API call here
        alert(`Voted ${vote} for proposal ${id}`);
    };

    const totalValue = holdingsData.reduce((acc, curr) => acc + curr.value, 0);
    const activeProposalsCount = proposals.filter(p => p.status === 'Active' && !p.myVote).length;

    return (
        <div id="dashboard">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400">Welcome back, Investor</p>
                    </div>
                    <Link href="/markets" id="badge">
                        Explore Markets
                    </Link>
                </div>

                {/* Top Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Total Value Card */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Value</p>
                            <h2 className="text-4xl font-bold">${totalValue.toLocaleString()}</h2>
                            <p className="text-green-500 text-sm mt-2 flex items-center">
                                ↑ $250.00 (7.14%) <span className="text-gray-500 ml-1">past month</span>
                            </p>
                        </div>
                    </div>

                    {/* Asset Allocation Card */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium">Asset Allocation</p>
                                <p className="text-xs text-gray-500">Distribution by sector</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <DonutChart />
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-gray-300">TECH 34%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-gray-300">FARM 35%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                    <span className="text-gray-300">MFIN 31%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm font-medium">Performance</p>
                            <p className="text-xs text-gray-500">Historical returns</p>
                        </div>
                        <div className="w-full">
                            <LineChart />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Jan</span><span>Apr</span><span>Aug</span><span>Dec</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Voting Notification Banner */}
                {activeProposalsCount > 0 && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">You have {activeProposalsCount} active voting sessions</h3>
                                <p className="text-sm text-gray-400">Your vote matters! Participate in company governance decisions</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab('governance')}
                            className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors whitespace-nowrap"
                        >
                            View Voting Sessions
                        </button>
                    </div>
                )}

                {/* Tabs Section */}
                <div>
                    <div className="flex space-x-2 bg-[#111] p-1 rounded-lg w-fit mb-6 border border-gray-800">
                        {['holdings', 'dividends', 'governance'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-gray-800 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden min-h-[400px]">

                        {/* Holdings Tab */}
                        {activeTab === 'holdings' && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-1">Your Holdings</h3>
                                <p className="text-sm text-gray-400 mb-6">Companies you've invested in</p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                                                <th className="py-3 font-medium">Company</th>
                                                <th className="py-3 font-medium text-right">Quantity</th>
                                                <th className="py-3 font-medium text-right">Price</th>
                                                <th className="py-3 font-medium text-right">Value</th>
                                                <th className="py-3 font-medium text-right">Gain/Loss</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {holdingsData.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs">{item.symbol[0]}</div>
                                                            <div>
                                                                <p className="font-medium text-white">{item.company}</p>
                                                                <p className="text-xs text-gray-500">{item.symbol} • {item.type}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right text-gray-300">{item.quantity.toLocaleString()}</td>
                                                    <td className="py-4 text-right text-gray-300">${item.price.toFixed(2)}</td>
                                                    <td className="py-4 text-right font-medium text-white">${item.value.toLocaleString()}</td>
                                                    <td className={`py-4 text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {item.change >= 0 ? '+' : ''}{item.change}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Dividends Tab */}
                        {activeTab === 'dividends' && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-1">Dividends</h3>
                                <p className="text-sm text-gray-400 mb-6">Payout history and upcoming distributions</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                                                <th className="py-3 font-medium">Company</th>
                                                <th className="py-3 font-medium">Date</th>
                                                <th className="py-3 font-medium text-right">Amount</th>
                                                <th className="py-3 font-medium text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {dividendsData.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 font-medium text-white">{item.company}</td>
                                                    <td className="py-4 text-gray-400">{item.date}</td>
                                                    <td className="py-4 text-right font-medium text-white">${item.amount.toFixed(2)}</td>
                                                    <td className="py-4 text-right">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Governance Tab */}
                        {activeTab === 'governance' && (
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-1">Governance</h3>
                                <p className="text-sm text-gray-400 mb-6">Vote on proposals from companies you hold</p>

                                <div className="space-y-4">
                                    {proposals.map((proposal) => (
                                        <div key={proposal.id} className="bg-black/40 border border-gray-800 rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{proposal.company}</span>
                                                        <span className="text-xs text-gray-600">•</span>
                                                        <span className="text-xs text-gray-500">ID: {proposal.id}</span>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white">{proposal.title}</h4>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${proposal.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                                                    }`}>
                                                    {proposal.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-400 text-sm mb-4">{proposal.description}</p>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-800/50">
                                                <div className="text-xs text-gray-500">
                                                    Ends: {proposal.endDate}
                                                </div>

                                                {proposal.status === 'Active' && !proposal.myVote ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleVote(proposal.id, 'Against')}
                                                            className="px-4 py-2 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 text-sm font-medium transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleVote(proposal.id, 'For')}
                                                            className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 text-sm font-medium transition-colors"
                                                        >
                                                            Support
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-400">Your Vote:</span>
                                                        {proposal.myVote ? (
                                                            <span className={`font-medium ${proposal.myVote === 'For' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {proposal.myVote}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm italic">Did not vote</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvestorDashboard;
