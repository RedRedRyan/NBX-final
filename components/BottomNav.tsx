"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { useCompany } from "@/lib/context/CompanyContext"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

const BottomNav = () => {
    const { user } = useAuth()
    const { companies } = useCompany()
    const pathname = usePathname()

    // Get the first company ID for company users
    const companyId = companies?.[0]?._id

    const navItems = useMemo(() => {
        const isCompanyUser = user?.role === 'company'

        if (isCompanyUser && companyId) {
            // Company user navigation
            return [
                { href: `/company/dashboard/${companyId}`, label: "Dashboard", icon: "/icons/market.png" },
                { href: `/company/dashboard/${companyId}/equity/new`, label: "Equity", icon: "/icons/earn.png" },
                { href: `/company/dashboard/${companyId}/bond/new`, label: "Bonds", icon: "/icons/trade.png" },
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

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 md:hidden pb-safe">
            <div className="flex items-end justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative group",
                                isActive ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
                            )}
                        >
                            <div
                                className={cn(
                                    "relative transition-all duration-300 ease-out flex items-center justify-center",
                                    isActive ? "-translate-y-4 scale-125" : "translate-y-0"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 rounded-full blur-md opacity-0 transition-opacity duration-300",
                                    isActive ? "bg-blue-500/30 opacity-100" : ""
                                )} />
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    width={24}
                                    height={24}
                                    className={cn(
                                        "relative z-10 transition-all duration-300",
                                        isActive ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : ""
                                    )}
                                />
                            </div>

                            <span className={cn(
                                "text-[10px] font-medium transition-all duration-300 absolute bottom-2",
                                isActive ? "text-blue-500 opacity-100 translate-y-0" : "text-gray-400 opacity-80"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default BottomNav
