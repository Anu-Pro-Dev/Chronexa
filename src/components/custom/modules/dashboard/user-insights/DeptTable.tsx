"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface DeptRow {
  name: string;
  present: number;
  total: number;
}

function barColor(pct: number) {
  if (pct >= 90) return "#1D9E75";
  if (pct >= 75) return "#E6A817";
  return "#D85A30";
}

export default function DeptTable() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsDeptAttendanceCache = useUserInsightsStore((s) => s.insightsDeptAttendanceCache);

  const today = new Date().toISOString().split('T')[0];
  const deptData: DeptRow[] = insightsDeptAttendanceCache[today] ?? [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <p className="text-base font-medium text-text-primary">Department Attendance</p>
      {loadingUserInsights && deptData.length === 0 ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-border rounded" />
          ))}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-border">
              <th className="pb-2 text-left font-medium">Department</th>
              <th className="pb-2 text-right font-medium">Present</th>
              <th className="pb-2 pl-3 w-24 font-medium">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {deptData.map((row) => {
              const pct = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
              return (
                <tr key={row.name} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-text-primary font-medium">{row.name}</td>
                  <td className="py-3 text-right text-text-secondary">
                    {row.present}/{row.total}
                  </td>
                  <td className="py-3 pl-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: barColor(pct) }}
                        />
                      </div>
                      <span className="text-text-secondary w-7 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
