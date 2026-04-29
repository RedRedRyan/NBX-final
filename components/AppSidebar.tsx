"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AuditorSidebar from "@/components/auditor/AuditorSidebar";

export default function AppSidebar() {
  const pathname = usePathname();
  if (pathname.startsWith("/auditor")) {
    return <AuditorSidebar />;
  }
  return <Sidebar />;
}

