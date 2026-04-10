"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { getWeekStartStr } from "@/src/lib/userInsightsUtils";

const COLORS = {
  present: "#2DD4BF",
  absent: "#C084FC",
  onLeave: "#F59E0B",
};

interface WeeklySummaryCardProps {
  date: string;
}

export default function WeeklySummaryCard({ date }: WeeklySummaryCardProps) {
  const insightsWeeklyTrendCache = useUserInsightsStore(
    (s) => s.insightsWeeklyTrendCache
  );
  const weekStart = getWeekStartStr(date);
  const rawData = insightsWeeklyTrendCache[weekStart] ?? [];

  const daysWithData = rawData.filter((entry: any) => entry.total > 0);

  const stats =
    daysWithData.length === 0
      ? {
          avgPresent: 0,
          absenceRate: 0,
          bestDay: { day: "—", present: 0 },
          totalOnLeave: 0,
          peakAbsentDay: { day: "—", absent: 0 },
        }
      : {
          avgPresent: Math.round(
            daysWithData.reduce((s: number, e: any) => s + e.present, 0) /
              daysWithData.length
          ),
          absenceRate: (() => {
            const total = daysWithData.reduce(
              (s: number, e: any) => s + e.total,
              0
            );
            if (total === 0) return 0;
            return Math.round(
              (daysWithData.reduce((s: number, e: any) => s + e.absent, 0) /
                total) *
                100
            );
          })(),
          bestDay: daysWithData.reduce(
            (best: any, e: any) => (e.present > best.present ? e : best),
            daysWithData[0]
          ),
          totalOnLeave: daysWithData.reduce(
            (s: number, e: any) => s + e.onLeave,
            0
          ),
          peakAbsentDay: daysWithData.reduce(
            (worst: any, e: any) => (e.absent > worst.absent ? e : worst),
            daysWithData[0]
          ),
        };

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 h-full flex flex-col">
      <h5 className="text-lg text-text-primary font-bold pb-3">Weekly Summary</h5>

      <div className="grid grid-cols-5 gap-3 flex-1">
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-2xl font-bold" style={{ color: COLORS.present }}>
            {stats.avgPresent}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Avg Present / Day</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-lg font-bold" style={{ color: COLORS.onLeave }}>
            {stats.bestDay.day}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Best Day</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: COLORS.onLeave }}>
            {stats.bestDay.present} present
          </p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-2xl font-bold" style={{ color: COLORS.absent }}>
            {stats.absenceRate}%
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Absence Rate</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-2xl font-bold" style={{ color: COLORS.onLeave }}>
            {stats.totalOnLeave}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Total On Leave</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-lg font-bold" style={{ color: COLORS.absent }}>
            {stats.peakAbsentDay.day}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Peak Absent Day</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: COLORS.absent }}>
            {stats.peakAbsentDay.absent} absent
          </p>
        </div>
      </div>
    </div>
  );
}