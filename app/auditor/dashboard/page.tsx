"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuditorKpiCard from "@/components/auditor/AuditorKpiCard";
import {
  AuditorEmptyState,
  AuditorErrorState,
  AuditorLoadingState,
} from "@/components/auditor/AuditorStates";
import AuditorStatusBadge from "@/components/auditor/AuditorStatusBadge";

type DemoState = "default" | "loading" | "empty" | "error";

const demoKpis = [
  { label: "Pending KYC Reviews", value: "42", note: "Across all queues" },
  { label: "Escalated Cases (24h)", value: "7", note: "4-eyes required" },
  { label: "List Matches (24h)", value: "13", note: "New alerts" },
  { label: "Audit Events Logged (24h)", value: "1,248", note: "Append-only feed" },
  { label: "SLA Breaches", value: "3", note: "Overdue cases" },
];

const demoKycRows = [
  { id: "KYC-10492", applicant: "Amina K.", status: "in_review", age: "5h", assigned: "J. Otieno" },
  { id: "KYC-10481", applicant: "Kibera Trading Ltd", status: "pending", age: "19h", assigned: "Unassigned" },
  { id: "KYC-10468", applicant: "Nairobi Growth Co", status: "escalated", age: "1d 4h", assigned: "M. Wanjiku" },
  { id: "KYC-10440", applicant: "Samuel M.", status: "pending", age: "2d 3h", assigned: "Unassigned" },
];

const demoEvents = [
  { type: "kyc.escalated", actor: "compliance-admin@nbx", time: "12m ago", entity: "KYC-10468" },
  { type: "rule.updated", actor: "compliance-admin@nbx", time: "48m ago", entity: "match_rules" },
  { type: "list.match", actor: "screening-service", time: "1h ago", entity: "KYC-10492" },
  { type: "kyc.approved", actor: "regulator@nbx", time: "3h ago", entity: "KYC-10412" },
];

const demoMatches = [
  { name: "Kenya Blocked Entities", matched: "Kibera Trading Ltd", status: "open", confidence: "high" },
  { name: "Internal Watchlist", matched: "Samuel M.", status: "open", confidence: "medium" },
  { name: "Sanctions (Provider A)", matched: "Amina K.", status: "cleared", confidence: "low" },
];

export default function AuditorDashboardPage() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("state") ?? "default") as DemoState;

  if (state === "loading") {
    return <AuditorLoadingState title="Loading dashboard" />;
  }

  if (state === "error") {
    return (
      <AuditorErrorState
        title="Unable to load dashboard"
        description="Demo error state. Add ?state=default to return to the dashboard."
      />
    );
  }

  if (state === "empty") {
    return (
      <AuditorEmptyState
        title="No activity for this date range"
        description="Try widening the date range or searching by case id."
        action={
          <Link
            href="/auditor/dashboard"
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Auditor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor KYC decisions, screening matches, and audit integrity.
          </p>
        </div>
        <Link
          href="/auditor/audit-trail"
          className="hidden items-center justify-center rounded-lg border border-border bg-dark-100 px-4 py-2 text-sm font-semibold text-white hover:border-primary/60 sm:inline-flex"
        >
          Open Audit Trail
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {demoKpis.map((kpi) => (
          <AuditorKpiCard key={kpi.label} label={kpi.label} value={kpi.value} note={kpi.note} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-[#111] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">KYC Queue Snapshot</h2>
              <p className="text-sm text-muted-foreground">Top pending and escalated cases by age</p>
            </div>
            <Link href="/auditor/kyc" className="text-sm font-semibold text-primary hover:text-primary/80">
              View queue
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {demoKycRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 bg-black/30 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{row.id}</p>
                  <p className="text-xs text-gray-400">{row.applicant}</p>
                </div>
                <div className="flex items-center gap-3">
                  <AuditorStatusBadge status={row.status as any} />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Age</p>
                    <p className="text-sm font-semibold text-white">{row.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Owner</p>
                    <p className="text-sm font-semibold text-white">{row.assigned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <section className="rounded-xl border border-border bg-[#111] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">List Match Alerts</h2>
                <p className="text-sm text-muted-foreground">Newest watchlist/sanctions hits</p>
              </div>
              <Link href="/auditor/external-lists" className="text-sm font-semibold text-primary hover:text-primary/80">
                Manage lists
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {demoMatches.map((match) => (
                <div
                  key={`${match.name}-${match.matched}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 bg-black/30 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{match.matched}</p>
                    <p className="text-xs text-gray-400">{match.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AuditorStatusBadge status={match.status as any} />
                    <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                      {match.confidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-[#111] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent Audit Events</h2>
                <p className="text-sm text-muted-foreground">Latest actions across compliance modules</p>
              </div>
              <Link href="/auditor/audit-trail" className="text-sm font-semibold text-primary hover:text-primary/80">
                Explore
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {demoEvents.map((event) => (
                <div
                  key={`${event.type}-${event.time}-${event.entity}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-800 bg-black/30 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{event.type}</p>
                    <p className="text-xs text-gray-400">
                      {event.actor} · {event.entity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-300">{event.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-[#111] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Audit Timeline</h2>
            <p className="text-sm text-muted-foreground">Compact view of the append-only stream</p>
          </div>
          <Link href="/auditor/audit-trail" className="text-sm font-semibold text-primary hover:text-primary/80">
            Open explorer
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {demoEvents.slice(0, 3).map((event) => (
            <div key={event.type} className="rounded-lg border border-gray-800 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Event</p>
              <p className="mt-2 text-sm font-semibold text-white">{event.type}</p>
              <p className="mt-1 text-xs text-gray-400">{event.actor}</p>
              <p className="mt-3 text-xs font-semibold text-gray-300">{event.time}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

