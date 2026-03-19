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
      <KpiGrid date={selectedDate} />

      <HourlyTrendChart date={selectedDate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DeptTable date={selectedDate} />
        </div>
        <div>
          <AttendanceSplitChart date={selectedDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[55%_45%] gap-4">
        <EarlyDespatch date={selectedDate} />
        <OvertimeCard date={selectedDate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyTrendChart date={selectedDate} />
        </div>
        <div>
          <AlertsCard date={selectedDate} />
        </div>
      </div>
    </div>
  );
}