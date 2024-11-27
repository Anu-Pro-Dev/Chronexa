"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { reports } from "@/lib/routes";

import React from "react";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={reports?.items} />
    </div>
  );
}
