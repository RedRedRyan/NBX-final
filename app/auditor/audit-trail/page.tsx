"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuditorStatusBadge from "@/components/auditor/AuditorStatusBadge";
import {
  AuditorEmptyState,
  AuditorErrorState,
  AuditorLoadingState,
} from "@/components/auditor/AuditorStates";
import { cn } from "@/lib/utils";

type DemoState = "default" | "loading" | "empty" | "error";

type AuditEvent = {
  id: string;
  eventType: string;
  actorId: string;
  actorRole: string;
  entityType: string;
  entityId: string;
  correlationId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: string;
  eventHash?: string;
};

const demoEvents: AuditEvent[] = [
  {
    id: "evt_01HVK9Q0",
    eventType: "kyc.escalated",
    actorId: "compliance-admin@nbx",
    actorRole: "compliance_admin",
    entityType: "kyc_case",
    entityId: "KYC-10468",
    correlationId: "req_7d3f2f9c",
    before: { status: "in_review" },
    after: { status: "escalated", requiresFourEyes: true, reason: "Manual escalation" },
    createdAt: "2026-03-12T10:58:00Z",
    eventHash: "hash_placeholder",
  },
  {
    id: "evt_01HVK8X7",
    eventType: "rule.updated",
    actorId: "compliance-admin@nbx",
    actorRole: "compliance_admin",
    entityType: "match_rules",
    entityId: "default",
    correlationId: "req_a1c89041",
    before: { fuzzyThreshold: 0.82 },
    after: { fuzzyThreshold: 0.86, aliasMatching: true },
    createdAt: "2026-03-12T10:22:00Z",
    eventHash: "hash_placeholder",
  },
  {
    id: "evt_01HVK7M2",
    eventType: "list.match",
    actorId: "screening-service",
    actorRole: "service",
    entityType: "kyc_case",
    entityId: "KYC-10492",
    correlationId: "req_5a4c11aa",
    before: { hasListMatch: false },
    after: { hasListMatch: true, listMatchCount: 1 },
    createdAt: "2026-03-12T09:12:00Z",
    eventHash: "hash_placeholder",
  },
];

export default function AuditorAuditTrailPage() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("state") ?? "default") as DemoState;

  const [eventType, setEventType] = useState<string>("all");
  const [actor, setActor] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("all");
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const rows = useMemo(() => {
    return demoEvents.filter((row) => {
      if (eventType !== "all" && row.eventType !== eventType) return false;
      if (entityType !== "all" && row.entityType !== entityType) return false;
      if (actor.trim() && !row.actorId.toLowerCase().includes(actor.trim().toLowerCase())) return false;
      return true;
    });
  }, [eventType, actor, entityType]);

  if (state === "loading") {
    return <AuditorLoadingState title="Loading audit trail" />;
  }

  if (state === "error") {
    return (
      <AuditorErrorState
        title="Unable to load audit events"
        description="Demo error state. Add ?state=default to return to the event explorer."
      />
    );
  }

  if (state === "empty") {
    return (
      <AuditorEmptyState
        title="No events match your filters"
        description="Try clearing filters or widening the date range."
        action={
          <Link
            href="/auditor/audit-trail"
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
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Append-only event explorer with drill-down details and export-ready integrity fields.
          </p>
        </div>
        <Link
          href="/auditor/reports"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-dark-100 px-4 py-2 text-sm font-semibold text-white hover:border-primary/60"
        >
          Exports & reports
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-xl border border-border bg-[#111] p-5">
          <p className="text-sm font-semibold text-white">Filters</p>
          <p className="text-xs text-gray-500">Phase 1 UI only</p>

          <div className="mt-4 space-y-3">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Event type: all</option>
              <option value="kyc.escalated">kyc.escalated</option>
              <option value="rule.updated">rule.updated</option>
              <option value="list.match">list.match</option>
            </select>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-gray-200"
            >
              <option value="all">Entity type: all</option>
              <option value="kyc_case">kyc_case</option>
              <option value="match_rules">match_rules</option>
            </select>
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Actor (user/service)"
              className="w-full rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="rounded-lg border border-gray-800 bg-black/30 p-3 text-xs text-gray-400">
              Exports include `eventHash` (placeholder in Phase 1).
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-xl border border-border bg-[#111]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Events</p>
              <p className="text-xs text-gray-500">{rows.length} results</p>
            </div>
            {selected && (
              <button
                type="button"
                className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-xs font-semibold text-gray-200 hover:border-primary/50"
                onClick={() => setSelected(null)}
              >
                Close detail
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/40 text-xs uppercase tracking-[0.14em] text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Entity</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "cursor-pointer border-t border-gray-900 hover:bg-black/30",
                        selected?.id === row.id && "bg-black/40",
                      )}
                      onClick={() => setSelected(row)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{row.eventType}</p>
                        <p className="text-xs text-gray-500">{row.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{row.actorId}</p>
                        <p className="text-xs text-gray-500">{row.actorRole}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-200">
                        <p className="font-semibold text-white">{row.entityId}</p>
                        <p className="text-xs text-gray-500">{row.entityType}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-200">{new Date(row.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <AuditorStatusBadge status={row.eventHash ? "active" : "disabled"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-900 p-5 lg:border-l lg:border-t-0">
              {!selected ? (
                <div className="rounded-lg border border-gray-800 bg-black/30 p-4 text-sm text-gray-300">
                  Select an event to view details.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Event detail</p>
                    <p className="mt-2 text-sm font-semibold text-white">{selected.eventType}</p>
                    <p className="mt-1 text-xs text-gray-500">{selected.id}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                        {selected.actorRole}
                      </span>
                      <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                        {selected.entityType}
                      </span>
                    </div>
                    <div className="mt-4 space-y-1 text-xs text-gray-300">
                      <p>
                        <span className="text-gray-500">Actor:</span> {selected.actorId}
                      </p>
                      <p>
                        <span className="text-gray-500">Entity:</span> {selected.entityId}
                      </p>
                      <p>
                        <span className="text-gray-500">Correlation:</span> {selected.correlationId ?? "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Event hash:</span> {selected.eventHash ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Before</p>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-gray-800 bg-black/40 p-3 text-xs text-gray-200">
                      {JSON.stringify(selected.before ?? {}, null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">After</p>
                    <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-gray-800 bg-black/40 p-3 text-xs text-gray-200">
                      {JSON.stringify(selected.after ?? {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

