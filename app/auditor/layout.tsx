"use client";

import React from "react";
import Link from "next/link";
import AuditorTopBar from "@/components/auditor/AuditorTopBar";
import {
  AuditorErrorState,
  AuditorLoadingState,
  AuditorPermissionDeniedState,
} from "@/components/auditor/AuditorStates";
import { useAuth } from "@/lib/context/AuthContext";

const allowedAuditorRoles = new Set(["auditor", "regulator_analyst", "compliance_admin"]);

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <AuditorLoadingState title="Loading auditor tools" />;
  }

  if (!isAuthenticated) {
    return (
      <AuditorPermissionDeniedState
        title="Sign in required"
        description="Auditor tools require an authenticated account."
        action={
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-dark-100 px-4 py-2 text-sm font-semibold text-white hover:border-primary/60"
          >
            Go to login
          </Link>
        }
      />
    );
  }

  const role = (user?.role ?? user?.accountType ?? "investor") as string;
  if (!allowedAuditorRoles.has(role)) {
    return (
      <AuditorPermissionDeniedState
        title="Permission denied"
        description="Your account does not have access to auditor tools."
        action={
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-dark-100 px-4 py-2 text-sm font-semibold text-white hover:border-primary/60"
          >
            Back to home
          </Link>
        }
      />
    );
  }

  try {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        <AuditorTopBar />
        {children}
      </div>
    );
  } catch (err: any) {
    return (
      <AuditorErrorState
        title="Something went wrong"
        description={err?.message || "Unable to render auditor layout."}
      />
    );
  }
}

