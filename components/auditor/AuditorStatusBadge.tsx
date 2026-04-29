"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Status =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "escalated"
  | "open"
  | "cleared"
  | "closed"
  | "disabled"
  | "active";

const statusStyles: Record<string, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  in_review: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  cleared: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-500/40 bg-red-500/10 text-red-200",
  escalated: "border-red-500/40 bg-red-500/10 text-red-200",
  open: "border-red-500/40 bg-red-500/10 text-red-200",
  closed: "border-gray-500/40 bg-gray-500/10 text-gray-200",
  disabled: "border-gray-500/40 bg-gray-500/10 text-gray-200",
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
};

export default function AuditorStatusBadge({ status }: { status: Status }) {
  const cls = statusStyles[status] ?? "border-gray-500/40 bg-gray-500/10 text-gray-200";
  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize", cls)}>
      {status.replace("_", " ")}
    </span>
  );
}

