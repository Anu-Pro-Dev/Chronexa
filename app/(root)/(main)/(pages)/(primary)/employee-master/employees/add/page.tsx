"use client";
import PowerHeader from "@/components/custom/power-comps/power-header";
import React, { useState } from "react";

import { useLanguage } from "@/providers/LanguageProvider";
export default function Page() {
  const { modules } = useLanguage();
  const [Data, SetData] = useState<any>([]);

  const props = {
    Data,
    SetData,
  };

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader items={modules?.employee_master.items} disableFeatures />
      <div>
        <h1>Add</h1>
      </div>
    </div>
  );
}
