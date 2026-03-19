"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const COLORS = {
  present:  { bar: "#2DD4BF", hover: "#14B8A6", stat: "#2DD4BF" }, 
  absent:   { bar: "#C084FC", hover: "#A855F7", stat: "#C084FC" },
  onLeave:  { bar: "#F59E0B", hover: "#D97706", stat: "#F59E0B" },
};

const chartConfig = {
  present: { label: "Present", color: COLORS.present.bar },
  absent: { label: "Absent", color: COLORS.absent.bar },
  onLeave: { label: "On Leave", color: COLORS.onLeave.bar },
} satisfies ChartConfig;

const LEGEND = [
  { label: "Present", ...COLORS.present },
  { label: "Absent", ...COLORS.absent },
  { label: "On Leave", ...COLORS.onLeave },
];

function getWeekStartStr(fromDate: string): string {
  const d = new Date(fromDate);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

interface WeeklyTrendChartProps {
  date: string;
}

export default function WeeklyTrendChart({ date }: WeeklyTrendChartProps) {
  const loading = useUserInsightsStore((s) => s.loading);
  const insightsWeeklyTrendCache = useUserInsightsStore((s) => s.insightsWeeklyTrendCache);

  const weekStart = getWeekStartStr(date);
  const rawData = insightsWeeklyTrendCache[weekStart] ?? [];

  const chartData = useMemo(() => {
    const byDay = new Map(rawData.map((d: any) => [d.day, d]));
    return ALL_DAYS.map((day) => {
      const entry = byDay.get(day) as any;
      return {
        day: day.slice(0, 3),
        present: entry?.present ?? 0,
        onLeave: entry?.onLeave ?? 0,
        absent: entry?.absent ?? 0,
        missedIn: entry?.missedIn ?? 0,
        missedOut: entry?.missedOut ?? 0,
        total: entry?.total ?? 0,
      };
    });
  }, [rawData]);

  const summaryStats = useMemo(() => {
    const daysWithData = chartData.filter((d) => d.total > 0);
    if (daysWithData.length === 0) return { avgPresent: 0, absenceRate: 0, bestDay: { day: "—", present: 0 } };
    const totalPresent = daysWithData.reduce((s, d) => s + d.present, 0);
    const totalHeadcount = daysWithData.reduce((s, d) => s + d.total, 0);
    const avgPresent = Math.round(totalPresent / daysWithData.length);
    const absenceRate = totalHeadcount > 0
      ? Math.round((daysWithData.reduce((s, d) => s + d.absent, 0) / totalHeadcount) * 100)
      : 0;
    const bestDay = daysWithData.reduce((max, d) => d.present > max.present ? d : max, daysWithData[0]);
    return { avgPresent, absenceRate, bestDay };
  }, [chartData]);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      {/* Header */}
      <div className="flex flex-row justify-between items-center px-4 py-4">
        <h5 className="text-lg text-text-primary font-bold pb-2">Weekly Attendance Trend</h5>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.bar }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading && rawData.length === 0 ? (
        <div className="h-[240px] mx-4 bg-border rounded animate-pulse" />
      ) : (
        <ChartContainer config={chartConfig} className="relative w-full h-[240px] -left-[10px]">
          <BarChart data={chartData} barSize={28} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              interval={0}
            />
            <YAxis
              type="number"
              tickLine={false}
              tickMargin={4}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(55, 138, 221, 0.06)", radius: 6 }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="present" stackId="a" fill="var(--color-present)" radius={[0, 0, 4, 4]} name="Present" activeBar={{ fill: COLORS.present.hover }} />
            <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" radius={[0, 0, 0, 0]} name="Absent" activeBar={{ fill: COLORS.absent.hover }} />
            <Bar dataKey="onLeave" stackId="a" fill="var(--color-onLeave)" radius={[4, 4, 0, 0]} name="On Leave" activeBar={{ fill: COLORS.onLeave.hover }} />
          </BarChart>
        </ChartContainer>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 px-4 pb-3 pt-3">
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-2xl font-bold" style={{ color: COLORS.present.stat }}>
            {summaryStats.avgPresent}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Avg Present / Day</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-lg font-bold" style={{ color: COLORS.onLeave.stat }}>
            {summaryStats.bestDay.day}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Best Day</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: COLORS.onLeave.stat }}>
            {summaryStats.bestDay.present} present
          </p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 flex flex-col justify-center">
          <p className="text-2xl font-bold" style={{ color: COLORS.absent.stat }}>
            {summaryStats.absenceRate}%
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Absence Rate</p>
        </div>
      </div>
    </div>
  );
}