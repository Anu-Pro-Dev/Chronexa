"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/src/components/ui/chart";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

const chartConfig = {
  present: { label: "Present", color: "#378ADD" },
  onLeave: { label: "On Leave", color: "#7F77DD" },
  absent: { label: "Absent", color: "#F09595" },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const total = data.present + data.onLeave + data.absent;
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="font-semibold mb-2">{data.day}</p>
      <div className="space-y-1 text-sm">
        <p style={{ color: "#378ADD" }}>Present: <span className="font-bold">{data.present}</span></p>
        <p style={{ color: "#7F77DD" }}>On Leave: <span className="font-bold">{data.onLeave}</span></p>
        <p style={{ color: "#F09595" }}>Absent: <span className="font-bold">{data.absent}</span></p>
        <p className="text-muted-foreground">Total: <span className="font-bold">{total}</span></p>
      </div>
    </div>
  );
};

function getMondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default function WeeklyTrendChart() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsWeeklyTrendCache = useUserInsightsStore((s) => s.insightsWeeklyTrendCache);

  const weekStart = getMondayStr();
  const weeklyData = insightsWeeklyTrendCache[weekStart] ?? [];

  const summaryStats = useMemo(() => {
    if (weeklyData.length === 0) return { avgPresent: 0, absenceRate: 0, bestDay: { day: "—", present: 0 } };
    const totalPresent = weeklyData.reduce((s: number, d: any) => s + d.present, 0);
    const totalHeadcount = weeklyData.reduce((s: number, d: any) => s + d.present + d.onLeave + d.absent, 0);
    const avgPresent = Math.round(totalPresent / weeklyData.length);
    const absenceRate = totalHeadcount > 0
      ? Math.round((weeklyData.reduce((s: number, d: any) => s + d.absent, 0) / totalHeadcount) * 100)
      : 0;
    const bestDay = weeklyData.reduce((max: any, d: any) => d.present > max.present ? d : max, weeklyData[0]);
    return { avgPresent, absenceRate, bestDay };
  }, [weeklyData]);

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Weekly Attendance Trend</p>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {loadingUserInsights && weeklyData.length === 0 ? (
        <div className="h-[150px] w-full bg-border rounded animate-pulse" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(55, 138, 221, 0.08)" }} />
            <Bar dataKey="present" stackId="a" fill="#378ADD" radius={[0, 0, 0, 0]} />
            <Bar dataKey="onLeave" stackId="a" fill="#7F77DD" radius={[0, 0, 0, 0]} />
            <Bar dataKey="absent" stackId="a" fill="#F09595" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-2xl font-bold" style={{ color: "#378ADD" }}>
            {summaryStats.avgPresent}
          </p>
          <p className="text-xs text-muted-foreground">Avg Present / Day</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-lg font-bold" style={{ color: "#7F77DD" }}>
            {summaryStats.bestDay.day}
          </p>
          <p className="text-xs text-muted-foreground">Best Day</p>
          <p className="text-xs font-semibold" style={{ color: "#7F77DD" }}>
            {summaryStats.bestDay.present} present
          </p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-2xl font-bold" style={{ color: "#F09595" }}>
            {summaryStats.absenceRate}%
          </p>
          <p className="text-xs text-muted-foreground">Absence Rate</p>
        </div>
      </div>
    </div>
  );
}
