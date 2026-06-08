"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";

interface AttendanceSplitChartProps {
  date: string;
}

const SLICES = [
  { key: "yesterdayPresentCount",  label: "Present",   from: "#86EFAC", to: "#34D399" },
  { key: "withoutLicense", label: "No Licensed", from: "#FDE68A", to: "#FCD34D" },
  { key: "yesterdayMissedIn",  label: "Missed In",  from: "#93C5FD", to: "#60A5FA" },
  { key: "yesterdayMissedOut",   label: "Missed Out",    from: "#FCA5A5", to: "#F87171" },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArcPath(cx: number, cy: number, r: number, innerR: number, startDeg: number, endDeg: number) {
  const start  = polarToCartesian(cx, cy, r, endDeg);
  const end    = polarToCartesian(cx, cy, r, startDeg);
  const iStart = polarToCartesian(cx, cy, innerR, endDeg);
  const iEnd   = polarToCartesian(cx, cy, innerR, startDeg);
  const large  = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${innerR} ${innerR} 0 ${large} 1 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
}

export default function AttendanceSplitChart({ date }: AttendanceSplitChartProps) {
  const insightsDailySummaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);
  const hasSummary = date in insightsDailySummaryCache;
  const summary = insightsDailySummaryCache[date];
  const { organizationId } = useUserInsightsOrganization();


  const values = SLICES.map((s) => Math.max((summary as any)?.[s.key] ?? 0, 0));
  const total = values.reduce((a, b) => a + b, 0);
  const totalStaff = summary?.totalStaff ?? total;

  const SIZE = 140, CX = 70, CY = 70, R = 62, INNER_R = 28, GAP = 1.5;

  let cursor = 0;
  const arcs = SLICES.map((s, i) => {
    const pct   = total > 0 ? values[i] / total : 1 / SLICES.length;
    const sweep = pct * 360;
    const start = cursor + GAP / 2;
    const end   = cursor + sweep - GAP / 2;
    cursor += sweep;
    return { ...s, value: values[i], start, end, pct };
  });

  const splitExportColumns: ExportColumn[] = [
    { header: "Category", key: "category", width: 20 },
    { header: "Count", key: "count", width: 12 },
  ];

  const splitExportData = arcs.map((arc) => ({
    category: arc.label,
    count: arc.value,
  }));

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 pb-4">
        <h5 className="text-lg text-text-primary font-bold">Yesterday's Attendance Split</h5>
        <ExportButton
          data={splitExportData}
          columns={splitExportColumns}
          meta={{
            title: "Yesterday's Attendance Split",
            filters: { Organization: String(organizationId ?? ""), Date: date },
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Donut */}
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            {arcs.map((arc) => {
              const p1 = polarToCartesian(CX, CY, R, arc.start);
              const p2 = polarToCartesian(CX, CY, R, arc.end);
              return (
                <linearGradient
                  key={arc.key}
                  id={`grad-${arc.key}`}
                  x1={p1.x / SIZE} y1={p1.y / SIZE}
                  x2={p2.x / SIZE} y2={p2.y / SIZE}
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%"   stopColor={arc.from} />
                  <stop offset="100%" stopColor={arc.to}   />
                </linearGradient>
              );
            })}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000022" />
            </filter>
          </defs>

          {arcs.map((arc) => (
            <path
              key={arc.key}
              d={donutArcPath(CX, CY, R, INNER_R, arc.start, arc.end)}
              fill={`url(#grad-${arc.key})`}
              filter="url(#shadow)"
            />
          ))}
          <circle cx={CX} cy={CY} r={INNER_R - 2} fill="var(--accent)" />
        </svg>

        {/* Legend — 2-column grid below donut */}
        <div className="w-full grid gap-x-4 gap-y-2">
          {arcs.map((arc) => (
            <div key={arc.key} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${arc.from}, ${arc.to})` }}
                />
                {arc.label}
              </span>
              <span className="font-semibold text-text-primary">{arc.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border py-2 flex justify-between text-xs">
        <span className="text-text-secondary">Total Users</span>
        <span className="font-medium text-text-primary">{totalStaff.toLocaleString()}</span>
      </div>
    </div>
  );
}