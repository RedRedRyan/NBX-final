"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  AuditorEmptyState,
  AuditorErrorState,
  AuditorLoadingState,
} from "@/components/auditor/AuditorStates";

type DemoState = "default" | "loading" | "empty" | "error";

const templates = [
  {
    title: "KYC Decisions",
    description: "Approved/rejected/escalated cases with decision reasons and actor details.",
  },
  {
    title: "Escalations",
    description: "4-eyes workflow cases and turnaround time analysis.",
  },
  {
    title: "List Match Alerts",
    description: "Watchlist/sanctions hits, confidence, and resolution outcomes.",
  },
  {
    title: "Audit Events",
    description: "Append-only event export with correlation ids and hash/checksum columns.",
  },
];

const history = [
  {
    id: "exp_001",
    by: "compliance-admin@nbx",
    when: "2026-03-12 11:04",
    scope: "Last 24h",
    format: "CSV",
    hash: "—",
  },
  {
    id: "exp_000",
    by: "auditor@nbx",
    when: "2026-03-11 16:22",
    scope: "2026-03-01 → 2026-03-10",
    format: "CSV",
    hash: "—",
  },
];

export default function AuditorReportsPage() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("state") ?? "default") as DemoState;

  if (state === "loading") {
    return <AuditorLoadingState title="Loading reports" />;
  }

  if (state === "error") {
    return (
      <AuditorErrorState
        title="Unable to load reports"
        description="Demo error state. Add ?state=default to return."
      />
    );
  }

  if (state === "empty") {
    return <AuditorEmptyState title="No exports found" description="Exports will appear here once generated." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Regulatory exports and report templates (Phase 1 UI).</p>
      </div>

      <section className="rounded-xl border border-border bg-[#111] p-6">
        <h2 className="text-lg font-semibold text-white">Report Templates</h2>
        <p className="text-sm text-muted-foreground">Generate an export scoped by date range and filters.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template.title} className="rounded-xl border border-gray-800 bg-black/30 p-5">
              <p className="text-sm font-semibold text-white">{template.title}</p>
              <p className="mt-2 text-sm text-gray-500">{template.description}</p>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90"
              >
                Export
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-[#111]">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Export History</h2>
          <p className="text-sm text-muted-foreground">Includes checksum/hash placeholder (Phase 1).</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/40 text-xs uppercase tracking-[0.14em] text-gray-400">
              <tr>
                <th className="px-6 py-3">Export</th>
                <th className="px-6 py-3">By</th>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Scope</th>
                <th className="px-6 py-3">Format</th>
                <th className="px-6 py-3">Checksum</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} className="border-t border-gray-900 hover:bg-black/30">
                  <td className="px-6 py-4 font-semibold text-white">{row.id}</td>
                  <td className="px-6 py-4 text-gray-200">{row.by}</td>
                  <td className="px-6 py-4 text-gray-200">{row.when}</td>
                  <td className="px-6 py-4 text-gray-200">{row.scope}</td>
                  <td className="px-6 py-4 text-gray-200">{row.format}</td>
                  <td className="px-6 py-4 text-gray-400">{row.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

