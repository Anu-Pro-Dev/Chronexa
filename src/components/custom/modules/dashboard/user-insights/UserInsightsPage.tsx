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
import UserInsightsSkeleton from "./UserInsightsSkeleton";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function UserInsightsPage() {
  const fetchAllData = useUserInsightsStore((s) => s.fetchAllData);
  const summaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);
  const { date } = useSelectedDate();

  // Read org ID directly from auth store — reactive to user changes
  const userInfo = useAuthStore((s) => s.userInfo);

  // Also read from localStorage as a fallback for the case where the store
  // hasn't hydrated yet on first render (isChecking still true)
  const organizationId: number | null = React.useMemo(() => {
    if (userInfo?.organization?.id) return userInfo.organization.id;
    // Fallback: read directly from storage so we never stall on isChecking
    if (typeof window !== "undefined") {
      try {
        const raw =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const id = parsed?.organization?.id;
          if (id) return Number(id);
        }
      } catch {}
    }
    return null;
  }, [userInfo]);

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

  // No organization found — show error
  if (organizationId === null && typeof window !== "undefined") {
    // Storage has loaded but no org — show error
    try {
      const raw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (raw) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>No organization found for your account.</p>
            <p className="text-sm">Please contact your administrator.</p>
          </div>
        );
      }
    } catch {}
  }

  // Show skeleton whenever there is no cached data yet for the selected date.
  // This covers: first render (before useEffect fires), fresh date selection,
  // and new user login (cache cleared by resetAllStores).
  if (!hasCache) {
    return <UserInsightsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
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