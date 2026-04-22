// "use client";

// import * as React from "react";
// import { PunchInIcon, PunchOutIcon, AbsentIcon } from "@/src/icons/icons";
// import { DevicePhoneMobileIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/solid";
// import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

// export interface KpiData {
//   label: string;
//   value: number;
//   subLabel: string;
//   progress: number;
//   color: string;
//   icon?: React.ReactNode;
// }

// // Animates a record of numeric values from 0 → target over 800ms
// // using requestAnimationFrame, identical to the my-attendance pattern.
// function useCountUp(target: Record<string, number>, ready: boolean) {
//   const [values, setValues] = React.useState<Record<string, number>>(() =>
//     Object.fromEntries(Object.keys(target).map((k) => [k, 0]))
//   );
//   const rafRef = React.useRef<number | null>(null);

//   React.useEffect(() => {
//     if (!ready) return;

//     const startTime = Date.now();
//     const duration = 800;
//     const snapshot = { ...target };

//     const tick = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);

//       setValues(
//         Object.fromEntries(
//           Object.entries(snapshot).map(([k, v]) => [k, Math.floor(v * progress)])
//         )
//       );

//       if (progress < 1) {
//         rafRef.current = requestAnimationFrame(tick);
//       }
//     };

//     rafRef.current = requestAnimationFrame(tick);
//     return () => {
//       if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
//     };
//   }, [ready, JSON.stringify(target)]);

//   return values;
// }

// function KpiCard({ data }: { data: KpiData }) {
//   return (
//     <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-2">
//       <div className="flex items-start justify-between gap-2">
//         <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary leading-tight">
//           {data.label}
//         </p>
//         {data.icon && (
//           <div
//             className="bg-background w-[32px] h-[32px] shrink-0 flex items-center justify-center rounded-[8px]"
//             style={{ color: data.color, boxShadow: `0 0 16px 6px ${data.color}22` }}
//           >
//             {data.icon}
//           </div>
//         )}
//       </div>
//       <p className="text-2xl font-medium text-text-primary leading-none">{data.value}</p>
//       <p className="text-xs text-text-secondary">{data.subLabel}</p>
//       <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
//         <div
//           className="h-full rounded-full transition-all duration-700"
//           style={{ width: `${data.progress}%`, backgroundColor: data.color }}
//         />
//       </div>
//     </div>
//   );
// }

// interface KpiGridProps {
//   date: string;
// }

// export default function KpiGrid({ date }: KpiGridProps) {
//   const insightsDailySummaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);

//   const hasSummary = date in insightsDailySummaryCache;
//   const summary = insightsDailySummaryCache[date];
//   const totalStaff = summary?.totalStaff ?? 0;

//   const animated = useCountUp(
//     {
//       checkIns: summary?.checkIns ?? 0,
//       checkOuts: summary?.checkOuts ?? 0,
//       withLicense: summary?.withLicense ?? 0,
//       absentCount: summary?.absentCount ?? 0,
//       onLeave: summary?.onLeave ?? 0,
//       noAppLogin: summary?.noAppLogin ?? 0,
//       totalStaff: summary?.totalStaff ?? 0,
//     },
//     hasSummary
//   );

//   const total = animated.totalStaff;

//   const kpiData: KpiData[] = [
//     {
//       label: "CHECK-INS",
//       value: animated.checkIns,
//       subLabel: `of ${total} employees`,
//       progress: total > 0 ? Math.round((animated.checkIns / total) * 100) : 0,
//       color: "#0078D4",
//       icon: <PunchInIcon color="#0078D4" className="w-6 h-6" />,
//     },
//     {
//       label: "CHECK-OUTS",
//       value: animated.checkOuts,
//       subLabel: "completed today",
//       progress: total > 0 ? Math.round((animated.checkOuts / total) * 100) : 0,
//       color: "#FF6B2D",
//       icon: <PunchOutIcon color="#FF6B2D" className="w-6 h-6" />,
//     },
//     {
//       label: "ABSENT",
//       value: animated.absentCount,
//       subLabel: "not at work today",
//       progress: total > 0 ? Math.round((animated.absentCount / total) * 100) : 0,
//       color: "#DA153E",
//       icon: <UserMinusIcon color="#DA153E" className="w-6 h-6" />,
//     },
//     {
//       label: "ON LEAVE",
//       value: animated.onLeave,
//       subLabel: "approved absences",
//       progress: total > 0 ? Math.round((animated.onLeave / total) * 100) : 0,
//       color: "#FFBF00",
//       icon: <AbsentIcon color="#FFBF00" className="w-6 h-6" />,
//     },
//     {
//       label: "License Enabled",
//       value: animated.withLicense,
//       subLabel: "licensed users",
//       progress: total > 0 ? Math.round((animated.withLicense / total) * 100) : 0,
//       color: "#1DAA61",
//       icon: <UserPlusIcon color="#1DAA61" className="w-6 h-6" />,
//     },
//     {
//       label: "NO APP LOGIN",
//       value: animated.noAppLogin,
//       subLabel: "inactive today",
//       progress: total > 0 ? Math.round((animated.noAppLogin / total) * 100) : 0,
//       color: "#7D3FFF",
//       icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
//     },
//   ];

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
//       {kpiData.map((kpi) => (
//         <KpiCard key={kpi.label} data={kpi} />
//       ))}
//     </div>
//   );
// }
"use client";

import * as React from "react";
import { PunchInIcon, PunchOutIcon, AbsentIcon } from "@/src/icons/icons";
import { DevicePhoneMobileIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/solid";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

export interface KpiData {
  label: string;
  value: number;
  subLabel: string;
  progress: number;
  color: string;
  icon?: React.ReactNode;
}

// Animates a record of numeric values from 0 → target over 800ms
// using requestAnimationFrame. Re-animates from 0 whenever the target changes.
function useCountUp(target: Record<string, number>, ready: boolean) {
  const keys = Object.keys(target);
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0]))
  );
  const rafRef = React.useRef<number | null>(null);
  // Stable serialised key so the effect re-runs only when values actually change.
  const targetStr = JSON.stringify(target);

  React.useEffect(() => {
    // Always reset to 0 first so stale numbers don't linger between org/date changes.
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

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, targetStr]);

  return values;
}

function KpiCard({ data }: { data: KpiData }) {
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
      <p className="text-2xl font-medium text-text-primary leading-none">{data.value}</p>
      <p className="text-xs text-text-secondary">{data.subLabel}</p>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${data.progress}%`, backgroundColor: data.color }}
        />
      </div>
    </div>
  );
}

interface KpiGridProps {
  date: string;
}

export default function KpiGrid({ date }: KpiGridProps) {
  const insightsDailySummaryCache = useUserInsightsStore((s) => s.insightsDailySummaryCache);

  const hasSummary = date in insightsDailySummaryCache;
  const summary = insightsDailySummaryCache[date];
  const totalStaff = summary?.totalStaff ?? 0;

  const animated = useCountUp(
    {
      checkIns: summary?.checkIns ?? 0,
      checkOuts: summary?.checkOuts ?? 0,
      withLicense: summary?.withLicense ?? 0,
      absentCount: summary?.absentCount ?? 0,
      onLeave: summary?.onLeave ?? 0,
      noAppLogin: summary?.noAppLogin ?? 0,
      totalStaff: summary?.totalStaff ?? 0,
    },
    hasSummary
  );

  const total = animated.totalStaff;

  const kpiData: KpiData[] = [
    {
      label: "CHECK-INS",
      value: animated.checkIns,
      subLabel: `of ${total} employees`,
      progress: total > 0 ? Math.round((animated.checkIns / total) * 100) : 0,
      color: "#0078D4",
      icon: <PunchInIcon color="#0078D4" className="w-6 h-6" />,
    },
    {
      label: "CHECK-OUTS",
      value: animated.checkOuts,
      subLabel: "completed today",
      progress: total > 0 ? Math.round((animated.checkOuts / total) * 100) : 0,
      color: "#FF6B2D",
      icon: <PunchOutIcon color="#FF6B2D" className="w-6 h-6" />,
    },
    {
      label: "ABSENT",
      value: animated.absentCount,
      subLabel: "not at work today",
      progress: total > 0 ? Math.round((animated.absentCount / total) * 100) : 0,
      color: "#DA153E",
      icon: <UserMinusIcon color="#DA153E" className="w-6 h-6" />,
    },
    {
      label: "ON LEAVE",
      value: animated.onLeave,
      subLabel: "approved absences",
      progress: total > 0 ? Math.round((animated.onLeave / total) * 100) : 0,
      color: "#FFBF00",
      icon: <AbsentIcon color="#FFBF00" className="w-6 h-6" />,
    },
    {
      label: "License Enabled",
      value: animated.withLicense,
      subLabel: "licensed users",
      progress: total > 0 ? Math.round((animated.withLicense / total) * 100) : 0,
      color: "#1DAA61",
      icon: <UserPlusIcon color="#1DAA61" className="w-6 h-6" />,
    },
    {
      label: "NO APP LOGIN",
      value: animated.noAppLogin,
      subLabel: "inactive today",
      progress: total > 0 ? Math.round((animated.noAppLogin / total) * 100) : 0,
      color: "#7D3FFF",
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  );
}