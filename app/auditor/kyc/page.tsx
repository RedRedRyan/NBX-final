"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import AuditorStatusBadge from "@/components/auditor/AuditorStatusBadge";
import {
  AuditorEmptyState,
  AuditorErrorState,
  AuditorLoadingState,
} from "@/components/auditor/AuditorStates";
import { cn } from "@/lib/utils";

type DemoState = "default" | "loading" | "empty" | "error";

type KycStatus = "pending" | "in_review" | "approved" | "rejected" | "escalated";

type KycCase = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  hederaAccountId?: string;
  type: "individual" | "business";
  country: string;
  status: KycStatus;
  assignedTo?: string;
  submittedAt: string;
  updatedAt: string;
  slaDueAt?: string;
  requiresFourEyes?: boolean;
  requiresFourEyesReason?: string;
  hasListMatch: boolean;
  listMatchCount?: number;
  riskScore?: number;
};

const demoCases: KycCase[] = [
  {
    id: "KYC-10492",
    applicantName: "Amina K.",
    applicantEmail: "amina.k@example.com",
    hederaAccountId: "0.0.418302",
    type: "individual",
    country: "KE",
    status: "in_review",
    assignedTo: "J. Otieno",
    submittedAt: "2026-03-11T08:12:00Z",
    updatedAt: "2026-03-12T09:21:00Z",
    slaDueAt: "2026-03-13T08:12:00Z",
    hasListMatch: true,
    listMatchCount: 1,
    riskScore: 63,
  },
  {
    id: "KYC-10481",
    applicantName: "Kibera Trading Ltd",
    applicantEmail: "ops@kiberatrading.co.ke",
    type: "business",
    country: "KE",
    status: "pending",
    assignedTo: undefined,
    submittedAt: "2026-03-11T03:54:00Z",
    updatedAt: "2026-03-11T03:54:00Z",
    slaDueAt: "2026-03-12T03:54:00Z",
    hasListMatch: true,
    listMatchCount: 2,
    requiresFourEyes: true,
    requiresFourEyesReason: "Name similarity to internal blocked entities list.",
  },
  {
    id: "KYC-10468",
    applicantName: "Nairobi Growth Co",
    applicantEmail: "kyc@nairobi-growth.example",
    type: "business",
    country: "UG",
    status: "escalated",
    assignedTo: "M. Wanjiku",
    submittedAt: "2026-03-10T06:15:00Z",
    updatedAt: "2026-03-12T06:45:00Z",
    slaDueAt: "2026-03-12T06:15:00Z",
    hasListMatch: false,
    listMatchCount: 0,
  },
  {
    id: "KYC-10412",
    applicantName: "Samuel M.",
    applicantEmail: "samuel.m@example.com",
    hederaAccountId: "0.0.510990",
    type: "individual",
    country: "TZ",
    status: "approved",
    assignedTo: "J. Otieno",
    submittedAt: "2026-03-09T10:05:00Z",
    updatedAt: "2026-03-10T14:52:00Z",
    hasListMatch: false,
    listMatchCount: 0,
    riskScore: 22,
  },
];

function capabilitiesForRole(role: string) {
  if (role === "compliance_admin") {
    return { canDecideKyc: true, canManageLists: true };
  }
  if (role === "regulator_analyst") {
    return { canDecideKyc: true, canManageLists: false };
  }
  return { canDecideKyc: false, canManageLists: false };
}

export default function AuditorKycPage() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("state") ?? "default") as DemoState;
  const { user } = useAuth();

  const role = (user?.role ?? user?.accountType ?? "auditor") as string;
  const caps = capabilitiesForRole(role);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCase = useMemo(
    () => demoCases.find((row) => row.id === selectedId) ?? null,
    [selectedId],
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [watchlistFilter, setWatchlistFilter] = useState<string>("all");

  const rows = useMemo(() => {
    return demoCases.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (countryFilter !== "all" && row.country !== countryFilter) return false;
      if (watchlistFilter === "yes" && !row.hasListMatch) return false;
      if (watchlistFilter === "no" && row.hasListMatch) return false;
      return true;
    });
  }, [statusFilter, typeFilter, countryFilter, watchlistFilter]);

  if (state === "loading") {
    return <AuditorLoadingState title="Loading KYC cases" />;
  }

  if (state === "error") {
    return (
      <AuditorErrorState
        title="Unable to load KYC queue"
        description="Demo error state. Add ?state=default to return to the queue."
      />
    );
  }

  if (state === "empty") {
    return (
      <AuditorEmptyState
        title="No KYC cases match your filters"
        description="Try clearing filters or widening the date range."
        action={
          <Link
            href="/auditor/kyc"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90"
          >
            Reset filters
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">KYC Cases</h1>
          <p className="text-sm text-muted-foreground">
            Queue view and case review. Decisions write-through to the audit trail.
          </p>
        </div>
        <Link
          href="/auditor/audit-trail"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-dark-100 px-4 py-2 text-sm font-semibold text-white hover:border-primary/60"
        >
          View audit trail
        </Link>
      </div>

      <section className="rounded-xl border border-border bg-[#111] p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Status: all</option>
              <option value="pending">pending</option>
              <option value="in_review">in_review</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="escalated">escalated</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Type: all</option>
              <option value="individual">individual</option>
              <option value="business">business</option>
            </select>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Country: all</option>
              <option value="KE">KE</option>
              <option value="UG">UG</option>
              <option value="TZ">TZ</option>
            </select>
            <select
              value={watchlistFilter}
              onChange={(e) => setWatchlistFilter(e.target.value)}
              className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Watchlist: all</option>
              <option value="yes">has match</option>
              <option value="no">no match</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="rounded-full border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-300">
              Role: <span className="text-white">{role}</span>
            </div>
            <button
              type="button"
              disabled={!caps.canDecideKyc}
              className={cn(
                "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
              )}
              title={caps.canDecideKyc ? "Assign a reviewer (Phase 1 mock)" : "Read-only role"}
            >
              Assign reviewer
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-[#111]">
          <div className="border-b border-gray-800 px-5 py-4">
            <p className="text-sm font-semibold text-white">Queue</p>
            <p className="text-xs text-gray-500">Click a row to open case details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/40 text-xs uppercase tracking-[0.14em] text-gray-400">
                <tr>
                  <th className="px-5 py-3">Case</th>
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Matches</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-t border-gray-900 hover:bg-black/30",
                      selectedId === row.id && "bg-black/40",
                    )}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="px-5 py-4 font-semibold text-white">{row.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{row.applicantName}</p>
                      <p className="text-xs text-gray-500">{row.applicantEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-200">{row.country}</td>
                    <td className="px-5 py-4">
                      {row.hasListMatch ? (
                        <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
                          {row.listMatchCount ?? 1} match
                        </span>
                      ) : (
                        <span className="rounded-full border border-gray-500/40 bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-200">
                          none
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AuditorStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-200">{row.assignedTo ?? "Unassigned"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(row.id);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={!caps.canDecideKyc || row.status === "approved" || row.status === "rejected"}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={(e) => e.stopPropagation()}
                          title={caps.canDecideKyc ? "Phase 1 mock action" : "Read-only role"}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={!caps.canDecideKyc || row.status === "approved" || row.status === "rejected"}
                          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={(e) => e.stopPropagation()}
                          title={caps.canDecideKyc ? "Phase 1 mock action" : "Read-only role"}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-[#111] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Case Detail</p>
              <p className="text-xs text-gray-500">Drawer-style panel (Phase 1)</p>
            </div>
            {selectedCase && (
              <button
                type="button"
                className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
                onClick={() => setSelectedId(null)}
              >
                Close
              </button>
            )}
          </div>

          {!selectedCase ? (
            <div className="mt-6 rounded-lg border border-gray-800 bg-black/30 p-4 text-sm text-gray-300">
              Select a case to view details.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {(selectedCase.status === "escalated" || selectedCase.requiresFourEyes) && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200">
                  Second approval required (4-eyes).{" "}
                  {selectedCase.requiresFourEyesReason ? (
                    <span className="text-red-300">Reason: {selectedCase.requiresFourEyesReason}</span>
                  ) : null}
                </div>
              )}

              <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Summary</p>
                <p className="mt-2 text-lg font-semibold text-white">{selectedCase.applicantName}</p>
                <p className="text-sm text-gray-400">{selectedCase.applicantEmail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AuditorStatusBadge status={selectedCase.status} />
                  <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                    {selectedCase.type}
                  </span>
                  <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                    {selectedCase.country}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Decision</p>
                <div className="mt-3 space-y-3">
                  <textarea
                    placeholder="Decision reason (required for reject/escalate)"
                    className="min-h-[88px] w-full rounded-lg border border-gray-800 bg-black/40 p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    disabled={!caps.canDecideKyc}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-200">
                      <input type="checkbox" checked={!!selectedCase.requiresFourEyes} onChange={() => {}} disabled={!caps.canDecideKyc} />
                      Requires 4-eyes
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!caps.canDecideKyc}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={!caps.canDecideKyc}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={!caps.canDecideKyc}
                        className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>
                  {!caps.canDecideKyc && (
                    <p className="text-xs text-gray-500">
                      Read-only mode. Compliance Admin and Regulator Analyst can take actions.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Evidence</p>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {["ID document", "Proof of address", "Selfie verification"].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/40 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-500">Preview placeholder (Phase 1)</p>
                      </div>
                      <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                        queued
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

