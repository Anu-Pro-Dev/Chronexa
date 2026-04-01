"use client";

import * as React from "react";

// ─── Shimmer primitive ────────────────────────────────────────────────────────
// A single reusable block that plays the travelling-highlight animation.
// All sizes/shapes are controlled via className from the caller.
function Shimmer({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden bg-shimmer-base rounded-md ${className}`}
      style={style}
    >
      <div className="shimmer-sweep" />
    </div>
  );
}

// ─── KPI card skeleton (mirrors KpiCard exactly) ──────────────────────────────
function KpiCardSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2">
      {/* label row + icon */}
      <div className="flex items-start justify-between gap-2">
        <Shimmer className="h-3 w-24 rounded-sm" />
        <Shimmer className="w-8 h-8 rounded-[8px] shrink-0" />
      </div>
      {/* big number */}
      <Shimmer className="h-7 w-12 rounded-sm" />
      {/* sub-label */}
      <Shimmer className="h-3 w-28 rounded-sm" />
      {/* progress bar track */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <Shimmer className="h-full w-2/3 rounded-full" />
      </div>
    </div>
  );
}

// ─── KPI grid skeleton (6 cards, mirrors grid-cols-2/3/6) ────────────────────
function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Chart card skeleton (title + legend + chart area) ───────────────────────
function ChartCardSkeleton({ height = "h-[180px]", legendDots = 2 }: { height?: string; legendDots?: number }) {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      {/* header row */}
      <div className="flex items-center justify-between px-1 pb-2">
        <Shimmer className="h-5 w-48 rounded-sm" />
        <div className="flex items-center gap-3">
          {Array.from({ length: legendDots }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Shimmer className="w-2 h-2 rounded-full" />
              <Shimmer className="h-3 w-14 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
      {/* chart body */}
      <div className={`${height} w-full flex items-end gap-1 px-2`}>
        {/* Fake "bars/wave" to hint at chart shape */}
        {Array.from({ length: 18 }).map((_, i) => {
          const h = [40, 55, 30, 70, 85, 60, 45, 90, 75, 50, 65, 80, 35, 55, 70, 45, 60, 80][i % 18];
          return (
            <Shimmer
              key={i}
              className="flex-1 rounded-sm opacity-60"
              style={{ height: `${h}%` } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Table card skeleton ──────────────────────────────────────────────────────
function TableCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3 h-full">
      <Shimmer className="h-5 w-44 rounded-sm" />
      {/* table header */}
      <div className="grid grid-cols-5 gap-3 pb-1 border-b border-border">
        {["Department", "Present", "Absent", "Leave", "Rate"].map((col) => (
          <Shimmer key={col} className="h-3 rounded-sm" />
        ))}
      </div>
      {/* table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-3 items-center py-0.5">
          <Shimmer className="h-3.5 w-full rounded-sm" />
          <Shimmer className="h-3.5 w-8 rounded-sm mx-auto" />
          <Shimmer className="h-3.5 w-8 rounded-sm mx-auto" />
          <Shimmer className="h-3.5 w-8 rounded-sm mx-auto" />
          {/* progress pill */}
          <Shimmer className="h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Donut / split chart skeleton ────────────────────────────────────────────
function DonutCardSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3 h-full">
      <Shimmer className="h-5 w-40 rounded-sm" />
      {/* fake donut */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <Shimmer className="w-32 h-32 rounded-full" />
          {/* centre hole */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent" />
          </div>
        </div>
      </div>
      {/* legend rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Shimmer className="w-2.5 h-2.5 rounded-full shrink-0" />
          <Shimmer className="h-3 flex-1 rounded-sm" />
          <Shimmer className="h-3 w-8 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

// ─── Early despatch skeleton ──────────────────────────────────────────────────
function EarlyDespatchSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-4">
      <Shimmer className="h-5 w-40 rounded-sm" />
      {/* summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Shimmer className="h-3 w-20 rounded-sm" />
            <Shimmer className="h-6 w-12 rounded-sm" />
          </div>
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-1 border-b border-border last:border-0">
          <Shimmer className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Shimmer className="h-3.5 w-36 rounded-sm" />
            <Shimmer className="h-3 w-24 rounded-sm opacity-60" />
          </div>
          <Shimmer className="h-5 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Overtime card skeleton ───────────────────────────────────────────────────
function OvertimeCardSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <Shimmer className="h-5 w-44 rounded-sm" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <Shimmer className="h-3.5 w-32 rounded-sm" />
            <Shimmer className="h-3.5 w-16 rounded-sm" />
          </div>
          <Shimmer className="h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Alerts card skeleton ─────────────────────────────────────────────────────
function AlertsCardSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <Shimmer className="h-5 w-28 rounded-sm" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Shimmer className="w-7 h-7 rounded-[8px] shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <Shimmer className="h-3.5 w-full rounded-sm" />
            <Shimmer className="h-3 w-3/4 rounded-sm opacity-60" />
          </div>
          <Shimmer className="h-5 w-10 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Full page skeleton — mirrors UserInsightsPage layout exactly ─────────────
export default function UserInsightsSkeleton() {
  return (
    <>
      {/*
        Shimmer keyframes injected once via a <style> tag.
        This avoids any Tailwind dependency and works in all Next.js RSC / CSR modes.
        The sweep uses a 110° angled gradient that travels left-to-right,
        matching the "travelling highlight" pattern used by GitHub, Linear, Vercel, etc.
      */}
      <style>{`
        .bg-shimmer-base {
          background-color: var(--shimmer-base, rgba(148,163,184,0.15));
        }
        .shimmer-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 25%,
            var(--shimmer-highlight, rgba(255,255,255,0.45)) 50%,
            transparent 75%
          );
          background-size: 200% 100%;
          animation: shimmer-slide 1.6s ease-in-out infinite;
        }
        @keyframes shimmer-slide {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        /* Dark-mode aware highlight — subtler white on dark backgrounds */
        .dark .shimmer-sweep,
        .night .shimmer-sweep {
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255,255,255,0.10) 50%,
            transparent 75%
          );
          background-size: 200% 100%;
          animation: shimmer-slide 1.6s ease-in-out infinite;
        }
        /* Stagger cards so the sweep ripples across the grid, not all at once */
        .shimmer-stagger-1 .shimmer-sweep { animation-delay: 0.08s; }
        .shimmer-stagger-2 .shimmer-sweep { animation-delay: 0.16s; }
        .shimmer-stagger-3 .shimmer-sweep { animation-delay: 0.24s; }
        .shimmer-stagger-4 .shimmer-sweep { animation-delay: 0.32s; }
        .shimmer-stagger-5 .shimmer-sweep { animation-delay: 0.40s; }
      `}</style>

      <div className="flex flex-col gap-4">
        {/* Row 1 — KPI grid (6 cards) */}
        <KpiGridSkeleton />

        {/* Row 2 — Hourly Trend full-width chart */}
        <ChartCardSkeleton height="h-[180px]" legendDots={2} />

        {/* Row 3 — Dept table (2/3) + Attendance split donut (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <TableCardSkeleton rows={5} />
          </div>
          <div className="flex flex-col">
            <DonutCardSkeleton />
          </div>
        </div>

        {/* Row 4 — Early despatch (55%) + Overtime (45%) */}
        <div className="grid grid-cols-1 xl:grid-cols-[55%_45%] gap-4">
          <EarlyDespatchSkeleton />
          <OvertimeCardSkeleton />
        </div>

        {/* Row 5 — Weekly trend chart (2/3) + Alerts (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartCardSkeleton height="h-[200px]" legendDots={4} />
          </div>
          <div>
            <AlertsCardSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}