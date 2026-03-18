"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface OvertimeRow {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

export default function OvertimeCard() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsOvertimeCache = useUserInsightsStore((s) => s.insightsOvertimeCache);

  const today = new Date().toISOString().split('T')[0];
  const overtime = insightsOvertimeCache[today];

  const overtimeData: OvertimeRow[] = overtime
    ? [
        {
          label: "Avg hours today",
          value: `${overtime.avgHoursToday} / ${overtime.expectedHours}h`,
          percentage: overtime.expectedHours > 0 ? Math.round((overtime.avgHoursToday / overtime.expectedHours) * 100) : 0,
          color: "#378ADD",
        },
        {
          label: "Overtime today",
          value: `${overtime.overtimeStaff} staff`,
          percentage: overtime.totalStaff > 0 ? Math.round((overtime.overtimeStaff / overtime.totalStaff) * 100) : 0,
          color: "#7F77DD",
        },
        {
          label: "Early departures",
          value: `${overtime.earlyDepartures} staff`,
          percentage: overtime.totalStaff > 0 ? Math.round((overtime.earlyDepartures / overtime.totalStaff) * 100) : 0,
          color: "#E6A817",
        },
        {
          label: "Shift coverage",
          value: `${overtime.shiftCoverage}%`,
          percentage: overtime.shiftCoverage,
          color: "#1D9E75",
        },
        {
          label: "Week attendance rate",
          value: `${overtime.weekAttendanceRate}%`,
          percentage: overtime.weekAttendanceRate,
          color: "#D85A30",
        },
      ]
    : [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Overtime & Hours Worked</p>
      </div>
      {loadingUserInsights && !overtime ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-3 bg-border rounded w-3/4" />
              <div className="h-1.5 bg-border rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {overtimeData.map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary font-medium">{row.label}</span>
                <span className="font-semibold text-text-primary">{row.value}</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${row.percentage}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
