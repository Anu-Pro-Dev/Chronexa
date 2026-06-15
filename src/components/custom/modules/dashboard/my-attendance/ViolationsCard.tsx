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
  }, [ready, targetStr]);

  return values;
}

function ViolationsCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const attendanceDetails = useDashboardStore((s) => s.attendanceDetails);
  const loadingDashboard = useDashboardStore((s) => s.loadingDashboard);

  const lateInRaw = formatValue(attendanceDetails?.LateInCount);
  const earlyOutRaw = formatValue(attendanceDetails?.EarlyOutCount);
  const missedInRaw = formatValue(attendanceDetails?.MissedInCount);
  const missedOutRaw = formatValue(attendanceDetails?.MissedOutCount);
  const totalRaw = lateInRaw + earlyOutRaw + missedInRaw + missedOutRaw;

  const hasData = !!attendanceDetails && !loadingDashboard;

  const animated = useCountUp(
    { lateIn: lateInRaw, earlyOut: earlyOutRaw, missedIn: missedInRaw, missedOut: missedOutRaw },
    hasData,
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pieColors = ["#E67E22", "#D2691E", "#DA153E", "#C0392B"];
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
      color: "#E67E22",
      icon: LateInIcon("#E67E22"),
    },
    {
      label: t?.early_out || "Early Check-Out",
      value: animated.earlyOut,
      color: "#D2691E",
      icon: EarlyOutIcon("#D2691E"),
    },
    {
      label: t?.missed_in || "Missing Check-In",
      value: animated.missedIn,
      color: "#DA153E",
      icon: MissedInIcon("#DA153E"),
    },
    {
      label: t?.missed_out || "Missing Check-Out",
      value: animated.missedOut,
      color: "#C0392B",
      icon: MissedOutIcon("#C0392B"),
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
        <div className="min-w-0">
          <h5 className="text-lg text-text-primary font-bold">
            {t?.discrepancies || "Discrepancies"}
          </h5>
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
                  <feDropShadow dx={0} dy={2} stdDeviation={3} floodColor={"#000"} floodOpacity={0.2} />
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
              <p className="text-3xl font-bold text-text-primary ">{totalRaw}</p>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mt-0.5">Total</p>
              
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-4 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="bg-background rounded-[12px] border border-border/40 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-border/80 h-[110px]"
              >
                <div
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: `${card.color}18` }}
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
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
    </div>
  );
}

export default ViolationsCard;
