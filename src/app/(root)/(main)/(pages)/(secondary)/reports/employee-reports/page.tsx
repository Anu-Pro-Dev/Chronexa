"use client";
import React from "react";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { useLanguage } from "@/src/providers/LanguageProvider";
import EmployeeReports from "@/src/components/custom/modules/reports/EmployeeReports";

export default function Page() {
  const { modules } = useLanguage();
  
  return (
    <div className="flex flex-col gap-4">
      <PowerHeader disableFeatures items={modules?.reports?.items} />
      <EmployeeReports />
    </div>
  );
}
