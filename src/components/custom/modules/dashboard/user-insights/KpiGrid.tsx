"use client";

import * as React from "react";
import { PunchInIcon, PunchOutIcon, LeaveTakenIcon, AbsentIcon } from "@/src/icons/icons";
import { DevicePhoneMobileIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/solid";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

export interface KpiData {
  label: string;
  value: number | string;
  subLabel: string;
  progress: number;
  color: string;
  icon?: React.ReactNode;
}

interface KpiCardProps {
  data: KpiData;
}

function KpiCard({ data }: KpiCardProps) {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary leading-tight">
          {data.label}
        </p>
        {data.icon && (
          <div
            className="bg-background w-[32px] h-[32px] shrink-0 flex items-center justify-center rounded-[8px]"
            style={{ color: data.color, boxShadow: `0 0 16px 6px ${data.color}22` }}
          >
            {data.icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-text-primary leading-none">{data.value}</p>
      <p className="text-xs text-text-secondary">{data.subLabel}</p>
      <div className="h-1 w-full bg-border rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${data.progress}%`, backgroundColor: data.color }}
        />
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2 animate-pulse">
      <div className="h-3 w-20 bg-border rounded" />
      <div className="h-8 w-12 bg-border rounded" />
      <div className="h-3 w-24 bg-border rounded" />
      <div className="h-1 w-full bg-border rounded-full mt-1" />
    </div>
  );
}

interface KpiGridProps {
  date: string;
}

export default function KpiGrid({ date }: KpiGridProps) {
  const loading = useUserInsightsStore((s) => s.loading);
  const insightsDailySummaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);

  const summary = insightsDailySummaryCache[date];

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  const totalStaff = summary?.totalStaff ?? 0;

  const kpiData: KpiData[] = [
    {
      label: "CHECK-INS",
      value: summary?.checkIns ?? 0,
      subLabel: `of ${totalStaff} employees`,
      progress: totalStaff > 0 ? Math.round(((summary?.checkIns ?? 0) / totalStaff) * 100) : 0,
      color: "#378ADD",
      icon: <PunchInIcon color="#378ADD" className="w-6 h-6" />,
    },
    {
      label: "CHECK-OUTS",
      value: summary?.checkOuts ?? 0,
      subLabel: "completed today",
      progress: totalStaff > 0 ? Math.round(((summary?.checkOuts ?? 0) / totalStaff) * 100) : 0,
      color: "#1D9E75",
      icon: <PunchOutIcon color="#1D9E75" className="w-6 h-6" />,
    },
    {
      label: "PRESENT",
      value: summary?.presentCount ?? 0,
      subLabel: "currently at work",
      progress: totalStaff > 0 ? Math.round(((summary?.presentCount ?? 0) / totalStaff) * 100) : 0,
      color: "#1D9E75",
      icon: <UserPlusIcon color="#1D9E75" className="w-6 h-6" />,
    },
    {
      label: "ABSENT",
      value: summary?.absentCount ?? 0,
      subLabel: "not at work today",
      progress: totalStaff > 0 ? Math.round(((summary?.absentCount ?? 0) / totalStaff) * 100) : 0,
      color: "#D85A30",
      icon: <UserMinusIcon color="#D85A30" className="w-6 h-6" />,
    },
    {
      label: "ON LEAVE",
      value: summary?.onLeave ?? 0,
      subLabel: "approved absences",
      progress: totalStaff > 0 ? Math.round(((summary?.onLeave ?? 0) / totalStaff) * 100) : 0,
      color: "#7F77DD",
      icon: <AbsentIcon color="#7F77DD" className="w-6 h-6" />,
    },
    {
      label: "NO APP LOGIN",
      value: summary?.noAppLogin ?? 0,
      subLabel: "inactive today",
      progress: totalStaff > 0 ? Math.round(((summary?.noAppLogin ?? 0) / totalStaff) * 100) : 0,
      color: "#9B9B9B",
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  );
}
