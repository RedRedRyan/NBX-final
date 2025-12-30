"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useWallet } from '@/lib/context/WalletContext';
import { ApiClient } from '@/lib/api/client';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const { account, isConnected } = useWallet();

  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('KESy_TESTNET');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTokens = [
    { value: 'KESy_TESTNET', label: 'KESy (Kenyan Shilling)', currency: 'KES' }
  ];

  const paymentMethods = [
    { id: 'mobile_money', name: 'M-Pesa', icon: '📱' },
    { id: 'card', name: 'Card Payment', icon: '💳' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' }
  ];

  const handleNextStep = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const generateOrderId = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Validate M-Pesa number format (Kenyan phone number)
  const validateMpesaNumber = (number: string): boolean => {
    // Remove any spaces or special characters
    const cleaned = number.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    // Valid formats: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX, 2547XXXXXXXX
    const regex = /^(?:\+?254|0)[17]\d{8}$/;
    return regex.test(cleaned);
  };

  // Format phone number for API
  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    return cleaned;
  };

  const handleConfirmDeposit = async () => {
    if (!user || !token) {
      setError('Please log in to continue');
      return;
    }

    if (!isConnected || !account) {
      setError('Please connect your Hedera wallet first');
      return;
    }

    // Validate M-Pesa number if M-Pesa is selected
    if (paymentMethod === 'mobile_money') {
      if (!mpesaNumber) {
        setError('Please enter your M-Pesa phone number');
        return;
      }
      if (!validateMpesaNumber(mpesaNumber)) {
        setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
        return;
      }
    }

    try {
      setError('');
      setIsLoading(true);
      const orderId = generateOrderId();

      // Prepare payment initialization data
      const paymentData: any = {
        token: selectedToken as 'KESy_TESTNET',
        amount: parseFloat(amount),
        email: user.email || user.useremail,
        currency: 'KES' as const,
        metadata: {
          orderID: orderId
        },
        crypto_account: account.accountId,
        channels: [paymentMethod]
      };

      // Add phone number for M-Pesa
      if (paymentMethod === 'mobile_money' && mpesaNumber) {
        paymentData.phone_number = formatPhoneNumber(mpesaNumber);
      }

      // Initialize payment via API
      const response = await ApiClient.initializeOnramp(paymentData, token);

      if (response.success && response.authorization_url) {
        // Redirect user to payment page
        window.location.href = response.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Failed to initialize deposit');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep(1);
      setAmount('');
      setMpesaNumber('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Deposit Funds</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-light-200 hover:text-light-100 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-between mb-8">
            <div className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-dark-300' : 'bg-dark-200 text-light-200'
                }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-primary' : 'bg-dark-200'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-dark-300' : 'bg-dark-200 text-light-200'
                }`}>
                2
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Amount and Token Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Token</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full bg-dark-200 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                >
                  {availableTokens.map(token => (
                    <option key={token.value} value={token.value}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full bg-dark-200 border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-4 top-3 text-light-200">KES</span>
                </div>
                <p className="text-xs text-light-200 mt-2">
                  Minimum: 100 KES • Maximum: 1,000,000 KES
                </p>
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 10000].map(quickAmount => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 bg-dark-200 hover:bg-dark-300 border border-border rounded-lg text-sm transition-colors"
                  >
                    {quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextStep}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Payment Method and Confirmation */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Deposit Summary */}
              <div className="bg-dark-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-light-200">Token:</span>
                  <span className="font-medium">
                    {availableTokens.find(t => t.value === selectedToken)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-200">Amount:</span>
                  <span className="font-medium">{parseFloat(amount).toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-light-200">You will receive:</span>
                  <span className="font-medium text-primary">
                    ~{parseFloat(amount).toLocaleString()} KESy
                  </span>
                </div>
                {account && (
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-light-200">To account:</span>
                    <span className="font-mono text-xs">{account.accountId}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Payment Method</label>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border transition-colors flex items-center space-x-3 ${paymentMethod === method.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-dark-200 hover:border-primary/50'
                        }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                      {paymentMethod === method.id && (
                        <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* M-Pesa Phone Number Input */}
              {paymentMethod === 'mobile_money' && (
                <div>
                  <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-light-200">🇰🇪</span>
                    <input
                      type="tel"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      placeholder="0712345678"
                      className="w-full bg-dark-200 border border-border rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-xs text-light-200 mt-2">
                    Enter the phone number registered with M-Pesa. You will receive an STK push.
                  </p>
                </div>
              )}

              {/* Wallet Connection Warning */}
              {!isConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-3 rounded-lg text-sm">
                  ⚠️ Please connect your Hedera wallet to continue
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-dark-200 text-white border border-border rounded-lg hover:bg-dark-300 font-medium transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDeposit}
                  disabled={isLoading || !isConnected}
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
              </div>

              {/* Info Notice */}
              <div className="bg-dark-200 border border-border rounded-lg p-3 text-xs text-light-200">
                <p className="font-medium mb-1">ℹ️ What happens next:</p>
                <ul className="space-y-1 ml-4">
                  <li>• You'll be redirected to complete payment</li>
                  <li>• Tokens will be sent to your connected wallet</li>
                  <li>• Transaction typically completes in 2-5 minutes</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;

