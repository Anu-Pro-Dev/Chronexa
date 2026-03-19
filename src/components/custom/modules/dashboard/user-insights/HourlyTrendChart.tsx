"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

const chartConfig = {
  checkins: { label: "Check-ins", color: "#8CD231" },
  checkouts: { label: "Check-outs", color: "#A05AFF" },
} satisfies ChartConfig;

interface HourlyTrendChartProps {
  date: string;
}

export default function HourlyTrendChart({ date }: HourlyTrendChartProps) {
  const loading = useUserInsightsStore((s) => s.loading);
  const insightsHourlyTrendCache = useUserInsightsStore((s) => s.insightsHourlyTrendCache);

  const hourlyData = insightsHourlyTrendCache[date] ?? [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between px-1 pb-4">
        <h5 className="text-lg text-text-primary font-bold">Hourly Attendance Trend</h5>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>
      {loading && hourlyData.length === 0 ? (
        <div className="h-[180px] w-full bg-border rounded animate-pulse" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <AreaChart data={hourlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="fillCheckins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="65%" stopColor="#8CD231" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8CD231" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillCheckouts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="65%" stopColor="#A05AFF" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#A05AFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="checkins" type="monotone" stroke="#8CD231" strokeWidth={2} fill="url(#fillCheckins)" dot={false} />
            <Area dataKey="checkouts" type="monotone" stroke="#A05AFF" strokeWidth={2} fill="url(#fillCheckouts)" dot={false} />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
