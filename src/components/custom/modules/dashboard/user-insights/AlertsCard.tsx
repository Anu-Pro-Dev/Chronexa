"use client";
import React, { useMemo } from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";

type AlertLevel = "danger" | "warning" | "info" | "neutral";

interface UIAlert {
  level: AlertLevel;
  title: string;
  sub: string;
}

const LEVEL_STYLES: Record<AlertLevel, { dot: string; border: string; bg: string }> = {
  danger:  { dot: "#E24B4A", border: "border-[#FECACA]", bg: "bg-[#FEF2F2] dark:bg-transparent" },
  warning: { dot: "#EF9F27", border: "border-[#FDE68A]", bg: "bg-[#FFFBEB] dark:bg-transparent" },
  info:    { dot: "#0078D4", border: "border-[#BFDBFE]", bg: "bg-[#EFF6FF] dark:bg-transparent" },
  neutral: { dot: "#888780", border: "border-border-accent", bg: "bg-background" },
};

export default function AlertsCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  // ✅ Fixed: was using nonexistent useSparkAnalyticsStore
  const data = useUserInsightsStore((s) => s.data);

  const alerts: UIAlert[] = useMemo(() => {
    const list: UIAlert[] = [];

    const sparkToday  = data?.today  ?? { missedIn: 0, missedOut: 0, onLeave: 0 };
    const sparkTotals = data?.totals ?? { noAppLogin: 0 };

    const missedIn  = sparkToday?.missedIn  ?? 0;
    const missedOut = sparkToday?.missedOut ?? 0;
    const onLeave   = sparkToday?.onLeave   ?? 0;
    const noLogin   = sparkTotals?.noAppLogin ?? 0;

    if (missedIn  > 0) list.push({ level: "danger",  title: `${missedIn} ${t?.missed_check_in   || "staff with no check-in"}`,     sub: "Shift started hours ago" });
    if (missedOut > 0) list.push({ level: "warning", title: `${missedOut} ${t?.missed_check_out || "employees missing check-out"}`, sub: "From previous shift" });
    if (noLogin   > 0) list.push({ level: "warning", title: `${noLogin} staff haven't opened the app`,                             sub: "Send push reminder?" });
    if (onLeave   > 0) list.push({ level: "info",    title: `${onLeave} ${t?.approved_leaves    || "employees on approved leave"}`, sub: "Approved" });
    if (list.length === 0) list.push({ level: "neutral", title: t?.shift_complete || "All clear – no critical alerts", sub: t?.successfully || "Attendance looks good today" });

    return list;
  }, [data?.today, data?.totals, t]);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <h5 className="text-base font-bold text-text-primary mb-4">
        {t?.important || "Alerts"} &amp; Actions
      </h5>
      <div className="flex flex-col gap-2">
        {alerts.map((a, i) => {
          const s = LEVEL_STYLES[a.level as AlertLevel] ?? LEVEL_STYLES.neutral;
          return (
            <div key={i} className={`flex gap-2 items-start p-3 rounded-lg border ${s.border} ${s.bg}`}>
              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: s.dot }} />
              <div>
                <p className="text-sm text-text-primary leading-snug">{a.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{a.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
