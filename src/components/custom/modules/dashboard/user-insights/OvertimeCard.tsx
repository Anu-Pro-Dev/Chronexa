"use client";

import * as React from "react";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface OvertimeRow {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

interface OvertimeCardProps {
  date: string;
}

export default function OvertimeCard({ date }: OvertimeCardProps) {
  const { organizationId } = useUserInsightsOrganization();
  const fetchOvertimeData = useUserInsightsStore((s) => s.fetchOvertimeData);
  const insightsOvertimeCache = useUserInsightsStore((s) => s.insightsOvertimeCache);
  const hasOvertimeData = date in insightsOvertimeCache;

  const overtime = insightsOvertimeCache[date];

  React.useEffect(() => {
    if (!organizationId || hasOvertimeData) {
      return;
    }

    void fetchOvertimeData(organizationId, date);
  }, [date, fetchOvertimeData, hasOvertimeData, organizationId]);

  if (!hasOvertimeData) {
    return (
      <div className="bg-accent rounded-[10px] shadow-card p-4 flex min-h-[248px] items-center justify-center text-sm text-text-secondary">
        Loading overtime insights...
      </div>
    );
  }

  const overtimeData: OvertimeRow[] = overtime
    ? [
        {
          label: "Avg hours today",
          value: `${overtime.avgHoursToday} / ${overtime.expectedHours}h`,
          percentage: overtime.expectedHours > 0 ? Math.round((overtime.avgHoursToday / overtime.expectedHours) * 100) : 0,
          color: "#0078D4",
        },
        {
          label: "Overtime today",
          value: `${overtime.overtimeStaff} users`,
          percentage: overtime.totalStaff > 0 ? Math.round((overtime.overtimeStaff / overtime.totalStaff) * 100) : 0,
          color: "#FF6B2D",
        },
        {
          label: "Early departures",
          value: `${overtime.earlyDepartures} users`,
          percentage: overtime.totalStaff > 0 ? Math.round((overtime.earlyDepartures / overtime.totalStaff) * 100) : 0,
          color: "#FFBF00",
        },
        {
          label: "Shift coverage",
          value: `${overtime.shiftCoverage}%`,
          percentage: overtime.shiftCoverage,
          color: "#1DAA61",
        },
        {
          label: "Week attendance rate",
          value: `${overtime.weekAttendanceRate}%`,
          percentage: overtime.weekAttendanceRate,
          color: "#7D3FFF",
        },
      ]
    : [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <h5 className="text-lg text-text-primary font-bold">Overtime & Hours Worked</h5>
      <div className="flex flex-col gap-4">
        {overtimeData.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary font-medium">{row.label}</span>
              <span className="font-semibold text-text-primary">{row.value}</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${row.percentage}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
