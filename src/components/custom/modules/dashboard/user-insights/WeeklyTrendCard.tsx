"use client";
import React, { useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Stable empty fallback
const EMPTY_WEEK: any[] = [];

export default function WeeklyTrendCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  // ✅ Single s.data read – no stale cache fields
  const data      = useUserInsightsStore((s) => s.data);
  const weeklyRaw = data?.weeklyTrend ?? EMPTY_WEEK;

  const finalData = useMemo(
    () => (dir === "rtl" ? [...weeklyRaw].reverse() : weeklyRaw),
    [weeklyRaw, dir]
  );

  const labels = {
    present: t?.worked          || "Present",
    onLeave: t?.approved_leaves || "On leave",
    absent:  t?.absent          || "Absent",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-accent border border-border-accent rounded-lg p-3 text-xs shadow-md">
        <p className="font-semibold text-text-primary mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {labels[p.dataKey as keyof typeof labels] ?? p.dataKey}:{" "}
            <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 h-full">
      <div className="mb-3">
        <h5 className="text-base font-bold text-text-primary">
          {t?.leave_analytics || "Weekly Attendance Trend"}
        </h5>
        <p className="text-xs text-text-secondary mt-0.5">
          {t?.work_hrs_trends || "Mon–Sun this week"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-text-secondary">
        {[
          { color: "#0078D4", label: labels.present },
          { color: "#7F77DD", label: labels.onLeave },
          { color: "#F09595", label: labels.absent  },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={finalData} margin={{ left: -15, right: 5 }} barSize={14}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} orientation={dir === "rtl" ? "right" : "left"} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,120,212,0.05)" }} />
          <Bar dataKey="present" stackId="a" fill="#0078D4" radius={[0,0,0,0]} isAnimationActive={false} />
          <Bar dataKey="onLeave" stackId="a" fill="#7F77DD" radius={[0,0,0,0]} isAnimationActive={false} />
          <Bar dataKey="absent"  stackId="a" fill="#F09595" radius={[3,3,0,0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
