"use client";

import React, { useMemo, useState } from "react";
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

type ExternalListSource = {
  id: string;
  name: string;
  type: "sanctions" | "pep" | "internal_blocked" | "internal_geo" | "other";
  status: "active" | "disabled";
  lastSyncAt?: string;
  nextSyncAt?: string;
  totalRecords: number;
};

const demoSources: ExternalListSource[] = [
  {
    id: "src_001",
    name: "Internal Blocked Entities",
    type: "internal_blocked",
    status: "active",
    lastSyncAt: "2026-03-12T09:00:00Z",
    nextSyncAt: "2026-03-12T21:00:00Z",
    totalRecords: 143,
  },
  {
    id: "src_002",
    name: "Sanctions (Provider A)",
    type: "sanctions",
    status: "disabled",
    lastSyncAt: "2026-03-05T10:00:00Z",
    nextSyncAt: undefined,
    totalRecords: 50212,
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

export default function AuditorExternalListsPage() {
  const searchParams = useSearchParams();
  const state = (searchParams.get("state") ?? "default") as DemoState;
  const { user } = useAuth();

  const role = (user?.role ?? user?.accountType ?? "auditor") as string;
  const caps = capabilitiesForRole(role);

  const [tab, setTab] = useState<"sources" | "records" | "rules">("sources");
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const selectedSource = useMemo(
    () => demoSources.find((row) => row.id === selectedSourceId) ?? null,
    [selectedSourceId],
  );

  if (state === "loading") {
    return <AuditorLoadingState title="Loading external lists" />;
  }

  if (state === "error") {
    return (
      <AuditorErrorState
        title="Unable to load list sources"
        description="Demo error state. Add ?state=default to return."
      />
    );
  }

  if (state === "empty") {
    return (
      <AuditorEmptyState
        title="No list sources configured"
        description="Add an internal list source to start screening."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Lists</h1>
          <p className="text-sm text-muted-foreground">
            Pluggable sources, internal records, and match rule tuning (Phase 1 UI).
          </p>
        </div>
        <button
          type="button"
          disabled={!caps.canManageLists}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          title={caps.canManageLists ? "Phase 1 mock action" : "Read-only role"}
        >
          Add source
        </button>
      </div>

      <section className="rounded-xl border border-border bg-[#111] p-2">
        <div className="flex flex-wrap gap-2 p-3">
          {[
            { key: "sources", label: "Sources" },
            { key: "records", label: "Records" },
            { key: "rules", label: "Match Rules" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as any)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                tab === item.key
                  ? "border-primary/70 bg-primary/15 text-primary"
                  : "border-gray-800 bg-black/30 text-gray-300 hover:border-primary/40 hover:text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-auto rounded-full border border-gray-800 bg-black/30 px-4 py-2 text-xs font-semibold text-gray-300">
            Role: <span className="text-white">{role}</span>
          </div>
        </div>
      </section>

      {tab === "sources" && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-[#111]">
            <div className="border-b border-gray-800 px-5 py-4">
              <p className="text-sm font-semibold text-white">List Sources</p>
              <p className="text-xs text-gray-500">Enable/disable, sync status, and metadata</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-black/40 text-xs uppercase tracking-[0.14em] text-gray-400">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Last sync</th>
                    <th className="px-5 py-3">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {demoSources.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "cursor-pointer border-t border-gray-900 hover:bg-black/30",
                        selectedSourceId === row.id && "bg-black/40",
                      )}
                      onClick={() => setSelectedSourceId(row.id)}
                    >
                      <td className="px-5 py-4 font-semibold text-white">{row.name}</td>
                      <td className="px-5 py-4 text-gray-200">{row.type}</td>
                      <td className="px-5 py-4">
                        <AuditorStatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-4 text-gray-200">
                        {row.lastSyncAt ? new Date(row.lastSyncAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-200">{row.totalRecords.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[#111] p-5">
            <p className="text-sm font-semibold text-white">Source Detail</p>
            <p className="text-xs text-gray-500">Config placeholders (Phase 1)</p>

            {!selectedSource ? (
              <div className="mt-5 rounded-lg border border-gray-800 bg-black/30 p-4 text-sm text-gray-300">
                Select a source to view its configuration.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Overview</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedSource.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AuditorStatusBadge status={selectedSource.status} />
                    <span className="rounded-full border border-gray-800 bg-black/40 px-3 py-1 text-xs font-semibold text-gray-200">
                      {selectedSource.type}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1 text-xs text-gray-300">
                    <p>
                      <span className="text-gray-500">Last sync:</span>{" "}
                      {selectedSource.lastSyncAt ? new Date(selectedSource.lastSyncAt).toLocaleString() : "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Next sync:</span>{" "}
                      {selectedSource.nextSyncAt ? new Date(selectedSource.nextSyncAt).toLocaleString() : "—"}
                    </p>
                    <p>
                      <span className="text-gray-500">Total records:</span>{" "}
                      {selectedSource.totalRecords.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Actions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!caps.canManageLists}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sync now
                    </button>
                    <button
                      type="button"
                      disabled={!caps.canManageLists}
                      className="rounded-lg border border-gray-800 bg-black/40 px-3 py-2 text-sm font-semibold text-gray-200 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={!caps.canManageLists}
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Disable
                    </button>
                  </div>
                  {!caps.canManageLists && (
                    <p className="mt-3 text-xs text-gray-500">Read-only mode: list configuration is restricted.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "records" && (
        <section className="rounded-xl border border-border bg-[#111] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">List Records</p>
              <p className="text-xs text-gray-500">Search and inspect internal list entries (Phase 1)</p>
            </div>
            <button
              type="button"
              disabled={!caps.canManageLists}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bulk upload (CSV)
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-gray-800 bg-black/30 p-4 text-sm text-gray-300">
            Records explorer placeholder. Phase 1 keeps provider adapters pluggable but does not integrate providers yet.
          </div>
        </section>
      )}

      {tab === "rules" && (
        <section className="rounded-xl border border-border bg-[#111] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Match Rules</p>
              <p className="text-xs text-gray-500">Tune fuzzy match and weighting (UI only in Phase 1)</p>
            </div>
            <button
              type="button"
              disabled={!caps.canManageLists}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save rules
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Fuzzy threshold</p>
              <input
                type="range"
                min={70}
                max={95}
                defaultValue={86}
                disabled={!caps.canManageLists}
                className="mt-4 w-full"
              />
              <p className="mt-2 text-xs text-gray-500">Recommended starting point: 0.86 (Phase 1 placeholder)</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Alias matching</p>
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-200">
                <input type="checkbox" defaultChecked disabled={!caps.canManageLists} />
                Enable alias matching
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Writes `rule.updated` audit events when changed (mocked in Phase 1).
              </p>
            </div>
          </div>

          {!caps.canManageLists && (
            <p className="mt-4 text-xs text-gray-500">
              Read-only mode. Compliance Admin can edit and save match rules.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

