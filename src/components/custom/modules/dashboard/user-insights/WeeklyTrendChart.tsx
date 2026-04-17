"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { getWeekStartStr } from "@/src/lib/userInsightsUtils";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

const ALL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const COLORS = {
  present: { bar: "#2DD4BF", hover: "#14B8A6" },
  absent: { bar: "#C084FC", hover: "#A855F7" },
  onLeave: { bar: "#F59E0B", hover: "#D97706" },
};

const chartConfig = {
  present: { label: "Present", color: COLORS.present.bar },
  absent: { label: "Absent", color: COLORS.absent.bar },
  onLeave: { label: "On Leave", color: COLORS.onLeave.bar },
} satisfies ChartConfig;

const LEGEND = [
  { label: "Present", color: COLORS.present.bar },
  { label: "Absent", color: COLORS.absent.bar },
  { label: "On Leave", color: COLORS.onLeave.bar },
];

function CustomXTick({ x, y, payload, index, chartData }: any) {
  const item = chartData?.[index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fontSize={12} fill="var(--text-secondary)" fontWeight={500}>
        {payload?.value}
      </text>
      {item?.dateLabel && (
        <text x={0} y={0} dy={26} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" opacity={0.65}>
          {item.dateLabel}
        </text>
      )}
    </g>
  );
}

interface WeeklyTrendChartProps {
  date: string;
}

export default function WeeklyTrendChart({ date }: WeeklyTrendChartProps) {
  const insightsWeeklyTrendCache = useUserInsightsStore((s) => s.insightsWeeklyTrendCache);
  const weekStart = getWeekStartStr(date);
  const rawData = insightsWeeklyTrendCache[weekStart] ?? [];

  const byDay = new Map(rawData.map((entry: any) => [entry.day, entry]));
  const weekStartDate = new Date(`${weekStart}T00:00:00`);

  const chartData = ALL_DAYS.map((day, i) => {
    const entry = byDay.get(day) as any;
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(weekStartDate.getDate() + i);
    const dateLabel = dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return {
      day: day.slice(0, 3),
      dateLabel,
      present: entry?.present ?? 0,
      onLeave: entry?.onLeave ?? 0,
      absent: entry?.absent ?? 0,
      missedIn: entry?.missedIn ?? 0,
      missedOut: entry?.missedOut ?? 0,
      total: entry?.total ?? 0,
    };
  });

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-row justify-between items-center px-4 py-4">
        <h5 className="text-lg text-text-primary font-bold pb-2">Weekly Attendance Trend</h5>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="relative w-full flex-1 min-h-[220px] -left-[10px]">
        <BarChart data={chartData} barSize={28} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={6}
            axisLine={false}
            interval={0}
            height={44}
            tick={<CustomXTick chartData={chartData} />}
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
    </div>
  );
}