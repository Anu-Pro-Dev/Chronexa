"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { ClockIcon, VoilationIcon } from "@/src/icons/icons";
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
      label: "Late",
      filter: "late",
      value: weekData?.TotalLateCount || 0,
      color: "#FF6347",
      icon: <ClockIcon color="#FF6347" />,
    },
    {
      label: "Early Out",
      filter: "early",
      value: weekData?.TotalEarlyOutCount || 0,
      color: "#FFBF00",
      icon: <ArrowUpIcon className="size-5 text-[#FFBF00]" />,
    },
    {
      label: "Missed Punch",
      filter: "missed_punch",
      value: weekData?.TotalMissedPunchCount || 0,
      color: "#0078D4",
      icon: <VoilationIcon color="#0078D4" />,
    },
    {
      label: "Incomplete Duty",
      filter: "incomplete_duty",
      value: weekData?.TotalIncompleteDutyCount || 0,
      color: "#1E9090",
      icon: <ArrowDownIcon className="size-5 text-[#1E9090]" />,
    },
  ];

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
    <div className="shadow-card rounded-[10px] bg-accent p-2 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between p-4 pb-2 shrink-0">
        <h5 className="text-lg font-medium text-text-primary">
          {t?.weekly_violation_summary || "Weekly Discrepancies Summary"}
        </h5>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-secondary font-medium whitespace-nowrap">
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
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
      <div className="grid grid-cols-4 gap-2 px-2 pb-2 shrink-0">
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
            className="bg-background rounded-lg border border-border px-2 py-6 flex flex-col items-center gap-1 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:brightness-95 active:scale-[0.98] transition-all duration-150"
            style={{ '--tw-ring-color': widget.color } as React.CSSProperties}
          >
            <div className="icon-group bg-accent w-[28px] h-[28px] flex justify-center items-center rounded-[8px]"
              style={{ boxShadow: `0 0 12px 8px ${widget.color}08` }}>
              {widget.icon}
            </div>
            <p className="text-base font-medium" style={{ color: widget.color }}>
              {widget.value}
            </p>
            <p className="text-text-secondary font-semibold text-xs text-center">{widget.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 scrollbar-hide mt-2">
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
