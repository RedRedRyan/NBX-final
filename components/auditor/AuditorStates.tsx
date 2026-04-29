"use client";

import React from "react";

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-[#0d0d0d] p-6">{children}</div>
);

export function AuditorLoadingState({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <div className="rounded-xl border border-border bg-black/60 p-4 backdrop-blur-md">
        <div className="h-5 w-48 animate-pulse rounded bg-gray-800" />
        <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-900" />
      </div>
      <Card>
        <p className="text-sm font-semibold text-white">{title}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-20 animate-pulse rounded-xl border border-gray-800 bg-black/30" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function AuditorEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Empty state</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </Card>
    </div>
  );
}

export function AuditorErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-300">Error</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </Card>
    </div>
  );
}

export function AuditorPermissionDeniedState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Access</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </Card>
    </div>
  );
}

