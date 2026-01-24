"use client";

import React, { useState } from 'react';
import ATSService from '@/lib/hedera/ATSService';

interface GrantRoleButtonProps {
    securityAddress: string;
    disabled?: boolean;
    onSuccess?: (txId: string) => void;
}

export const GrantRoleButton: React.FC<GrantRoleButtonProps> = ({
    securityAddress,
    disabled = false,
    onSuccess
}) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [targetAccount, setTargetAccount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [txId, setTxId] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const handleGrantRole = async () => {
        if (!targetAccount) {
            setErrorMsg('Please enter a target account ID');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            if (!ATSService.isWalletConnected()) {
                await ATSService.connectWallet();
            }

            // Grant ISSUER_ROLE which is required for minting via issueSecurityTokens
            const result = await ATSService.grantSecurityRole(
                securityAddress,
                targetAccount,
                'ISSUER_ROLE'
            );

            if (result.success && result.transactionId) {
                setStatus('success');
                setTxId(result.transactionId);
                if (onSuccess) onSuccess(result.transactionId);
                setTimeout(() => {
                    setShowModal(false);
                    setStatus('idle');
                    setTargetAccount('');
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to grant role');
            }
        } catch (error: any) {
            console.error('Grant role failed:', error);
            setStatus('error');
            setErrorMsg(error.message || 'Failed to grant role');
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={disabled}
                className={`px-4 py-2 rounded-md font-medium text-white transition-colors
                    ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
            >
                Grant Issuer Role
            </button>

            {/* Modal for entering target account */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-dark-200 border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-4">Grant Issuer Role</h3>
                        <p className="text-light-100 text-sm mb-4">
                            The Issuer Role allows an account to mint (issue) tokens for this security.
                            Only accounts with this role can issue new tokens.
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

                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
                                <p className="text-red-500 text-sm">{errorMsg}</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded p-3 mb-4">
                                <p className="text-green-500 text-sm">Role granted successfully!</p>
                                <p className="text-green-500/70 text-xs mt-1 truncate">TX: {txId}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setStatus('idle');
                                    setErrorMsg('');
                                }}
                                className="flex-1 px-4 py-2 bg-dark-100 border border-border rounded-md text-white hover:bg-dark-100/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrantRole}
                                disabled={status === 'loading' || status === 'success'}
                                className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors
                                    ${status === 'loading' || status === 'success'
                                        ? 'bg-indigo-600/50 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'}
                                `}
                            >
                                {status === 'loading' ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Granting...
                                    </span>
                                ) : status === 'success' ? (
                                    'Granted!'
                                ) : (
                                    'Grant Role'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GrantRoleButton;
