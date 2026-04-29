"use client";

import React from "react";

export default function AuditorKpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#111] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      {note && <p className="mt-2 text-sm text-gray-500">{note}</p>}
    </div>
  );
}

