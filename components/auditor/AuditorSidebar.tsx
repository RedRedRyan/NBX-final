"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

const AuditorSidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const email = user?.email ?? user?.useremail ?? "";
  const emailInitial = email ? email.charAt(0).toUpperCase() : "U";
  const roleLabel = (user?.role ?? user?.accountType ?? "Auditor") as string;

  const navItems = useMemo(
    () => [
      { href: "/auditor/dashboard", label: "Dashboard", icon: "/icons/dash.png" },
      { href: "/auditor/kyc", label: "KYC Cases", icon: "/icons/market.png" },
      { href: "/auditor/audit-trail", label: "Audit Trail", icon: "/icons/ex.png" },
      { href: "/auditor/external-lists", label: "External Lists", icon: "/icons/earn.png" },
      { href: "/auditor/reports", label: "Reports", icon: "/icons/wallet.png" },
    ],
    [],
  );

  const handleLogout = () => {
    logout?.();
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen transition-all duration-300",
        isExpanded ? "w-64" : "w-20",
      )}
      style={{
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocusCapture={() => setIsExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsExpanded(false);
        }
      }}
    >
      <div className="flex h-20 items-center justify-center" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        {isExpanded ? (
          <Link href="/auditor/dashboard" className="flex items-center space-x-2">
            <Image src="/icons/logo.png" alt="NBX Logo" width={32} height={32} className="rounded" />
            <span className="text-xl font-bold">NBX</span>
          </Link>
        ) : (
          <Link href="/auditor/dashboard">
            <Image src="/icons/logo.png" alt="NBX Home" width={32} height={32} className="rounded" />
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-2 px-3 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors"
              style={
                isActive
                  ? {
                      backgroundColor: "var(--sidebar-accent)",
                      color: "var(--sidebar-accent-foreground)",
                    }
                  : { color: "var(--sidebar-foreground)" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--sidebar-accent)";
                  e.currentTarget.style.opacity = "0.8";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              <Image src={item.icon} alt={item.label} width={24} height={24} className="flex-shrink-0" />
              {isExpanded ? <span className="font-medium">{item.label}</span> : <span className="sr-only">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {emailInitial}
              </div>
              {isExpanded && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--sidebar-foreground)" }}>
                    {email || "Auditor"}
                  </p>
                  <p className="truncate text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {roleLabel}
                  </p>
                </div>
              )}
            </div>
            {isExpanded && (
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--destructive)",
                  color: "var(--color-light-gray)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AuditorSidebar;

