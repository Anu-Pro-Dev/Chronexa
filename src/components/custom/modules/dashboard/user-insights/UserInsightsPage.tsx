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
import { useAuthStore } from "@/src/store/useAuthStore";
import { InlineLoading } from "@/src/app/loading";

export default function UserInsightsPage() {
  const fetchAllData = useUserInsightsStore((s) => s.fetchAllData);
  const loading = useUserInsightsStore((s) => s.loading);
  const summaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);
  const { date } = useSelectedDate();

  const isChecking = useAuthStore((s) => s.isChecking);
  const userInfo = useAuthStore((s) => s.userInfo);
  const organizationId: number | null = userInfo?.organization?.id ?? null;
  const organizationName: string | null = userInfo?.organization?.name ?? null;

  const selectedDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const hasCache = !!summaryCache[selectedDate];

  useEffect(() => {
    if (organizationId) {
      fetchAllData(organizationId, selectedDate);
    }
  }, [fetchAllData, selectedDate, organizationId]);

  // Auth store is still initializing from storage
  if (isChecking) {
    return <InlineLoading message="Loading..." />;
  }

  // Auth store is ready but no organization is attached to this user
  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No organization found for your account.</p>
        <p className="text-sm">Please contact your administrator.</p>
      </div>
    );
  }

  if (loading && !hasCache) {
    return <InlineLoading message="Loading insights..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Optional: Display organization name */}
      {/* {organizationName && (
        <div className="text-sm text-muted-foreground">
          Organization: <span className="font-medium text-foreground">{organizationName}</span>
        </div>
      )} */}

      <KpiGrid date={selectedDate} />

      <HourlyTrendChart date={selectedDate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <DeptTable date={selectedDate} />
        </div>
        <div className="flex flex-col">
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