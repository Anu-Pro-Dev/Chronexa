"use client";
import React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";

interface ProgressRowProps {
  label: string;
  sub: string;
  pct: number;
  color: string;
}

function ProgressRow({ label, sub, pct, color }: ProgressRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-text-primary">{label}</span>
        <span className="text-text-secondary text-xs">{sub}</span>
      </div>
      <div className="h-[6px] bg-border-accent rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function OvertimeCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  // ✅ Single s.data read – no stale fields
  const data = useUserInsightsStore((s) => s.data);
  
  // Use overtime data from Spark API
  const ot   = data?.overtime;

  const avgHours       = ot?.avgHoursToday       ?? 0;
  const overtimeCount  = ot?.overtimeCount       ?? 0;
  const earlyDeps      = ot?.earlyDepartures     ?? 0;
  const coverage       = ot?.shiftCoverage       ?? 0;
  const weekRate       = ot?.weekAttendanceRate   ?? 0;

  const rows: ProgressRowProps[] = [
    { label: t?.avg_hours        || "Avg hours today",     sub: `${avgHours.toFixed(1)} / 8h`,              pct: Math.round((avgHours / 8) * 100),     color: "#0078D4" },
    { label: t?.overtime         || "Overtime",            sub: `${overtimeCount} ${t?.emps_count || "staff"}`, pct: Math.min(overtimeCount, 100),         color: "#7F77DD" },
    { label: t?.early_out        || "Early departures",    sub: `${earlyDeps} ${t?.emps_count || "staff"}`,    pct: Math.min(earlyDeps * 2, 100),         color: "#EF9F27" },
    { label: t?.shift_progress   || "Shift coverage",      sub: `${coverage}%`,                               pct: coverage,                             color: "#1D9E75" },
    { label: t?.work_hrs_trends  || "Week attendance rate",sub: `${weekRate}%`,                               pct: weekRate,                             color: "#0078D4" },
  ];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 h-full flex flex-col">
      <h5 className="text-base font-bold text-text-primary mb-1">
        {t?.overtime || "Overtime"} &amp; {t?.worked_hrs || "Hours"}
      </h5>
      <p className="text-xs text-text-secondary mb-4">
        {t?.shift_progress || "Today's shift metrics"}
      </p>

      <div className="flex justify-between mb-5">
        {[
          { label: t?.overtime       || "Overtime",  value: `${overtimeCount}`,          color: "#7F77DD" },
          { label: t?.early_out      || "Early out", value: `${earlyDeps}`,               color: "#EF9F27" },
          { label: t?.shift_progress || "Coverage",  value: `${coverage}%`,              color: "#1D9E75" },
        ].map((s) => (
          <div key={s.label} className="text-center flex-1">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 flex-1 justify-center">
        {rows.map((r) => <ProgressRow key={r.label + r.color} {...r} />)}
      </div>
    </div>
  );
}
