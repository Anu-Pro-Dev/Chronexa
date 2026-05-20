"use client";

/**
 * KpiGrid  (drill-down + attendance % card)
 * ──────────────────────────────────────────
 * 6 KPI cards always shown. Clicking any card opens DrillDownModal.
 *
 * Card 5 behaviour:
 *  - org 27       → "NO APP LOGIN"    (noAppLoginList drilldown)
 *  - all others   → "INCOMPLETE DUTY" (incompleteDuty drilldown)
 *
 * Card 6 behaviour:
 *  - org 27       → "License Enabled"  (licensedList drilldown)
 *  - all others   → "ATTENDANCE"       (attendancePct drilldown → stat panel)
 *
 * Cards 1–4 are identical for all orgs:
 *  CHECK-INS / CHECK-OUTS / ABSENT / ON LEAVE
 */

import * as React from "react";
import { PunchInIcon, PunchOutIcon, AbsentIcon } from "@/src/icons/icons";
import { AlertTriangle } from "lucide-react";
import {
  DevicePhoneMobileIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useUserInsightsOrganization } from "@/src/hooks/useUserInsightsOrganization";
import DrillDownModal, { DrillDownFilter } from "./DrillDownModal";


// ─────────────────────────────────────────────────────────────────────────────
// Count-up animation
// ─────────────────────────────────────────────────────────────────────────────

function useCountUp(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0]))
  );
  const rafRef = React.useRef<number | null>(null);
  const targetStr = JSON.stringify(target);

  React.useEffect(() => {
    // Always reset to 0 first (handles org/date change)
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
          Object.entries(snapshot).map(([k, v]) => [k, Math.floor(v * progress)])
        )
      );
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetStr]);

  return values;
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance % count-up — animates a float from 0 to target, returns "77.2%"
// FIX: accepts a resetKey so the effect re-fires on org/date change even when
//      the numeric target happens to be identical across two orgs.
// ─────────────────────────────────────────────────────────────────────────────

function useCountUpPct(target: number, ready: boolean, resetKey?: string): string {
  const [value, setValue] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    // Reset to 0 on every target/ready/resetKey change (covers org & date switches)
    setValue(0);
    if (!ready || target === 0) return;

    const startTime = Date.now();
    const duration = 800;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(parseFloat((target * progress).toFixed(1)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target); // snap to exact final value
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, target, resetKey]); // ← FIX: resetKey added

  return ready && target > 0 ? `${value.toFixed(1)}%` : ready ? "0.0%" : "—";
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiData {
  label: string;
  value: number | string;   // string supports "77.2%" for attendance card
  subLabel: string;
  progress: number;
  color: string;
  icon?: React.ReactNode;
  filter?: DrillDownFilter;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ORG_LICENSE_ONLY = 27;

const PCT_STATUS_COLOR: Record<string, string> = {
  GOOD: "#1DAA61",
  WARNING: "#FFBF00",
  CRITICAL: "#DA153E",
  "N/A": "#9CA3AF",
};

// ─────────────────────────────────────────────────────────────────────────────
// KpiCard
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  data,
  onClick,
}: {
  data: KpiData;
  onClick?: () => void;
}) {
  const isClickable = !!onClick;

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick?.();
            }
          }
          : undefined
      }
      className={[
        "bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2 select-none",
        "transition-all duration-150",
        isClickable
          ? "cursor-pointer hover:ring-2 hover:ring-offset-1 hover:brightness-95 active:scale-[0.98]"
          : "",
      ].join(" ")}
      style={
        isClickable
          ? ({ "--tw-ring-color": data.color } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary leading-tight">
          {data.label}
        </p>
        {data.icon && (
          <div
            className="bg-background w-[32px] h-[32px] shrink-0 flex items-center justify-center rounded-[8px]"
            style={{
              color: data.color,
              boxShadow: `0 0 16px 6px ${data.color}22`,
            }}
          >
            {data.icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-medium text-text-primary leading-none">
        {data.value}
      </p>

      <p className="text-xs text-text-secondary">{data.subLabel}</p>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${data.progress}%`, backgroundColor: data.color }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KpiGrid
// ─────────────────────────────────────────────────────────────────────────────

interface KpiGridProps {
  date: string;
}

export default function KpiGrid({ date }: KpiGridProps) {
  // ── Store selectors ─────────────────────────────────────────────────────────
  const insightsDailySummaryCache = useUserInsightsStore(
    (s) => s.insightsDailySummaryCache
  );

  const { organizationId } = useUserInsightsOrganization();
  const isLicenseOrg = organizationId === ORG_LICENSE_ONLY;

  // ── Daily summary ──────────────────────────────────────────────────────────
  const hasSummary = date in insightsDailySummaryCache;
  const summary = insightsDailySummaryCache[date];

  // ── Attendance % data ──────────────────────────────────────────────────────
  // FIX: select the whole cache object (stable reference) then index outside
  // the selector — avoids a stale closure where Zustand doesn't detect the
  // key change and the component never re-renders with fresh data.
  const attendancePctCache = useUserInsightsStore((s) => s.attendancePctCache);
  const pctCacheKey = `${organizationId}_${date}`;
  const pctData = attendancePctCache[pctCacheKey];

  const adjustedPct = pctData?.adjustedPct ?? 0;
  const pctStatus = pctData?.status ?? "N/A";
  const attendColor = PCT_STATUS_COLOR[pctStatus] ?? "#9CA3AF";
  const hasPctData = !!pctData && !isLicenseOrg;

  // ── Animated attendance % label ───────────────────────────────────────────
  // FIX: pass pctCacheKey as resetKey so the animation always restarts on
  // org or date change, even when the numeric value is the same as before.
  const animatedPctLabel = useCountUpPct(adjustedPct, hasPctData, pctCacheKey);

  // ── Count-up animation for numeric cards ──────────────────────────────────
  const animated = useCountUp(
    {
      checkIns: summary?.checkIns ?? 0,
      checkOuts: summary?.checkOuts ?? 0,
      withLicense: summary?.withLicense ?? 0,
      absentCount: summary?.absentCount ?? 0,
      onLeave: summary?.onLeave ?? 0,
      noAppLogin: summary?.noAppLogin ?? 0,
      totalStaff: summary?.totalStaff ?? 0,
      missedIn: summary?.missedIn ?? 0,
      missedOut: summary?.missedOut ?? 0,
    },
    hasSummary
  );

  const total = animated.totalStaff;

  // ── 5th card: NO APP LOGIN (org 27) OR INCOMPLETE DUTY (all others) ──────
  const fifthCard: KpiData = isLicenseOrg
    ? {
      label: "NO APP LOGIN",
      value: animated.noAppLogin,
      subLabel: "inactive today",
      progress: total > 0 ? Math.round((animated.noAppLogin / total) * 100) : 0,
      color: "#7D3FFF",
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      filter: "noAppLoginList",
    }
    : {
      label: "INCOMPLETE DUTY",
      value: animated.missedOut,
      subLabel: "missed checkout",
      progress: total > 0 ? Math.round((animated.missedOut / total) * 100) : 0,
      color: "#E67E22",
      icon: <AlertTriangle className="w-6 h-6" />,
      filter: "missedOutList",
    };

  // ── 6th card: License (org 27) OR Attendance % (all others) ───────────────
  const sixthCard: KpiData = isLicenseOrg
    ? {
      label: "License Enabled",
      value: animated.withLicense,
      subLabel: "licensed users",
      progress: total > 0 ? Math.round((animated.withLicense / total) * 100) : 0,
      color: "#1DAA61",
      icon: <UserPlusIcon color="#1DAA61" className="w-6 h-6" />,
      filter: "licensedList",
    }
    : {
      label: "ATTENDANCE",
      value: animatedPctLabel,
      subLabel: hasPctData && pctData!.presentCount != null && pctData!.eligibleEmployees != null
        ? `${pctData!.presentCount} of ${pctData!.eligibleEmployees} eligible`
        : "eligible",
      progress: adjustedPct,
      color: attendColor,
      icon: <ChartBarIcon className="w-6 h-6" style={{ color: attendColor }} />,
      filter: "attendancePct",
    };

  // ── All 6 cards ────────────────────────────────────────────────────────────
  const kpiData: KpiData[] = [
    {
      label: "CHECK-INS",
      value: animated.checkIns,
      subLabel: `of ${total} employees`,
      progress: total > 0 ? Math.round((animated.checkIns / total) * 100) : 0,
      color: "#0078D4",
      icon: <PunchInIcon color="#0078D4" className="w-6 h-6" />,
      filter: "checkInList",
    },
    {
      label: "CHECK-OUTS",
      value: animated.checkOuts,
      subLabel: "completed today",
      progress: total > 0 ? Math.round((animated.checkOuts / total) * 100) : 0,
      color: "#FF6B2D",
      icon: <PunchOutIcon color="#FF6B2D" className="w-6 h-6" />,
      filter: "checkOutList",
    },
    {
      label: "ABSENT",
      value: animated.absentCount,
      subLabel: "not at work today",
      progress: total > 0 ? Math.round((animated.absentCount / total) * 100) : 0,
      color: "#DA153E",
      icon: <UserMinusIcon color="#DA153E" className="w-6 h-6" />,
      filter: "absentList",
    },
    {
      label: "ON LEAVE",
      value: animated.onLeave,
      subLabel: "approved absences",
      progress: total > 0 ? Math.round((animated.onLeave / total) * 100) : 0,
      color: "#FFBF00",
      icon: <AbsentIcon color="#FFBF00" className="w-6 h-6" />,
      filter: "leaveList",
    },
    fifthCard,
    sixthCard,
  ];

  // ── Drill-down modal state ─────────────────────────────────────────────────
  const [modal, setModal] = React.useState<{
    open: boolean;
    filter: DrillDownFilter;
    title: string;
    color: string;
    count: number;
  } | null>(null);

  function openDrillDown(kpi: KpiData) {
    if (!kpi.filter) return;
    setModal({
      open: true,
      filter: kpi.filter,
      title: kpi.label,
      color: kpi.color,
      count:
        kpi.filter === "attendancePct"
          ? 0
          : typeof kpi.value === "number"
            ? kpi.value
            : 0,
    });
  }

  function closeDrillDown() {
    setModal((prev) => (prev ? { ...prev, open: false } : null));
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.label}
            data={kpi}
            onClick={kpi.filter ? () => openDrillDown(kpi) : undefined}
          />
        ))}
      </div>

      {modal && organizationId && (
        <DrillDownModal
          open={modal.open}
          onOpenChange={(open) => (open ? undefined : closeDrillDown())}
          orgId={organizationId}
          date={date}
          filter={modal.filter}
          title={modal.title}
          color={modal.color}
          count={modal.count}
        />
      )}
    </>
  );
}