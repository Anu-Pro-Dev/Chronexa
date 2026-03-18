"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer } from "@/src/components/ui/chart";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

const chartConfig = {
  present: { label: "Present", color: "#378ADD" },
  onLeave: { label: "On Leave", color: "#7F77DD" },
  absent: { label: "Absent", color: "#D85A30" },
  noLogin: { label: "No Login", color: "#9B9B9B" },
} satisfies ChartConfig;

export default function AttendanceSplitChart() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsDailySummaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);

  const today = new Date().toISOString().split('T')[0];
  const summary = insightsDailySummaryCache[today];

  const splitData = [
    { name: "Present", value: summary?.present ?? 0, color: "#378ADD" },
    { name: "On Leave", value: summary?.onLeave ?? 0, color: "#7F77DD" },
    { name: "Absent", value: summary?.absent ?? 0, color: "#D85A30" },
    { name: "No Login", value: summary?.noAppLogin ?? 0, color: "#9B9B9B" },
  ];

  const totalStaff = summary?.totalStaff ?? splitData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-text-primary">Attendance Split</p>
      {loadingUserInsights && !summary ? (
        <div className="flex items-center justify-center h-[140px] animate-pulse">
          <div className="h-[120px] w-[120px] rounded-full bg-border" />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ChartContainer config={chartConfig} className="h-[140px] w-[140px] shrink-0 aspect-square">
            <PieChart>
              <Pie
                data={splitData}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--accent)"
              >
                {splitData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl">
                      <span className="font-medium text-text-primary">{item.name}: {item.value}</span>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col gap-2 flex-1">
            {splitData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border-t border-border pt-2 flex justify-between text-xs">
        <span className="text-text-secondary">Total Staff</span>
        <span className="font-bold text-text-primary">{totalStaff}</span>
      </div>
    </div>
  );
}
