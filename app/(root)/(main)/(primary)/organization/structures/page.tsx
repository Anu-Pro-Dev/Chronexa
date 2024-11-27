"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import PowerTable from "@/components/custom/power-comps/power-table";
import { organization } from "@/lib/routes";
import React, { useState } from "react";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        items={organization.items}
        disableAdd
        disableDelete
        disableSearch
      />
      <div>
        <h1>Structures</h1>
      </div>
    </div>
  );
}
