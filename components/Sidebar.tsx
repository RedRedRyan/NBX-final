"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useMemo } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { useWallet } from "@/lib/context/WalletContext"
import { useCompany } from "@/lib/context/CompanyContext"
import { usePathname, useRouter } from "next/navigation"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { isConnected, account, connect, disconnect, loading: walletLoading, error: walletError } = useWallet()
  const { companies } = useCompany()
  const pathname = usePathname()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const email = user?.email ?? user?.useremail ?? ""
  const emailInitial = email ? email.charAt(0).toUpperCase() : "U"
  const roleLabel = user?.role ?? user?.accountType ?? "User"

  // Check if user was authenticated via ApiClient (has token in localStorage)
  const isApiAuth = typeof window !== 'undefined' && localStorage.getItem('authToken')

  // Get the first company ID for company users
  const companyId = companies?.[0]?._id

  // Navigation items based on user role
  const navItems = useMemo(() => {
    const isCompanyUser = user?.role === 'company'

    if (isCompanyUser && companyId) {
      // Company user navigation
      return [
        { href: `/company/dashboard/${companyId}`, label: "Dashboard", icon: "/icons/market.png" },
        { href: `/company/dashboard/${companyId}/equity/new`, label: "Issue Equity", icon: "/icons/earn.png" },
        { href: `/company/dashboard/${companyId}/bond/new`, label: "Issue Bonds", icon: "/icons/trade.png" },
        { href: "/wallet", label: "Wallet", icon: "/icons/wallet.png" },
      ]
    }

    // Investor user navigation (default)
    return [
      { href: "/markets", label: "Markets", icon: "/icons/market.png" },
      { href: "/trade", label: "Trade", icon: "/icons/trade.png" },
      { href: "/earn", label: "Earn", icon: "/icons/earn.png" },
      { href: "/wallet", label: "Wallet", icon: "/icons/wallet.png" },
    ]
  }, [user?.role, companyId])

  const handleLogout = () => {
    // Check if using API authentication
    if (isApiAuth) {
      // Remove token from localStorage
      localStorage.removeItem('authToken')
      // Redirect to login or home page
      router.push('/login')
    } else if (logout) {
      // Use AuthContext logout if available
      logout()
    }
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50 ${isExpanded ? "w-64" : "w-20"
        }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocusCapture={() => setIsExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsExpanded(false)
        }
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        {isExpanded ? (
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icons/logo.png"
              alt="NBX Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-xl font-bold">NBX</span>
          </Link>
        ) : (
          <Link href="/">
            <Image
              src="/icons/logo.png"
              alt="NBX Home"
              width={32}
              height={32}
              className="rounded"
            />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              {isExpanded ? (
                <span className="font-medium">{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Wallet Connection Status */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`flex-shrink-0 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Wallet Status</p>
              <p className="text-sm font-medium truncate">
                {isConnected ? (
                  <span className="text-green-400">
                    {account?.accountId ? `${account.accountId.slice(0, 8)}...` : 'Connected'}
                  </span>
                ) : (
                  <span className="text-red-400">Not Connected</span>
                )}
              </p>
            </div>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={walletLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${isConnected
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-primary hover:bg-primary/90'
              } ${walletLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {walletLoading ? (
              <span>Connecting...</span>
            ) : isConnected ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                <span>Disconnect</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                </svg>
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        )}
        {isExpanded && walletError && (
          <p className="text-xs text-red-400 mt-1 truncate">{walletError}</p>
        )}
      </div>

      {/* User info and logout if logged in */}
      {user && (
        <div className="border-t border-gray-800">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                {emailInitial}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{email}</p>
                  <p className="text-xs text-gray-400 truncate">{roleLabel}</p>
                </div>
              )}
            </div>
            {isExpanded && (
              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
