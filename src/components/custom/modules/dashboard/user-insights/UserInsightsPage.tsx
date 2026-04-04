"use client";

import * as React from "react";
import KpiGrid from "./KpiGrid";
import HourlyTrendChart from "./HourlyTrendChart";
import AttendanceSplitChart from "./AttendanceSplitChart";
import DeptTable from "./DeptTable";
import EarlyDespatch from "./EarlyDespatch";
import AlertsCard from "./AlertsCard";
import WeeklyTrendChart from "./WeeklyTrendChart";
import OvertimeCard from "./OvertimeCard";
import UserInsightsSkeleton from "./UserInsightsSkeleton";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import { toLocalDateStr } from "@/src/lib/userInsightsUtils";

export default function UserInsightsPage() {
  const { date } = useSelectedDate();
  const { organizationId, isCheckingOrganization } = useUserInsightsOrganization();

  const selectedDate = React.useMemo(() => toLocalDateStr(date), [date]);

  if (isCheckingOrganization) {
    return <UserInsightsSkeleton />;
  }

  if (organizationId === null && typeof window !== "undefined") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No organization found for your account.</p>
        <p className="text-sm">Please contact your administrator.</p>
      </div>
    );
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
