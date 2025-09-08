"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import TeamAttendancePage from "@/src/components/custom/modules/dashboard/team-attendance/TAPage";

export default function Page() {
  const { modules } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        disableAdd
        disableDelete
        disableSearch
        items={modules?.dashboard.items}
      />
      <div>
        <TeamAttendancePage />
      </div>
    </div>
  );
}
