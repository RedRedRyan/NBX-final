"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ATSService, { SecurityRole, SecurityRoleKey } from '@/lib/hedera/ATSService';

interface RoleManagementSectionProps {
    securityAddress: string;
    onRoleChange?: () => void;
}

interface RoleInfo {
    name: string;
    key: SecurityRoleKey;
    hex: string;
    memberCount: number;
    members: string[];
    isExpanded: boolean;
    isLoading: boolean;
}

// Human-readable role names
const ROLE_DISPLAY_NAMES: Record<string, string> = {
    DEFAULT_ADMIN_ROLE: 'Admin',
    ISSUER_ROLE: 'Issuer',
    CONTROLLER_ROLE: 'Controller',
    PAUSER_ROLE: 'Pauser',
    CONTROLLIST_ROLE: 'Control List',
    CORPORATEACTIONS_ROLE: 'Corporate Actions',
    DOCUMENTER_ROLE: 'Documenter',
    SNAPSHOT_ROLE: 'Snapshot',
    LOCKER_ROLE: 'Locker',
    CAP_ROLE: 'Cap Manager',
    BOND_MANAGER_ROLE: 'Bond Manager',
    ADJUSTMENT_BALANCE_ROLE: 'Balance Adjustment',
    AGENT_ROLE: 'Agent',
    KYC_ROLE: 'KYC',
    KYC_MANAGER_ROLE: 'KYC Manager',
    FREEZE_MANAGER_ROLE: 'Freeze Manager',
};

// Common roles to display by default
const COMMON_ROLES: SecurityRoleKey[] = [
    'DEFAULT_ADMIN_ROLE',
    'ISSUER_ROLE',
    'AGENT_ROLE',
    'CONTROLLER_ROLE',
    'PAUSER_ROLE',
    'KYC_ROLE',
];

export const RoleManagementSection: React.FC<RoleManagementSectionProps> = ({
    securityAddress,
    onRoleChange
}) => {
    const [roles, setRoles] = useState<RoleInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllRoles, setShowAllRoles] = useState(false);
    const [showGrantModal, setShowGrantModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);
    const [targetAccount, setTargetAccount] = useState('');
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [actionMessage, setActionMessage] = useState('');
    const [adminAccounts, setAdminAccounts] = useState<string[]>([]);

    // Initialize roles list
    const initializeRoles = useCallback(async () => {
        setIsLoading(true);
        const rolesToShow = showAllRoles ? Object.keys(SecurityRole) as SecurityRoleKey[] : COMMON_ROLES;

        const roleInfoList: RoleInfo[] = await Promise.all(
            rolesToShow.map(async (key) => {
                const hex = SecurityRole[key];
                const countResult = await ATSService.getRoleMemberCount(securityAddress, hex);

                return {
                    name: ROLE_DISPLAY_NAMES[key] || key.replace(/_ROLE$/, '').replace(/_/g, ' '),
                    key,
                    hex,
                    memberCount: countResult.success ? (countResult.count || 0) : 0,
                    members: [],
                    isExpanded: false,
                    isLoading: false
                };
            })
        );

        // Sort by member count (descending) then by name
        roleInfoList.sort((a, b) => b.memberCount - a.memberCount || a.name.localeCompare(b.name));
        setRoles(roleInfoList);

        // Get admin accounts
        const adminRole = roleInfoList.find(r => r.key === 'DEFAULT_ADMIN_ROLE');
        if (adminRole && adminRole.memberCount > 0) {
            const result = await ATSService.getRoleMembers(securityAddress, SecurityRole.DEFAULT_ADMIN_ROLE, 0, 10);
            if (result.success && result.members) {
                setAdminAccounts(result.members);
            }
        }

        setIsLoading(false);
    }, [securityAddress, showAllRoles]);

    useEffect(() => {
        initializeRoles();
    }, [initializeRoles]);

    // Toggle expand role to show members
    const toggleRoleExpand = async (index: number) => {
        const role = roles[index];

        if (role.isExpanded) {
            setRoles(prev => prev.map((r, i) => i === index ? { ...r, isExpanded: false } : r));
            return;
        }

        // Load members if not loaded
        if (role.members.length === 0 && role.memberCount > 0) {
            setRoles(prev => prev.map((r, i) => i === index ? { ...r, isLoading: true } : r));

            const result = await ATSService.getRoleMembers(securityAddress, role.hex, 0, 100);

            setRoles(prev => prev.map((r, i) => i === index ? {
                ...r,
                members: result.success ? (result.members || []) : [],
                isExpanded: true,
                isLoading: false
            } : r));
        } else {
            setRoles(prev => prev.map((r, i) => i === index ? { ...r, isExpanded: true } : r));
        }
    };

    // Grant role
    const handleGrantRole = async () => {
        if (!selectedRole || !targetAccount.trim()) {
            setActionMessage('Please enter a target account ID');
            setActionStatus('error');
            return;
        }

        setActionStatus('loading');
        setActionMessage('');

        try {
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            const result = await ATSService.grantSecurityRole(
                securityAddress,
                targetAccount.trim(),
                selectedRole.key
            );

            if (result.success) {
                setActionStatus('success');
                setActionMessage(`Role granted! TX: ${result.transactionId}`);
                setTimeout(() => {
                    setShowGrantModal(false);
                    setTargetAccount('');
                    setActionStatus('idle');
                    initializeRoles();
                    onRoleChange?.();
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            setActionStatus('error');
            setActionMessage(error.message || 'Failed to grant role');
        }
    };

    // Revoke role
    const handleRevokeRole = async (role: RoleInfo, accountId: string) => {
        if (!confirm(`Are you sure you want to revoke the "${role.name}" role from ${accountId}?`)) {
            return;
        }

        try {
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            const result = await ATSService.revokeSecurityRole(securityAddress, accountId, role.key);

            if (result.success) {
                alert(`Role revoked successfully! TX: ${result.transactionId}`);
                initializeRoles();
                onRoleChange?.();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            alert(`Failed to revoke role: ${error.message}`);
        }
    };

    // Filter roles based on search
    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.members.some(m => m.includes(searchQuery))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-light-100">Loading role information...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Admin Account Banner */}
            {adminAccounts.length > 0 && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-indigo-300 font-medium">Admin Account(s)</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {adminAccounts.map((acc, i) => (
                                    <span key={i} className="font-mono text-white text-sm bg-indigo-500/20 px-2 py-1 rounded">
                                        {acc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles or accounts..."
                        className="w-full px-4 py-2 pl-10 bg-dark-100 border border-border rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <button
                    onClick={() => setShowAllRoles(!showAllRoles)}
                    className="px-4 py-2 text-sm bg-dark-100 border border-border rounded-lg text-light-100 hover:border-primary transition-colors"
                >
                    {showAllRoles ? 'Show Common Roles' : 'Show All Roles'}
                </button>
            </div>

            {/* Roles List */}
            <div className="space-y-3">
                {filteredRoles.map((role, index) => (
                    <div key={role.key} className="bg-dark-100 border border-border rounded-lg overflow-hidden">
                        {/* Role Header */}
                        <div
                            onClick={() => toggleRoleExpand(index)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-dark-200/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role.key === 'DEFAULT_ADMIN_ROLE' ? 'bg-indigo-500/20 text-indigo-400' :
                                        role.memberCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-dark-200 text-light-200'
                                    }`}>
                                    {role.key === 'DEFAULT_ADMIN_ROLE' ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{role.name}</h4>
                                    <p className="text-xs text-light-200 font-mono">{role.key}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm ${role.memberCount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-dark-200 text-light-200'
                                    }`}>
                                    {role.memberCount} member{role.memberCount !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRole(role);
                                        setShowGrantModal(true);
                                    }}
                                    className="px-3 py-1 text-sm bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                                >
                                    Grant
                                </button>
                                <svg
                                    className={`w-5 h-5 text-light-200 transition-transform ${role.isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Expanded Members List */}
                        {role.isExpanded && (
                            <div className="border-t border-border p-4 bg-dark-200/30">
                                {role.isLoading ? (
                                    <div className="flex items-center gap-2 text-light-100">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                        Loading members...
                                    </div>
                                ) : role.members.length === 0 ? (
                                    <p className="text-light-200 text-sm">No accounts have this role.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {role.members.map((member, mIdx) => (
                                            <div key={mIdx} className="flex items-center justify-between bg-dark-100 rounded p-3">
                                                <span className="font-mono text-white text-sm">{member}</span>
                                                <button
                                                    onClick={() => handleRevokeRole(role, member)}
                                                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                                >
                                                    Revoke
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="text-center py-8 text-light-200">
                    No roles match your search.
                </div>
            )}

            {/* Grant Role Modal */}
            {showGrantModal && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGrantModal(false)}>
                    <div className="bg-dark-200 border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Grant {selectedRole.name} Role</h3>
                        <p className="text-light-100 text-sm mb-4">
                            Enter the Hedera account ID to grant the <strong>{selectedRole.name}</strong> role.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm text-light-100 mb-2">Target Account ID</label>
                            <input
                                type="text"
                                value={targetAccount}
                                onChange={(e) => setTargetAccount(e.target.value)}
                                placeholder="e.g., 0.0.12345"
                                className="w-full px-4 py-2 bg-dark-100 border border-border rounded-md text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        {actionStatus === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                                <p className="text-red-400 text-sm">{actionMessage}</p>
                            </div>
                        )}

                        {actionStatus === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded p-3 mb-4">
                                <p className="text-green-400 text-sm">{actionMessage}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowGrantModal(false);
                                    setTargetAccount('');
                                    setActionStatus('idle');
                                    setActionMessage('');
                                }}
                                className="flex-1 px-4 py-2 bg-dark-100 border border-border rounded-md text-white hover:bg-dark-100/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrantRole}
                                disabled={actionStatus === 'loading' || actionStatus === 'success'}
                                className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${actionStatus === 'loading' || actionStatus === 'success'
                                        ? 'bg-primary/50 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/80'
                                    }`}
                            >
                                {actionStatus === 'loading' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Granting...
                                    </span>
                                ) : actionStatus === 'success' ? 'Granted!' : 'Grant Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagementSection;
