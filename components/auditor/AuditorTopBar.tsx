"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/AuthContext";

const quickLinks = [
  { href: "/auditor/dashboard", label: "Dashboard" },
  { href: "/auditor/kyc", label: "KYC Cases" },
  { href: "/auditor/audit-trail", label: "Audit Trail" },
  { href: "/auditor/external-lists", label: "External Lists" },
  { href: "/auditor/reports", label: "Reports" },
];

export default function AuditorTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const role = (user?.role ?? user?.accountType ?? "auditor") as string;
  const canCreateAlertRule = role === "compliance_admin";

  const activeLabel = useMemo(() => {
    const found = quickLinks.find((link) => pathname === link.href);
    return found?.label ?? "Auditor";
  }, [pathname]);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="sticky top-0 z-40 rounded-xl border border-border bg-black/60 p-4 backdrop-blur-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Auditor Console
            </p>
            <p className="text-sm font-semibold text-white">{activeLabel}</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => router.push(`${pathname}?state=loading`)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => router.push(`${pathname}?state=empty`)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => router.push(`${pathname}?state=error`)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
            >
              Error
            </button>
          </div>
        </div>

        <form onSubmit={submitSearch} className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-800 bg-black/40 px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3m1.8-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case id, account id, email, tx hash, correlation id"
              className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className={cn(
                "rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-black hover:bg-primary/90",
                !query.trim() && "opacity-70",
              )}
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px]">
            <DatePicker value={fromDate} onChange={setFromDate} placeholder="From" />
            <DatePicker value={toDate} onChange={setToDate} placeholder="To" minDate={fromDate || undefined} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-primary/50"
              onClick={() => router.push("/auditor/reports")}
            >
              Export
            </button>
            {canCreateAlertRule && (
              <button
                type="button"
                className="hidden rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary/90 sm:inline-flex"
                onClick={() => router.push("/auditor/external-lists")}
              >
                Create Alert Rule
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <button
              key={link.href}
              type="button"
              onClick={() => router.push(link.href)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                active
                  ? "border-primary/70 bg-primary/15 text-primary"
                  : "border-gray-800 bg-black/30 text-gray-300 hover:border-primary/40 hover:text-primary",
              )}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
