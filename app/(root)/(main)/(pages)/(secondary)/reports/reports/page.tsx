"use client";
import React from "react";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { useLanguage } from "@/providers/LanguageProvider";
import StandardReportGenerator from "@/forms/reports/StandardReportGenerator";

export default function Page() {
  const { modules } = useLanguage();
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.reports?.items} />
      <StandardReportGenerator />
    </div>
  );
}
