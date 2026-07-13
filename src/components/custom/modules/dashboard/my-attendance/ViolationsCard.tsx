"use client";
import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  MissedInIcon,
  MissedOutIcon,
  EarlyOutIcon,
  LateInIcon,
} from "@/src/icons/icons";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";
import { PieChart, Pie, Cell } from "recharts";
import DiscrepancyDetailModal, { type DiscrepancyFilter } from "./DiscrepancyDetailModal";

const formatValue = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseInt(value) || 0 : Number(value) || 0;
};

function useCountUp(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0])),
  );
  const rafRef = useRef<number | null>(null);
  const targetStr = JSON.stringify(target);

  useEffect(() => {
    setValues(Object.fromEntries(keys.map((k) => [k, 0])));
    if (!ready) return;

    const startTime = Date.now();
    const duration = 800;
    const snapshot = { ...target };

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValues(
        Object.fromEntries(
          Object.entries(snapshot).map(([k, v]) => [k, Math.floor(v * progress)]),
        ),
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, target, targetStr, keys]);

  return values;
}

function ViolationsCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const attendanceDetails = useDashboardStore((s) => s.attendanceDetails);
  const loadingDashboard = useDashboardStore((s) => s.loadingDashboard);

  // Monthly figures for late / early (fall back to the daily field if the
  // monthly key is absent). Missed in/out have no monthly counterpart, so the
  // API totals are used as-is.
  const lateInRaw = formatValue(attendanceDetails?.MonthlyLate ?? attendanceDetails?.Late);
  const earlyOutRaw = formatValue(attendanceDetails?.MonthlyEarly ?? attendanceDetails?.Early);
  const missedInRaw = formatValue(attendanceDetails?.TotalMissedIn);
  const missedOutRaw = formatValue(attendanceDetails?.TotalMissedOut);
  const totalRaw = lateInRaw + earlyOutRaw + missedInRaw + missedOutRaw;

  const hasData = !!attendanceDetails && !loadingDashboard;

  const animated = useCountUp(
    { lateIn: lateInRaw, earlyOut: earlyOutRaw, missedIn: missedInRaw, missedOut: missedOutRaw },
    hasData,
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [active, setActive] = useState<{ filter: DiscrepancyFilter; label: string; color: string; count: number } | null>(null);

  const pieColors = ["#F59E0B", "#38BDF8", "#FB7185", "#8B5CF6"];
  const pieData = [
    { name: t?.late_in || "Late Check-In", value: lateInRaw, color: pieColors[0] },
    { name: t?.early_out || "Early Check-Out", value: earlyOutRaw, color: pieColors[1] },
    { name: t?.missed_in || "Missing Check-In", value: missedInRaw, color: pieColors[2] },
    { name: t?.missed_out || "Missing Check-Out", value: missedOutRaw, color: pieColors[3] },
  ].filter((d) => d.value > 0);

  const chartData = totalRaw > 0 ? pieData : [
    { name: "", value: 1, color: "#e5e7eb" },
  ];

  const exportColumns: ExportColumn[] = [
    { header: "Type", key: "type", width: 20 },
    { header: "Count", key: "count", width: 10 },
  ];

  const exportData = [
    { type: "Late Check-In", count: lateInRaw },
    { type: "Early Check-Out", count: earlyOutRaw },
    { type: "Missing Check-In", count: missedInRaw },
    { type: "Missing Check-Out", count: missedOutRaw },
  ];

  const metricCards = [
    {
      label: t?.late_in || "Late Check-In",
      value: animated.lateIn,
      color: "#F59E0B",
      icon: LateInIcon("#F59E0B"),
      filter: "late" as DiscrepancyFilter,
      count: lateInRaw,
    },
    {
      label: t?.early_out || "Early Check-Out",
      value: animated.earlyOut,
      color: "#38BDF8",
      icon: EarlyOutIcon("#38BDF8"),
      filter: "early" as DiscrepancyFilter,
      count: earlyOutRaw,
    },
    {
      label: t?.missed_in || "Missing Check-In",
      value: animated.missedIn,
      color: "#FB7185",
      icon: MissedInIcon("#FB7185"),
      filter: "missedIn" as DiscrepancyFilter,
      count: missedInRaw,
    },
    {
      label: t?.missed_out || "Missing Check-Out",
      value: animated.missedOut,
      color: "#8B5CF6",
      icon: MissedOutIcon("#8B5CF6"),
      filter: "missedOut" as DiscrepancyFilter,
      count: missedOutRaw,
    },
  ];

  if (loadingDashboard && !attendanceDetails) {
    return (
      <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex items-center gap-6 w-full overflow-hidden">
            <div className="w-[260px] min-w-[260px] h-[220px] bg-gray-100 dark:bg-gray-800 rounded-[10px]" />
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[110px] bg-gray-100 dark:bg-gray-800 rounded-[10px]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-[#EF4444] via-[#F97316] to-[#F59E0B]" /> */}
          <h5 className="text-lg text-text-primary font-bold">
            {t?.monthly_discrepancies_summary || "Monthly Discrepancies Summary"}
          </h5>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-2 hidden sm:block" />
        </div>
        <ExportButton
          data={exportData}
          columns={exportColumns}
          meta={{ title: "Attendance Discrepancies" }}
          className="shrink-0"
        />
      </div>

      <div className="flex items-center gap-6 w-full overflow-hidden">
        <div className="w-[260px] min-w-[260px] flex items-center justify-center relative">
          <PieChart width={220} height={220}>
            <defs>
              {chartData.map((_, index) => (
                <filter key={`shadow-${index}`} id={`ps-${index}`}>
                  <feDropShadow dx={0} dy={2} stdDeviation={4} floodColor={"#000"} floodOpacity={0.25} />
                </filter>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx={110}
              cy={110}
              innerRadius={60}
              outerRadius={95}
              paddingAngle={totalRaw > 0 ? 4 : 0}
              dataKey="value"
              cornerRadius={totalRaw > 0 ? 6 : 0}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={totalRaw > 0 && hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1}
                  filter={totalRaw > 0 && hoveredIndex === index ? `url(#ps-${index})` : undefined}
                  style={{ transition: "opacity 0.3s ease", cursor: totalRaw > 0 ? "pointer" : "default" }}
                />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">{totalRaw}</p>
              <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">Total</p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 mr-4">
          <div className="grid grid-cols-4 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                role="button"
                tabIndex={0}
                onClick={() => setActive({ filter: card.filter, label: card.label, color: card.color, count: card.count })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive({ filter: card.filter, label: card.label, color: card.color, count: card.count });
                  }
                }}
                className="bg-background rounded-[12px] p-3.5 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:ring-2 hover:ring-offset-1 h-[110px] border cursor-pointer"
                style={{ borderColor: `${card.color}22`, "--tw-ring-color": card.color } as React.CSSProperties}
              >
                <div
                  className="w-[36px] h-[36px] flex items-center justify-center rounded-[10px]"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}20, ${card.color}08)`,
                    border: `1.5px solid ${card.color}44`,
                    boxShadow: `0 0 16px 4px ${card.color}15`,
                  }}
                >
                  {React.cloneElement(card.icon as React.ReactElement, {
                    style: { color: card.color, width: '20px', height: '20px' },
                  })}
                </div>
                <p className="text-2xl font-bold text-text-primary leading-none">{card.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary text-center leading-tight">
                  {card.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DiscrepancyDetailModal
        open={!!active}
        onOpenChange={(o) => { if (!o) setActive(null); }}
        filter={active?.filter ?? "late"}
        type={active?.label ?? ""}
        color={active?.color ?? "#000000"}
        count={active?.count ?? 0}
      />
    </div>
  );
}

export default ViolationsCard;