"use client";

import * as React from "react";
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

function useCountUp(target: number[], ready: boolean): number[] {
  const [values, setValues] = React.useState<number[]>(() => target.map(() => 0));
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!ready) return;
    const startTime = Date.now();
    const duration = 800;
    const snapshot = [...target];
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setValues(snapshot.map((v) => Math.floor(v * progress)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, target.join(",")]);

  return values;
}

export default function OvertimeCard({ date }: OvertimeCardProps) {
  const insightsOvertimeCache = useUserInsightsStore((s) => s.insightsOvertimeCache);
  const hasOvertimeData = date in insightsOvertimeCache;
  const overtime = insightsOvertimeCache[date];

  const rawValues = [
    overtime?.avgHoursToday ?? 0,
    overtime?.overtimeStaff ?? 0,
    overtime?.earlyDepartures ?? 0,
    overtime?.shiftCoverage ?? 0,
    overtime?.weekAttendanceRate ?? 0,
    overtime?.noPunchToday ?? 0,
    overtime?.onTimeRate ?? 0,
  ];
  const animated = useCountUp(rawValues, hasOvertimeData);

  const expectedHours = overtime?.expectedHours ?? 9;
  const totalStaff = overtime?.totalStaff ?? 1;

  const overtimeData: OvertimeRow[] = [
    {
      label: "Avg hours",
      value: `${animated[0]} / ${expectedHours}h`,
      percentage: expectedHours > 0 ? Math.round((animated[0] / expectedHours) * 100) : 0,
      color: "#0078D4",
    },
    {
      label: "Overtime",
      value: `${animated[1]} users`,
      percentage: totalStaff > 0 ? Math.round((animated[1] / totalStaff) * 100) : 0,
      color: "#FF6B2D",
    },
    {
      label: "Early departures",
      value: `${animated[2]} users`,
      percentage: totalStaff > 0 ? Math.round((animated[2] / totalStaff) * 100) : 0,
      color: "#FFBF00",
    },
    {
      label: "Shift coverage",
      value: `${animated[3]}%`,
      percentage: animated[3],
      color: "#1DAA61",
    },
    {
      label: "Week attendance rate",
      value: `${animated[4]}%`,
      percentage: animated[4],
      color: "#7D3FFF",
    },
    {
      label: "No punch",
      value: `${animated[5]} users`,
      percentage: totalStaff > 0 ? Math.round((animated[5] / totalStaff) * 100) : 0,
      color: "#E53935",
    },
    {
      label: "On-time rate",
      value: `${animated[6]}%`,
      percentage: animated[6],
      color: "#00897B",
    },
  ];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-6 flex flex-col gap-3">
      <h5 className="text-lg text-text-primary font-bold">Overtime & Hours Worked</h5>
      <div className="flex flex-col gap-4">
        {overtimeData.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary font-medium">{row.label}</span>
              <span className="font-semibold text-text-primary">{row.value}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
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
