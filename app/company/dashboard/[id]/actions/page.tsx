"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCompany } from '@/lib/context/CompanyContext';

const CorporateActionsPage = () => {
    const params = useParams();
    const { currentCompany } = useCompany();
    const [activeTab, setActiveTab] = useState('governance');

    // Mock Data for Proposals
    const [proposals, setProposals] = useState([
        {
            id: 'PROP-001',
            title: 'Expansion to East African Market',
            description: 'Proposal to allocate funds for expansion into neighboring East African countries.',
            status: 'Active',
            votesFor: 65,
            votesAgainst: 12,
            endDate: 'Dec 15, 2026',
            totalVotes: 77
        },
        {
            id: 'PROP-002',
            title: 'New Board Member Appointment',
            description: 'Appointment of Jane Doe as a new board member representing minority shareholders.',
            status: 'Closed',
            votesFor: 80,
            votesAgainst: 5,
            endDate: 'Closed',
            totalVotes: 85
        }
    ]);

    // Mock Data for News
    const [news, setNews] = useState([
        {
            id: 1,
            title: 'Q4 2025 Financial Results Released',
            date: 'Jan 15, 2026',
            summary: 'The company has released its audited financial results for the fourth quarter of 2025 showing a 15% growth in revenue.',
            type: 'Financials'
        },
        {
            id: 2,
            title: 'Strategic Partnership with TechFin Solutions',
            date: 'Dec 20, 2025',
            summary: 'We are excited to announce a new strategic partnership to enhance our digital infrastructure.',
            type: 'Partnership'
        }
    ]);

    const calculatePercentage = (votes: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    return (
        <div className="min-h-screen bg-black/95 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Corporate Actions</h1>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('governance')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'governance'
                            ? 'border-b-2 border-white text-white'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Governance
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'news'
                            ? 'border-b-2 border-white text-white'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Corporate News
                    </button>
                </div>

                {/* Governance Tab */}
                {activeTab === 'governance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Proposals List */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-xl font-semibold mb-1">Governance Proposals</h2>
                            <p className="text-sm text-gray-400 mb-6">Create and manage shareholder voting proposals</p>

                            {proposals.map((proposal) => (
                                <div key={proposal.id} className="bg-[#111] rounded-lg p-6 border border-gray-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">{proposal.title}</h3>
                                            <p className="text-xs text-gray-500 uppercase mt-1">ID: {proposal.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${proposal.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700/30 text-gray-400'
                                            }`}>
                                            {proposal.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>

                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Voting Progress</span>
                                            <span className="text-gray-400">{proposal.totalVotes} votes ({proposal.endDate === 'Closed' ? 'Closed' : `Ends ${proposal.endDate}`})</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
                                            <div
                                                className="bg-green-500 h-full"
                                                style={{ width: `${calculatePercentage(proposal.votesFor, proposal.totalVotes)}%` }}
                                            />
                                            <div
                                                className="bg-red-500 h-full"
                                                style={{ width: `${calculatePercentage(proposal.votesAgainst, proposal.totalVotes)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="text-green-500">For: {proposal.votesFor} ({calculatePercentage(proposal.votesFor, proposal.totalVotes)}%)</span>
                                            <span className="text-red-500">Against: {proposal.votesAgainst} ({calculatePercentage(proposal.votesAgainst, proposal.totalVotes)}%)</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Column: Create Proposal Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#111] rounded-lg p-6 border border-gray-800 sticky top-8">
                                <h2 className="text-xl font-semibold mb-1">Create Proposal</h2>
                                <p className="text-sm text-gray-400 mb-6">Submit a new proposal for shareholder voting</p>

                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Title</label>
                                        <input
                                            type="text"
                                            placeholder="Enter proposal title"
                                            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white placeholder-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Type</label>
                                        <select className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white">
                                            <option value="">Select type</option>
                                            <option value="governance">Governance</option>
                                            <option value="financial">Financial</option>
                                            <option value="operational">Operational</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                        <textarea
                                            placeholder="Describe the proposal in detail"
                                            rows={4}
                                            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white placeholder-gray-600 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Voting End Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Attach Document (Optional)</label>
                                        <input
                                            type="file"
                                            className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors mt-2"
                                    >
                                        Create Proposal
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Corporate News Tab */}
                {activeTab === 'news' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Company Announcements</h2>
                                <p className="text-sm text-gray-400">Latest news and releases for shareholders</p>
                            </div>
                            <button className="px-4 py-2 bg-white text-black rounded font-medium text-sm hover:bg-gray-200 transition-colors">
                                Post News
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {news.map((item) => (
                                <div key={item.id} className="bg-[#111] rounded-lg p-6 border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded font-medium">{item.type}</span>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">{item.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateActionsPage;
