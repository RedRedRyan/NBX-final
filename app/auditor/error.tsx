"use client";

import React from "react";
import { AuditorErrorState } from "@/components/auditor/AuditorStates";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <AuditorErrorState
      title="Auditor console error"
      description={error?.message || "An unexpected error occurred."}
    />
  );
}

