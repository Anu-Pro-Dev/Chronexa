"use client";

import * as React from "react";
import { useEffect } from "react";
import KpiGrid from "./KpiGrid";
import HourlyTrendChart from "./HourlyTrendChart";
import AttendanceSplitChart from "./AttendanceSplitChart";
import DeptTable from "./DeptTable";
import EarlyDespatch from "./EarlyDespatch";
import AlertsCard from "./AlertsCard";
import WeeklyTrendChart from "./WeeklyTrendChart";
import OvertimeCard from "./OvertimeCard";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useSelectedDate } from "@/src/store/useSelectedDate";

export default function UserInsightsPage() {
  const fetchAllData = useUserInsightsStore((s) => s.fetchAllData);
  const { date } = useSelectedDate();

  const selectedDate = date.toISOString().split("T")[0];

  useEffect(() => {
    fetchAllData(selectedDate);
  }, [fetchAllData, selectedDate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: KPI grid */}
      <KpiGrid date={selectedDate} />

      {/* Row 2: Hourly trend (2fr) + Attendance split (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HourlyTrendChart date={selectedDate} />
        </div>
        <div>
          <AttendanceSplitChart date={selectedDate} />
        </div>
      </div>

      {/* Row 3: Dept table + Early Despatch (left 2/3), Alerts (right 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DeptTable date={selectedDate} />
          <EarlyDespatch date={selectedDate} />
        </div>
        <AlertsCard date={selectedDate} />
      </div>

      {/* Row 4: Weekly trend (2fr) + Overtime (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyTrendChart date={selectedDate} />
        </div>
        <div>
          <OvertimeCard date={selectedDate} />
        </div>
      </div>
    </div>
  );
}