"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface LateEmployee {
  name: string;
  time: string;
  delayMinutes: number;
}

function badgeStyle(mins: number): { bg: string; text: string; label: string } {
  if (mins > 30) return { bg: "bg-[#FDECEA]", text: "text-[#D85A30]", label: `+${mins}m` };
  if (mins > 10) return { bg: "bg-[#FEF3E2]", text: "text-[#E6A817]", label: `+${mins}m` };
  return { bg: "bg-[#F3F3F3]", text: "text-text-secondary", label: `+${mins}m` };
}

export default function LateArrivals() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsLateArrivalsCache = useUserInsightsStore((s) => s.insightsLateArrivalsCache);

  const today = new Date().toISOString().split('T')[0];
  const lateArrivalsData = insightsLateArrivalsCache[today];

  const employees: LateEmployee[] = lateArrivalsData?.employees ?? [];
  const onTimePct: number = lateArrivalsData?.onTimePct ?? 0;
  const lateToday = employees.length;
  const avgDelay = lateToday > 0
    ? Math.round(employees.reduce((s, e) => s + e.delayMinutes, 0) / lateToday)
    : 0;

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <p className="text-base font-medium text-text-primary">Late Arrivals</p>

      {loadingUserInsights && !lateArrivalsData ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-border rounded" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 bg-border rounded" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-[#D85A30]">{lateToday}</span>
              <span className="text-xs text-text-secondary text-center">Late today</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-text-primary">{avgDelay}m</span>
              <span className="text-xs text-text-secondary text-center">Avg delay</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-[#1D9E75]">{onTimePct}%</span>
              <span className="text-xs text-text-secondary text-center">On time</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {employees.map((emp) => {
              const badge = badgeStyle(emp.delayMinutes);
              return (
                <div key={emp.name} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full shrink-0 bg-[#D85A30]" />
                  <span className="flex-1 text-sm font-medium text-text-primary truncate">{emp.name}</span>
                  <span className="text-xs text-text-secondary">{emp.time}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
