import React, { useEffect, useState } from 'react'
import { dAppConnector } from '@/lib/hedera/walletCofig'

interface ConnectButtonProps {
  onAccountConnected?: (accountId: string) => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ onAccountConnected }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initConnector = async () => {
      try {
        await dAppConnector.init({ logger: 'error' })
        
        // Check if already connected
        const sessions = dAppConnector.signers
        if (sessions && sessions.length > 0) {
          setIsConnected(true)
          const accountId = sessions[0].getAccountId()
          const accountIdString = accountId?.toString()
          setAccount(accountIdString || null)
          
          // Notify parent component of existing connection
          if (accountIdString && onAccountConnected) {
            onAccountConnected(accountIdString)
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize connector:', err)
        setError(err?.message || 'Initialization failed')
      }
    }

    initConnector()

    // Setup event listeners
    const handleAccountsChanged = (data: any) => {
      if (data && data.length > 0) {
        const accountIdString = data[0]
        setAccount(accountIdString)
        
        // Notify parent component of account change
        if (onAccountConnected) {
          onAccountConnected(accountIdString)
        }
      }
    }

   

    return () => {
      // Cleanup listeners if needed
    }
  }, [onAccountConnected])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await dAppConnector.openModal()
      
      // Wait for connection
      const checkConnection = setInterval(() => {
        const sessions = dAppConnector.signers
        if (sessions && sessions.length > 0) {
          clearInterval(checkConnection)
          setIsConnected(true)
          const accountId = sessions[0].getAccountId()
          const accountIdString = accountId?.toString()
          setAccount(accountIdString || null)
          setIsLoading(false)
          
          // Notify parent component of new connection
          if (accountIdString && onAccountConnected) {
            onAccountConnected(accountIdString)
          }
        }
      }, 500)

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkConnection)
        if (!isConnected) {
          setIsLoading(false)
          setError('Connection timeout. Please try again.')
        }
      }, 30000)
    } catch (err: any) {
      console.error('Connection failed:', err)
      setError(err?.message || 'Failed to connect wallet')
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await dAppConnector.disconnectAll()
      setIsConnected(false)
      setAccount(null)
      
      // Notify parent component of disconnection
      if (onAccountConnected) {
        onAccountConnected('')
      }
    } catch (err: any) {
      console.error('Disconnect failed:', err)
      setError(err?.message || 'Disconnect failed')
    }
  }

  const formatAccount = (accountId: string | null) => {
    if (!accountId) return ''
    return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`
  }

  return (
    <div className="flex flex-col gap-2">
      {!isConnected ? (
        <button
          type="button"
          onClick={handleConnect}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Connecting...' : 'Connect to Hedera Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm">
            {formatAccount(account)}
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default ConnectButton