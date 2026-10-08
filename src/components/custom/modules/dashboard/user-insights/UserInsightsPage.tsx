"use client";

import * as React from "react";
import KpiGrid from "./KpiGrid";
import HourlyTrendChart from "./HourlyTrendChart";
import AttendanceSplitChart from "./AttendanceSplitChart";
import DeptTable from "./DeptTable";
import WeeklyTrendChart from "./WeeklyTrendChart";
import OvertimeCard from "./OvertimeCard";
import WeeklySummaryCard from "./WeeklySummaryCard";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { toLocalDateStr } from "@/src/lib/userInsightsUtils";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

// ─────────────────────────────────────────────────────────────────────────────
// Loading waves — controls which fetch fires and when.
//
// Wave 1 (0 ms delay)   → totals + hourly   — above the fold, user sees first
// Wave 2 (120 ms delay) → departments       — middle of page
// Wave 3 (240 ms delay) → overtime
// Wave 4 (360 ms delay) → weekly            — bottom of page, least urgent
//
// Data is reset to 0 immediately when org or date changes so the UI never
// shows stale values while a new request is in flight.
// ─────────────────────────────────────────────────────────────────────────────

const WAVE_DELAY_MS = 120;

export default function UserInsightsPage() {
  const { date } = useSelectedDate();
  const selectedDate = React.useMemo(() => toLocalDateStr(date), [date]);

  const { organizationId, scopeKey, scopeParams } = useUserInsightsOrganization();

  const {
    fetchDailySummary,
    fetchHourlyTrendData,
    fetchDeptAttendanceData,
    fetchOvertimeData,
    fetchWeeklyTrendData,
    fetchAttendancePct,
    clearData,
  } = useUserInsightsStore();

  // Track the previous scopeKey + date so we can detect real changes.
  const prevKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentKey = `${scopeKey}::${selectedDate}`;

    // ── Reset all data to 0 immediately whenever org or date changes ──────
    if (prevKeyRef.current !== null && prevKeyRef.current !== currentKey) {
      clearData();
    }
    prevKeyRef.current = currentKey;

    // Use scopeParams if multi-company selection or vertical selection is active,
    // otherwise fallback to organizationId or scopeParams
    const scope = (scopeParams?.orgIds && Array.isArray(scopeParams.orgIds) && scopeParams.orgIds.length > 1)
      ? scopeParams
      : (organizationId ?? scopeParams);

    // ── Wave 1: above-the-fold KPIs + hourly chart ────────────────────────
    void fetchDailySummary(scope, selectedDate);
    void fetchAttendancePct(scope, selectedDate);
    void fetchHourlyTrendData(scope, selectedDate);

    // ── Wave 2: department table ──────────────────────────────────────────
    const t2 = setTimeout(() => {
      void fetchDeptAttendanceData(scope, selectedDate);
    }, WAVE_DELAY_MS);

    // ── Wave 3: overtime ──────────────────────────────────────────────────
    const t3 = setTimeout(() => {
      void fetchOvertimeData(scope, selectedDate);
    }, WAVE_DELAY_MS * 2);

    // ── Wave 4: weekly trend (bottom of page) ─────────────────────────────
    const t4 = setTimeout(() => {
      void fetchWeeklyTrendData(scope, selectedDate);
    }, WAVE_DELAY_MS * 3);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [
    organizationId,
    scopeKey,
    scopeParams,
    selectedDate,
    fetchDailySummary,
    fetchHourlyTrendData,
    fetchDeptAttendanceData,
    fetchOvertimeData,
    fetchWeeklyTrendData,
    fetchAttendancePct,
    clearData,
  ]);

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

      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4 items-stretch">
          <OvertimeCard date={selectedDate} />
          <WeeklyTrendChart date={selectedDate} />
        </div>
        <div>
          <WeeklySummaryCard date={selectedDate} />
        </div>
      </div>
    </div>
  );
}