"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { usePathname } from "next/navigation"

const Sidebar = () => {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const email = user?.email ?? user?.useremail ?? ""
  const emailInitial = email ? email.charAt(0).toUpperCase() : "U"
  const roleLabel = user?.role ?? user?.accountType ?? "User"

  // Navigation items with icons
  const navItems = [
    { href: "/markets", label: "Markets", icon: "/icons/market.png" },
    { href: "/trade", label: "Trade", icon: "/icons/trade.png" },
    { href: "/earn", label: "Earn", icon: "/icons/earn.png" },
    { href: "/wallet", label: "Wallet", icon: "/icons/wallet.png" },
  ]

  return (
    <aside
      className={`group sticky top-0 flex h-screen flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-[width] duration-300 ease-in-out ${
        isExpanded ? "w-64" : "w-20"
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
      <div className="flex items-center justify-center px-3 py-6">
        {isExpanded ? (
          <Link href="/" className="flex items-center">
            <Image src="/icons/logo.png" alt="logo" width={48} height={48} className="mr-2" />
            <p className="text-4xl font-bold">NBX</p>
          </Link>
        ) : (
          <Link href="/" className="block">
            <Image src="/icons/logo.png" alt="logo" width={28} height={28} />
            <span className="sr-only">NBX Home</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      {user ? (
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <ul className="mt-2 space-y-2" style={{ listStyleType: "none", paddingLeft: 0 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center rounded-lg p-3 transition-colors ${
                      isActive
                        ? "bg-white text-sidebar-primary font-medium"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Image
                      src={item.icon || "/placeholder.svg"}
                      alt={item.label}
                      width={24}
                      height={24}
                      className={isExpanded ? "mr-3" : ""}
                    />
                    {isExpanded ? (
                      <span className="whitespace-nowrap">{item.label}</span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex flex-1 flex-col justify-center px-2">
          <Link
            href="/auth/login"
            className="mb-2 flex items-center justify-center rounded-lg p-3 hover:bg-white/10"
          >
            <img src="/icons/login.png" alt="login" width={24} height={24} />
            {isExpanded ? <span className="ml-3">Login</span> : <span className="sr-only">Login</span>}
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center justify-center rounded-lg bg-white p-3 font-medium text-sidebar-primary"
          >
            <img src="/icons/register.png" alt="register" width={24} height={24} />
            {isExpanded ? <span className="ml-3">Get Started</span> : <span className="sr-only">Get Started</span>}
          </Link>
        </div>
      )}

      {/* User info if logged in */}
      {user && (
        <div className="border-t border-white/20 p-4">
          <div className={`flex items-center ${isExpanded ? "justify-start" : "justify-center"}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ${isExpanded ? "mr-3" : ""}`}>
              <span>{emailInitial}</span>
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="truncate">{email}</p>
                <p className="text-sm text-white/70">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
