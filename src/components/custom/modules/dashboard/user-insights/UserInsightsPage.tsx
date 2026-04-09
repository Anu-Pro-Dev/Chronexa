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
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { toLocalDateStr } from "@/src/lib/userInsightsUtils";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

// ─────────────────────────────────────────────────────────────────────────────
// Loading waves — controls which fetch fires and when.
//
// Wave 1 (0 ms delay)   → totals + hourly   — above the fold, user sees first
// Wave 2 (120 ms delay) → departments       — middle of page
// Wave 3 (240 ms delay) → overtime + despatch
// Wave 4 (360 ms delay) → weekly + alerts   — bottom of page, least urgent
//
// Each widget still has its own cache-guard so if the store already has data
// (e.g. org change) it exits immediately — the delay only applies on cold load.
// ─────────────────────────────────────────────────────────────────────────────

const WAVE_DELAY_MS = 120;

export default function UserInsightsPage() {
  const { date } = useSelectedDate();
  const selectedDate = React.useMemo(() => toLocalDateStr(date), [date]);

  const { organizationId } = useUserInsightsOrganization();

  const {
    fetchDailySummary,
    fetchHourlyTrendData,
    fetchDeptAttendanceData,
    fetchOvertimeData,
    fetchEarlyDespatchData,
    fetchWeeklyTrendData,
    fetchAlertsData,
  } = useUserInsightsStore();

  React.useEffect(() => {
    if (!organizationId) return;

    // ── Wave 1: above-the-fold KPIs + hourly chart ─────────────────────
    void fetchDailySummary(organizationId, selectedDate);
    void fetchHourlyTrendData(organizationId, selectedDate);

    // ── Wave 2: department table ────────────────────────────────────────
    const t2 = setTimeout(() => {
      void fetchDeptAttendanceData(organizationId, selectedDate);
    }, WAVE_DELAY_MS);

    // ── Wave 3: overtime + early despatch ───────────────────────────────
    const t3 = setTimeout(() => {
      void fetchOvertimeData(organizationId, selectedDate);
      void fetchEarlyDespatchData(organizationId, selectedDate);
    }, WAVE_DELAY_MS * 2);

    // ── Wave 4: weekly trend + alerts (bottom of page) ──────────────────
    const t4 = setTimeout(() => {
      void fetchWeeklyTrendData(organizationId, selectedDate);
      void fetchAlertsData(organizationId, selectedDate);
    }, WAVE_DELAY_MS * 3);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [
    organizationId,
    selectedDate,
    fetchDailySummary,
    fetchHourlyTrendData,
    fetchDeptAttendanceData,
    fetchOvertimeData,
    fetchEarlyDespatchData,
    fetchWeeklyTrendData,
    fetchAlertsData,
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