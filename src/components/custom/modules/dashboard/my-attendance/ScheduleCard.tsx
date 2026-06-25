"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";
import { useAttendanceData } from "./AttendanceData";

const timeStringToHours = (timeStr: string | number | null): number => {
  if (timeStr === null || timeStr === undefined) return 0;
  if (typeof timeStr === "number") return timeStr;
  const cleanStr = timeStr.trim();
  const parts = cleanStr.split(':');
  if (parts.length < 2) {
    const n = parseFloat(cleanStr);
    return isNaN(n) ? 0 : n;
  }
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours + (minutes / 60);
};

const formatHrs = (value: number) => {
  const h = Math.floor(value);
  const m = Math.round((value - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

// ── Premium gradient circular ring ──────────────────────────

function PremiumRing({ pct, size = 110, strokeWidth = 8 }: { pct: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const dur = 1000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      setAnimated(pct * t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [pct]);

  const offset = circ - (circ * animated) / 100;

  return (
    <div className="relative inline-flex" style={{ filter: 'drop-shadow(0 0 12px rgba(160, 90, 255, 0.25))' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8CD231" />
            <stop offset="100%" stopColor="#A05AFF" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border, #e5e7eb)" strokeWidth={strokeWidth} opacity="0.4" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-100"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-text-primary leading-none">{Math.round(animated)}%</p>
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mt-0.5">complete</p>
        </div>
      </div>
    </div>
  );
}

// ── Gradient progress bar ───────────────────────────────────

function GradientBar({ pct, color1, color2 }: { pct: number; color1: string; color2: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="h-2 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color1}, ${color2})`,
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

function ScheduleCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const { attendanceDetails, loading, error: attendanceError } = useAttendanceData();
  const errorDashboard = attendanceError;

  const stats = useMemo(() => {
    if (!attendanceDetails) {
      return { totalHours: 0, workedHours: 0, overtimeHours: 0, pendingHours: 0, completionPct: 0 };
    }
    const totalHours = timeStringToHours(attendanceDetails.TotalMonthlyExpectedWrkHrs);
    const workedHours = timeStringToHours(attendanceDetails.TotalWorkedHrs);
    const pendingHours = timeStringToHours(attendanceDetails.PendingWorkHrs);
    const overtimeHours = timeStringToHours(attendanceDetails.TotalExtraHrs);
    const completionPct = attendanceDetails.WorkCompletionPercent || 0;
    return { totalHours, workedHours, overtimeHours, pendingHours, completionPct };
  }, [attendanceDetails]);

  const extraStats = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    const dailyAvg = dayOfMonth > 0 ? stats.workedHours / dayOfMonth : 0;
    const remainingHours = Math.max(0, stats.totalHours - stats.workedHours);
    const overtimePct = stats.totalHours > 0 ? Math.round((stats.overtimeHours / stats.totalHours) * 100) : 0;
    const workedPct = stats.totalHours > 0 ? Math.round((stats.workedHours / stats.totalHours) * 100) : 0;
    const pendingPct = stats.totalHours > 0 ? Math.round((stats.pendingHours / stats.totalHours) * 100) : 0;
    return { dailyAvg, remainingHours, overtimePct, workedPct, pendingPct, dayOfMonth };
  }, [stats]);

  const segments = [
    { label: t?.worked || "Worked", value: stats.workedHours, pct: extraStats.workedPct, color1: "#A05AFF", color2: "#8B5CF6" },
    { label: t?.overtime || "Overtime", value: stats.overtimeHours, pct: extraStats.overtimePct, color1: "#8CD231", color2: "#65B025" },
    { label: t?.pending || "Pending", value: stats.pendingHours, pct: extraStats.pendingPct, color1: "#78909C", color2: "#78909C" },
  ];

  if (errorDashboard) {
    return (
      <div className='flex justify-center items-center h-[200px] shadow-card rounded-[10px] bg-accent'>
        <p className='text-text-secondary'>No schedule data available</p>
      </div>
    );
  }

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-5 flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="text-lg text-text-primary font-bold">{t?.monthly_schedule}</h5>
        </div>
        <Link
          href="/scheduling/weekly-schedule/organization-schedule"
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {translations?.buttons?.show_all} &rarr;
        </Link>
      </div>

      {/* Hero section — ring + primary metrics */}
      <div className="bg-gradient-to-br from-background to-background/50 rounded-[12px] p-5 flex items-center gap-6">
        <PremiumRing pct={stats.completionPct} size={110} strokeWidth={8} />

        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-widest">Total Expected</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{formatHrs(stats.totalHours)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-widest">Worked</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{formatHrs(stats.workedHours)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-widest">Remaining</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{formatHrs(extraStats.remainingHours)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-widest">Daily Average</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{formatHrs(extraStats.dailyAvg)}</p>
          </div>
        </div>
      </div>

      {/* Segment breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="bg-background rounded-[10px] p-3.5 flex flex-col gap-2 transition-all duration-200 hover:shadow-popup hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{seg.label}</span>
              <span className="text-[10px] font-semibold text-text-secondary">{seg.pct}%</span>
            </div>
            <span className="text-base font-bold text-text-primary">{formatHrs(seg.value)}</span>
            <GradientBar pct={seg.pct} color1={seg.color1} color2={seg.color2} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleCard;
