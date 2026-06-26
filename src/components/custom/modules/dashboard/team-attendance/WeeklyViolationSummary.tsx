"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { ClockIcon, ViolationIcon } from "@/src/icons/icons";
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ViolationDrillDownModal from './ViolationDrillDownModal';

interface WeeklyViolationData {
  summary_id: number;
  TotalLateCount: number;
  TotalEarlyOutCount: number;
  TotalMissedPunchCount: number;
  TotalIncompleteDutyCount: number;
}

interface EmployeeRow {
  EmployeeID: string;
  EmployeeName: string;
  TotalLate: number;
  TotalEarlyOut: number;
  TotalMissedPunch: number;
  TotalIncompleteDuty: number;
}

interface ModalState {
  open: boolean;
  type: string;
  filter: string;
  count: number;
  color: string;
  summaryId: number;
}

function getWeekRange(offset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday, end: sunday };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function WeeklyViolationSummary() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const fetchWeeklyViolationSummary = useDashboardStore((s) => s.fetchWeeklyViolationSummary);
  const weeklyViolationCache = useDashboardStore((s) => s.weeklyViolationCache);
  const loadingWeeklyViolation = useDashboardStore((s) => s.loadingWeeklyViolation);
  const fetchWeeklyViolationDetail = useDashboardStore((s) => s.fetchWeeklyViolationDetail);
  const weeklyViolationDetailCache = useDashboardStore((s) => s.weeklyViolationDetailCache);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [weekOffset, setWeekOffset] = useState(-1);

  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const weekstart = toISODate(weekRange.start);
  const weekend = toISODate(weekRange.end);
  const cacheKey = `${weekstart}_${weekend}`;

  useEffect(() => {
    fetchWeeklyViolationSummary(weekstart, weekend);
  }, [weekstart, weekend, fetchWeeklyViolationSummary]);

  const rawData: WeeklyViolationData | null = weeklyViolationCache[cacheKey];
  const weekData: WeeklyViolationData | null = rawData || null;
  const summaryId = weekData?.summary_id;

  useEffect(() => {
    if (summaryId) {
      fetchWeeklyViolationDetail(summaryId, "", 5);
    }
  }, [summaryId, fetchWeeklyViolationDetail]);

  const allEmployees: EmployeeRow[] = summaryId
    ? (weeklyViolationDetailCache[`${summaryId}__5`]?.employees ?? [])
    : [];

  const widgets = [
    {
      label: "Late In",
      subLabel: "arrivals this week",
      filter: "late",
      value: weekData?.TotalLateCount || 0,
      color: "#FF6347",
      icon: <ClockIcon color="#FF6347" className="w-4 h-4"/>,
    },
    {
      label: "Early Out",
      subLabel: "left early this week",
      filter: "early",
      value: weekData?.TotalEarlyOutCount || 0,
      color: "#FFBF00",
      icon: <ArrowUpIcon className="size-5 text-[#FFBF00] w-4 h-4"/>,
    },
    {
      label: "Missed Punch",
      subLabel: "missed punch this week",
      filter: "missed_punch",
      value: weekData?.TotalMissedPunchCount || 0,
      color: "#0078D4",
      icon: <ViolationIcon color="#0078D4" />,
    },
    {
      label: "Incomplete Duty",
      subLabel: "incomplete this week",
      filter: "incomplete_duty",
      value: weekData?.TotalIncompleteDutyCount || 0,
      color: "#1E9090",
      icon: <ArrowDownIcon className="size-5 text-[#1E9090] w-4 h-4"/>,
    },
  ];

  const totalViolations =
    (weekData?.TotalLateCount || 0) +
    (weekData?.TotalEarlyOutCount || 0) +
    (weekData?.TotalMissedPunchCount || 0) +
    (weekData?.TotalIncompleteDutyCount || 0) || 1;

  function openDrillDown(widget: typeof widgets[0]) {
    setModal({
      open: true,
      type: widget.label,
      filter: widget.filter,
      count: widget.value,
      color: widget.color,
      summaryId: weekData?.summary_id || 0,
    });
  }

  function closeDrillDown() {
    setModal((prev) => (prev ? { ...prev, open: false } : null));
  }

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-4 h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-bold text-text-primary">
          {t?.weekly_violation_summary || "Weekly Discrepancies Summary"}
        </h5>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-secondary font-medium whitespace-nowrap px-1">
            {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
          </span>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            disabled={weekOffset >= -1}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI cards — matches KpiGrid / EmployeeCardData style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-2">
        {widgets.map((widget) => (
          <div
            key={widget.label}
            role="button"
            tabIndex={0}
            onClick={() => openDrillDown(widget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDrillDown(widget);
              }
            }}
            className="bg-background rounded-[8px] p-4 flex flex-col gap-2 select-none cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:brightness-95 hover:scale-[1.02] hover:shadow-popup active:scale-[0.98] shadow-md"
            style={{ "--tw-ring-color": widget.color } as React.CSSProperties}
          >
            {/* Label + icon */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider leading-tight"
                style={{ color: widget.color }}
              >
                {widget.label}
              </p>
              <div
                className="bg-accent w-[24px] h-[24px] shrink-0 flex items-center justify-center rounded-[8px]"
                style={{ color: widget.color, boxShadow: `0 0 16px 6px ${widget.color}22` }}
              >
                {widget.icon}
              </div>
            </div>

            {/* Value */}
            <p className="text-2xl font-medium text-text-primary leading-none">
              {widget.value}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((widget.value / totalViolations) * 100, 100)}%`,
                  backgroundColor: widget.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Employee table */}
      <div className="overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-accent z-10 border-b border-border-accent">
            <tr className="text-text-secondary text-[11px] uppercase tracking-wider font-semibold">
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-center" style={{ color: "#FF6347" }}>Late</th>
              <th className="px-3 py-2 text-center" style={{ color: "#FFBF00" }}>Early</th>
              <th className="px-3 py-2 text-center" style={{ color: "#0078D4" }}>Missed</th>
              <th className="px-3 py-2 text-center" style={{ color: "#1E9090" }}>Incomplete</th>
            </tr>
          </thead>
          <tbody>
            {allEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-text-secondary text-sm">
                  No employees found.
                </td>
              </tr>
            ) : (
              allEmployees.map((emp, idx) => (
                <tr
                  key={emp.EmployeeID || idx}
                  className="border-b border-border-accent/50 last:border-0 hover:bg-background transition-colors"
                >
                  <td className="py-2 px-3 text-text-primary font-medium truncate max-w-[180px]">
                    {emp.EmployeeName}
                  </td>
                  <td className="py-2 px-3 text-center tabular-nums" style={{ color: "#FF6347" }}>{emp.TotalLate}</td>
                  <td className="py-2 px-3 text-center tabular-nums" style={{ color: "#FFBF00" }}>{emp.TotalEarlyOut}</td>
                  <td className="py-2 px-3 text-center tabular-nums" style={{ color: "#0078D4" }}>{emp.TotalMissedPunch}</td>
                  <td className="py-2 px-3 text-center tabular-nums" style={{ color: "#1E9090" }}>{emp.TotalIncompleteDuty}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ViolationDrillDownModal
          open={modal.open}
          onOpenChange={(open) => (open ? undefined : closeDrillDown())}
          type={modal.type}
          filter={modal.filter}
          count={modal.count}
          color={modal.color}
          summaryId={modal.summaryId}
        />
      )}
    </div>
  );
}

export default WeeklyViolationSummary;