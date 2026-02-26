"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ApiClient } from '@/lib/api/client';
import Link from 'next/link';
import EnableTradingButton from '@/components/EnableTradingButton';
import MintButton from '@/components/MintButton';
import GrantRoleButton from '@/components/GrantRoleButton';
import RoleManagementSection from '@/components/RoleManagementSection';
import ATSService from '@/lib/hedera/ATSService';

interface SecurityDetails {
    _id: string;
    name: string;
    symbol: string;
    isin?: string;
    decimals: number;
    totalSupply: string;
    assetAddress: string;
    diamondAddress?: string;
    transactionId?: string;
    treasuryAccountId?: string;
    currency?: string;
    nominalValue?: string;
    status: string;
    network: string;
    tokenizedAt?: string;
    // Equity specific
    dividendType?: number;
    votingRights?: boolean;
    informationRights?: boolean;
    // Bond specific
    couponRate?: number;
    maturityDate?: number;
    startingDate?: number;
    // Config
    isControllable?: boolean;
    isBlocklist?: boolean;
    regulationType?: string;
    regulationSubType?: string;
}

// Mock shareholding data (in real app, this would come from the blockchain/backend)
interface Shareholder {
    address: string;
    balance: string;
    percentage: number;
}

const SecurityDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuth();

    const companyId = params.id as string;
    const securityType = params.type as 'equity' | 'bond';
    const securityId = params.securityId as string;

    const [security, setSecurity] = useState<SecurityDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [htsTokenId, setHtsTokenId] = useState<string | null>(null);
    const [mintedAmount, setMintedAmount] = useState<number>(0);
    const [mintedPercentage, setMintedPercentage] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'roles'>('overview');

    // Mock shareholders data
    const [shareholders] = useState<Shareholder[]>([
        { address: '0.0.7504602', balance: '500000000', percentage: 50 },
        { address: '0.0.1234567', balance: '300000000', percentage: 30 },
        { address: '0.0.9876543', balance: '200000000', percentage: 20 },
    ]);

    useEffect(() => {
        const fetchSecurity = async () => {
            if (!companyId || !securityId) return;

            setIsLoading(true);
            try {
                const endpoint = securityType === 'equity'
                    ? `/companies/${companyId}/equity/${securityId}`
                    : `/companies/${companyId}/bond/${securityId}`;

                const response = await ApiClient.request(endpoint, { token: token || undefined }) as { data?: SecurityDetails };
                setSecurity(response?.data || null);
            } catch (err: any) {
                console.error('Failed to fetch security:', err);
                setError(err.message || 'Failed to load security details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSecurity();
    }, [companyId, securityId, securityType, token]);

    // Fetch additional security info (Token ID, minted percentage)
    useEffect(() => {
        const fetchSecurityInfo = async () => {
            if (!security?.assetAddress) return;

            try {
                // Try to get security info from the SDK
                const info = await ATSService.getSecurityInfo(security.assetAddress);
                if (info.tokenId) {
                    setHtsTokenId(info.tokenId);
                }

                // Calculate minted percentage by summing all holder balances
                // Using the shareholding data (in production, this would come from Mirror Node)
                const totalMinted = shareholders.reduce(
                    (sum, holder) => sum + Number(holder.balance),
                    0
                );
                const totalSupply = Number(security.totalSupply);

                if (totalSupply > 0) {
                    setMintedAmount(totalMinted);
                    setMintedPercentage((totalMinted / totalSupply) * 100);
                }
            } catch (err) {
                console.error('Failed to fetch security info:', err);
            }
        };

        fetchSecurityInfo();
    }, [security?.assetAddress, security?.totalSupply, shareholders]);


    if (isLoading) {
        return (
            <div className="min-h-screen bg-dark-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !security) {
        return (
            <div className="min-h-screen bg-dark-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error || 'Security not found'}</p>
                    </div>
                    <Link
                        href={`/company/dashboard/${companyId}`}
                        className="mt-4 text-primary hover:underline inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const isEquity = securityType === 'equity';
    const accentColor = isEquity ? 'green-500' : 'primary';

    return (
        <div className="min-h-screen bg-dark-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-light-200">
                        <li>
                            <Link href={`/company/dashboard/${companyId}`} className="hover:text-primary">
                                Dashboard
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link
                                href={`/company/dashboard/${companyId}`}
                                className="hover:text-primary"
                                onClick={() => {
                                    // Set active tab to tokenization on navigation
                                }}
                            >
                                Tokenization
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-white">{security.name}</li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-8 bg-dark-200 border border-border rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 bg-${accentColor}/10 rounded-lg flex items-center justify-center`}>
                                {isEquity ? (
                                    <svg className={`w-8 h-8 text-${accentColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                ) : (
                                    <svg className={`w-8 h-8 text-${accentColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-white">{security.name}</h1>
                                    <span className={`px-3 py-1 text-sm rounded-full bg-${accentColor}/10 text-${accentColor}`}>
                                        {securityType.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-light-100 mt-1">{security.symbol} • {security.assetAddress}</p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-3 flex-wrap">
                            <GrantRoleButton
                                securityAddress={security.assetAddress}
                                onSuccess={() => window.location.reload()}
                            />
                            <MintButton
                                securityAddress={security.assetAddress}
                                amountToMint={100}
                                onSuccess={() => window.location.reload()}
                            />
                            {isEquity && (
                                <EnableTradingButton
                                    tokenId={security.assetAddress}
                                    totalSupply={security.totalSupply}
                                />
                            )}
                            <span className={`px-4 py-2 rounded-full text-sm ${security.status === 'active'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {security.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-border">
                    <nav className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-light-200 hover:text-white'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'roles'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-light-200 hover:text-white'
                                }`}
                        >
                            Role Management
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Total Supply</p>
                                <p className="text-2xl font-bold text-white font-mono">
                                    {Number(security.totalSupply).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Minted %</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold text-white font-mono">
                                        {mintedPercentage.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="mt-2 w-full bg-dark-100 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${Math.min(mintedPercentage, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-light-200 mt-1">
                                    {mintedAmount.toLocaleString()} minted
                                </p>
                            </div>

                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Token ID</p>
                                <p className="text-lg font-bold text-white font-mono truncate" title={htsTokenId || security.assetAddress}>
                                    {htsTokenId || security.assetAddress}
                                </p>
                                <a
                                    href={`https://hashscan.io/testnet/token/${htsTokenId || security.assetAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-1 inline-block"
                                >
                                    View on HashScan →
                                </a>
                            </div>

                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Currency</p>
                                <p className="text-2xl font-bold text-white">
                                    {security.currency || 'USD'}
                                </p>
                            </div>

                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Nominal Value</p>
                                <p className="text-2xl font-bold text-white">
                                    {security.nominalValue || 'N/A'}
                                </p>
                            </div>

                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <p className="text-sm text-light-100 mb-2">Network</p>
                                <p className="text-2xl font-bold text-white capitalize">
                                    {security.network}
                                </p>
                            </div>
                        </div>


                        {/* Shareholding Section */}
                        <div className="bg-dark-200 border border-border rounded-lg p-6 mb-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Current Shareholding</h3>
                            <p className="text-light-100 mb-6">
                                View the distribution of token holders
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-light-100 font-medium">Holder Address</th>
                                            <th className="text-right py-3 px-4 text-light-100 font-medium">Balance</th>
                                            <th className="text-right py-3 px-4 text-light-100 font-medium">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shareholders.map((holder, index) => (
                                            <tr key={index} className="border-b border-border/50 hover:bg-dark-100 transition-colors">
                                                <td className="py-4 px-4">
                                                    <span className="font-mono text-white">{holder.address}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className="font-mono text-white">
                                                        {Number(holder.balance).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 bg-dark-100 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full bg-${accentColor}`}
                                                                style={{ width: `${holder.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-light-100 text-sm w-12 text-right">
                                                            {holder.percentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 text-sm text-light-200">
                                * Shareholding data will be fetched from the Hedera network in future updates
                            </div>
                        </div>

                        {/* Security Details */}
                        <div className="grid gap-6 md:grid-cols-2 mb-8">
                            {/* General Info */}
                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">General Information</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-light-100">ISIN</span>
                                        <span className="text-white font-mono">{security.isin || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Decimals</span>
                                        <span className="text-white">{security.decimals}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Asset Address</span>
                                        <span className="text-white font-mono text-sm">{security.assetAddress}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Treasury Account</span>
                                        <span className="text-white font-mono">{security.treasuryAccountId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Tokenized At</span>
                                        <span className="text-white">
                                            {security.tokenizedAt ? new Date(security.tokenizedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Configuration */}
                            <div className="bg-dark-200 border border-border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Controllable</span>
                                        <span className={security.isControllable ? 'text-green-500' : 'text-red-500'}>
                                            {security.isControllable ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Blocklist Enabled</span>
                                        <span className={security.isBlocklist ? 'text-green-500' : 'text-red-500'}>
                                            {security.isBlocklist ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Regulation Type</span>
                                        <span className="text-white">{security.regulationType || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-light-100">Regulation SubType</span>
                                        <span className="text-white">{security.regulationSubType || 'N/A'}</span>
                                    </div>
                                    {isEquity && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-light-100">Voting Rights</span>
                                                <span className={security.votingRights ? 'text-green-500' : 'text-red-500'}>
                                                    {security.votingRights ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {!isEquity && security.couponRate !== undefined && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-light-100">Coupon Rate</span>
                                                <span className="text-white">{security.couponRate}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-light-100">Maturity Date</span>
                                                <span className="text-white">
                                                    {security.maturityDate
                                                        ? new Date(security.maturityDate * 1000).toLocaleDateString()
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <div className="mt-8">
                            <Link
                                href={`/company/dashboard/${companyId}`}
                                className="inline-flex items-center px-4 py-2 bg-dark-200 border border-border rounded-lg text-white hover:border-primary transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>
                        </div>
                    </>
                )}

                {/* Role Management Tab */}
                {activeTab === 'roles' && (
                    <div className="bg-dark-200 border border-border rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Role Management</h2>
                        <p className="text-light-100 mb-6">
                            Manage security token roles and permissions. The Admin role holder has full control over this security.
                        </p>
                        <RoleManagementSection
                            securityAddress={security.assetAddress}
                            onRoleChange={() => {
                                // Refresh page 
                                router.refresh();
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityDetailPage;
