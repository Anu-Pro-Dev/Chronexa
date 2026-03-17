"use client";
import React from "react";
import KpiGrid from "./KpiGrid";
import HourlyTrendCard from "./HourlyTrendCard";
import AttendanceSplitCard from "./AttendanceSplitCard";
import DepartmentComplianceCard from "./DepartmentComplianceCard";
import LateArrivalsCard from "./LateArrivalsCard";
import AlertsCard from "./AlertsCard";
import WeeklyTrendCard from "./WeeklyTrendCard";
import OvertimeCard from "./OvertimeCard";

export default function UserInsightsPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 – KPI strip */}
      <KpiGrid />

      {/* Row 2 – Hourly trend (2/3) + Donut split (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <HourlyTrendCard />
        </div>
        <div className="xl:col-span-1">
          <AttendanceSplitCard />
        </div>
      </div>

      {/* Row 3 – Department | Late arrivals | Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DepartmentComplianceCard />
        <LateArrivalsCard />
        <AlertsCard />
      </div>

      {/* Row 4 – Weekly trend (2/3) + Overtime summary (1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <WeeklyTrendCard />
        </div>
        <div className="xl:col-span-1">
          <OvertimeCard />
        </div>
      </div>
    </div>
  );
}
