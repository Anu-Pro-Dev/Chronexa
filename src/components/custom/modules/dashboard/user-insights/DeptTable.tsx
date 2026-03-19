"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface DeptRow {
  name: string;
  present: number;
  total: number;
}

const DEPT_COLORS = [
  "#E05C97", 
  "#FFC107", 
  "#2A9D8F", 
  "#E76F51",  
  "#457B9D", 
  "#0DCAF0", 
  "#6A4C93", 
  "#F4D35E",
  "#0078D4", 
  "#FF6B2D", 
  "#1DAA61", 
  "#7D3FFF", 
  "#FFBF00", 
  "#FF3B3B", 
  "#2AD90F", 
  "#E6107C", 
  "#DA153E", 
  "#158993", 
  "#1D7A8A", 
  "#E63946", 
  "#52B788", 
  "#FF9F1C",
  
];

function getDeptColor(index: number) {
  return DEPT_COLORS[index % DEPT_COLORS.length];
}

interface DeptTableProps {
  date: string;
}

export default function DeptTable({ date }: DeptTableProps) {
  const loading = useUserInsightsStore((s) => s.loading);
  const insightsDeptAttendanceCache = useUserInsightsStore((s) => s.insightsDeptAttendanceCache);

  const deptData: DeptRow[] = insightsDeptAttendanceCache[date] ?? [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3 px-6">
      <h5 className="text-lg text-text-primary font-bold pb-2">Attendance by Department</h5>
      {loading && deptData.length === 0 ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded" />
          ))}
        </div>
      ) : deptData.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">No department data for this date</p>
      ) : (
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead>
            <tr className="text-text-secondary border-b border-border">
              <th className="pb-2 text-left font-medium">Department</th>
              <th className="pb-2 text-center font-medium">Present</th>
              <th className="pb-2 pl-3 font-medium">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {deptData.map((row, idx) => {
              const pct   = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
              const color = getDeptColor(idx);
              return (
                <tr key={row.name} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-text-primary font-medium">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="truncate">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-text-secondary tabular-nums">
                    {row.present.toLocaleString()}/{row.total.toLocaleString()}
                  </td>
                  <td className="py-3 pl-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-text-secondary w-7 text-right tabular-nums shrink-0">{pct}%</span>
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