"use client";
import * as React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  EmployeesIcon, PunchInIcon, PunchOutIcon, AbsentIcon,
  LeaveTakenIcon, ViolationIcon, ManagerIcon, ClockIcon,
} from "@/src/icons/icons";
import { MissedInIcon, MissedOutIcon } from "@/src/icons/icons";
import { useTeamAttendanceData } from "./TeamAttendanceDataProvider";

const formatValue = (v: any): number =>
  v === null || v === undefined ? 0 : typeof v === "string" ? Number(v) || 0 : Number(v);

const parseHours = (timeString: string): number => {
  if (!timeString || timeString === "00:00") return 0;
  const [h, m] = timeString.split(":").map(Number);
  return h + m / 60;
};

function useCountUp(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0]))
  );
  const rafRef = React.useRef<number | null>(null);
  const targetStr = JSON.stringify(target);

  React.useEffect(() => {
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
  }, [ready, targetStr]);

  return values;
}

function KpiCard({
  label,
  value,
  subLabel,
  progress,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  subLabel: string;
  progress: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2 select-none transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:brightness-95 hover:scale-[1.02] hover:shadow-popup active:scale-[0.98]"
      style={{ "--tw-ring-color": color } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider leading-tight"
          style={{ color }}
        >
          {label}
        </p>
        {icon && (
          <div
            className="bg-background w-[32px] h-[32px] shrink-0 flex items-center justify-center rounded-[8px]"
            style={{
              color,
              boxShadow: `0 0 16px 6px ${color}22`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-medium text-text-primary leading-none">
        {value}
      </p>

      <p className="text-xs text-text-secondary">{subLabel}</p>

      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function EmployeeCardData() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { teamAttendanceDetails, loading } = useTeamAttendanceData();

  const hasData = !!teamAttendanceDetails && !loading;
  const d = teamAttendanceDetails || {};

  const workforce = formatValue(d.Workforce);
  const missingHrs = parseHours(d.MissingHours || "00:00");
  const overtimeHrs = parseHours(d.Overtime || "00:00");

  const animated = useCountUp(
    {
      Workforce: workforce,
      ProjectManagers: formatValue(d.ProjectManagers),
      CheckInCount: formatValue(d.CheckInCount),
      CheckOutCount: formatValue(d.CheckOutCount),
      ApprovedLeaves: formatValue(d.ApprovedLeaves),
      AbsentCount: formatValue(d.AbsentCount),
      MissedCheckIn: formatValue(d.MissedCheckIn),
      MissedCheckOut: formatValue(d.MissedCheckOut),
      MissingHours: Math.floor(missingHrs),
      Overtime: Math.floor(overtimeHrs),
    },
    hasData
  );

  const total = animated.Workforce;

  const cards = [
    {
      label: t?.workforce || "WORKFORCE",
      value: animated.Workforce,
      subLabel: "total employees",
      progress: 100,
      color: "#0078D4",
      icon: <EmployeesIcon />,
    },
    {
      label: t?.project_managers || "PROJECT MANAGERS",
      value: animated.ProjectManagers,
      subLabel: "total managers",
      progress: total > 0 ? Math.round((animated.ProjectManagers / total) * 100) : 0,
      color: "#7D3FFF",
      icon: <ManagerIcon color="#7D3FFF" />,
    },
    {
      label: t?.check_in || "CHECK-INS",
      value: animated.CheckInCount,
      subLabel: `of ${total} employees`,
      progress: total > 0 ? Math.round((animated.CheckInCount / total) * 100) : 0,
      color: "#1DAA61",
      icon: <PunchInIcon color="#1DAA61" />,
    },
    {
      label: t?.check_out || "CHECK-OUTS",
      value: animated.CheckOutCount,
      subLabel: "completed today",
      progress: total > 0 ? Math.round((animated.CheckOutCount / total) * 100) : 0,
      color: "#FF6B2D",
      icon: <PunchOutIcon color="#FF6B2D" />,
    },
    {
      label: t?.approved_leaves || "ON LEAVE",
      value: animated.ApprovedLeaves,
      subLabel: "approved absences",
      progress: total > 0 ? Math.round((animated.ApprovedLeaves / total) * 100) : 0,
      color: "#FFBF00",
      icon: <LeaveTakenIcon />,
    },
    {
      label: t?.absent || "ABSENT",
      value: animated.AbsentCount,
      subLabel: "not at work today",
      progress: total > 0 ? Math.round((animated.AbsentCount / total) * 100) : 0,
      color: "#DA153E",
      icon: <AbsentIcon color="#DA153E" />,
    },
    {
      label: t?.missed_check_in || "MISSED CHECK-IN",
      value: animated.MissedCheckIn,
      subLabel: "missed punch in",
      progress: total > 0 ? Math.round((animated.MissedCheckIn / total) * 100) : 0,
      color: "#E6107C",
      icon: MissedInIcon("#E6107C"),
    },
    {
      label: t?.missed_check_out || "MISSED CHECK-OUT",
      value: animated.MissedCheckOut,
      subLabel: "missed punch out",
      progress: total > 0 ? Math.round((animated.MissedCheckOut / total) * 100) : 0,
      color: "#0EA5E9",
      icon: MissedOutIcon("#0EA5E9"),
    },
    {
      label: t?.missing_hours || "MISSING HOURS",
      value: `${animated.MissingHours} hrs`,
      subLabel: "unaccounted hours",
      progress: Math.min(Math.round((missingHrs / 8) * 100), 100),
      color: "#E67E22",
      icon: <ViolationIcon color="#E67E22" />,
    },
    {
      label: t?.overtimee || "OVERTIME",
      value: `${animated.Overtime} hrs`,
      subLabel: "extra hours",
      progress: Math.min(Math.round((overtimeHrs / 8) * 100), 100),
      color: "#10B981",
      icon: <ClockIcon color="#10B981" className="w-4 h-4" />,
    },
  ];

  if (loading && !teamAttendanceDetails) {
    return (
      <div className="animate-pulse space-y-4 p-4 pt-0">
      <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-[10px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-4 pt-0">
      <div className="grid grid-cols-5 gap-3">
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}