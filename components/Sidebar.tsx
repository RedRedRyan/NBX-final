"use client"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/context/AuthContext"
import { usePathname } from "next/navigation"

const Sidebar = () => {
  const { user } = useAuth()
  const pathname = usePathname()

  // Navigation items with icons
  const navItems = [
    { href: "/markets", label: "Markets", icon: "/icons/market.png" },
    { href: "/trade", label: "Trade", icon: "/icons/trade.png" },
    { href: "/earn", label: "Earn", icon: "/icons/earn.png" },
    { href: "/wallet", label: "Wallet", icon: "/icons/wallet.png" },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-1/6 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center md:justify-start justify-center">
        <Link href="/" className="flex items-center md:justify-start justify-center">
          <Image src="/icons/logo.png" alt="logo" width={64} height={64} className="md:mr-2" />
          <p className="text-6xl font-bold md:inline hidden">NBX</p>
        </Link>
      </div>

      {/* Navigation */}
      {user ? (
        <nav className="flex-1 p-4">
          <ul className="space-y-2 mt-2" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors md:justify-start justify-center ${
                      isActive ? "bg-white text-sidebar-primary font-medium text-left" : "hover:bg-white/10"
                    }`}
                  >
                    <Image
                      src={item.icon || "/placeholder.svg"}
                      alt={item.label}
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    <span className="md:inline hidden">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex-1 p-4 flex flex-col justify-center">
          <Link href="/auth/login" className="flex items-center p-3 mb-2 rounded-lg hover:bg-white/10 md:justify-start justify-center">
            <img src='/icons/login.png' alt="login"/>
            <span className="md:inline hidden">Login</span>
          </Link>
          <Link
            href="/auth/signup"
            className="flex items-center p-3 rounded-lg bg-white text-sidebar-primary font-medium md:justify-start justify-center"
          >
            <img src='/icons/register.png' alt="register"/>
            <span className="md:inline hidden">Get Started</span>
          </Link>
        </div>
      )}

      {/* User info if logged in */}
      {user && (
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center md:justify-start justify-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center md:mr-3">
              <span>{user.email.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden md:block hidden">
              <p className="truncate">{user.email}</p>
              <p className="text-sm text-white/70">{user.accountType || "User"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
