"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { InlineLoading } from "@/src/app/loading";

// Helper to get user data from localStorage/sessionStorage
function getUserFromStorage(): any | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export default function UserInsightsPage() {
  const fetchAllData = useUserInsightsStore((s) => s.fetchAllData);
  const loadingGroupA = useUserInsightsStore((s) => s.loadingGroupA);
  const currentOrganization = useUserInsightsStore((s) => s.currentOrganization);
  
  const summaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);
  const { date } = useSelectedDate();
  
  // Get organization ID from localStorage/sessionStorage
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user?.organization?.id) {
      setOrganizationId(user.organization.id);
      setOrganizationName(user.organization.name || null);
    }
  }, []);

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

  // Show error if no organization ID is available
  if (organizationId === null) {
    // Still loading from storage
    return <InlineLoading message="Loading..." />;
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No organization found for your account.</p>
        <p className="text-sm">Please contact your administrator.</p>
      </div>
    );
  }

  if (loadingGroupA && !hasCache) {
    return <InlineLoading message="Loading insights..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Optional: Display organization name */}
      {/* {(currentOrganization?.name || organizationName) && (
        <div className="text-sm text-muted-foreground">
          Organization: <span className="font-medium text-foreground">{currentOrganization?.name || organizationName}</span>
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
