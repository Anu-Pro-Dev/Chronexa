"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface AlertRow {
  id: string;
  type: "danger" | "warning" | "info" | "neutral" | "success" ;
  label: string;
  value: number | string;
  subtext: string;
}

const typeStyles = {
  danger: {
    card: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: "bg-red-100 dark:bg-red-800/30",
    dot: "bg-red-500",
    title: "text-red-800 dark:text-red-200",
    sub: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300",
  },
  warning: {
    card: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    icon: "bg-orange-100 dark:bg-orange-800/30",
    dot: "bg-orange-500",
    title: "text-orange-800 dark:text-orange-200",
    sub: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300",
  },
  info: {
    card: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    icon: "bg-blue-100 dark:bg-blue-800/30",
    dot: "bg-blue-500",
    title: "text-blue-800 dark:text-blue-200",
    sub: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300",
  },
  neutral: {
    card: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
    icon: "bg-gray-100 dark:bg-gray-800/30",
    dot: "bg-gray-500",
    title: "text-gray-800 dark:text-gray-200",
    sub: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300",
  },
  success: {
    card: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    icon: "bg-green-100 dark:bg-green-800/30",
    dot: "bg-green-500",
    title: "text-green-800 dark:text-green-200",
    sub: "text-green-700 dark:text-green-300",
    badge: "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300",
  },
};

interface AlertsCardProps {
  date: string;
}

export default function AlertsCard({ date }: AlertsCardProps) {
  const loadingAlerts = useUserInsightsStore((s) => s.loadingAlerts);
  const alertsError = useUserInsightsStore((s) => s.alertsError);
  const insightsAlertsCache = useUserInsightsStore((s) => s.insightsAlertsCache);

  const alertsData = insightsAlertsCache[date];

  const alerts: AlertRow[] = alertsData
    ? [
        {
          id: "no_checkin",
          type: alertsData.no_checkin_today > 100 ? "danger" : "warning",
          label: "No Check-in Today",
          value: alertsData.no_checkin_today,
          subtext: "Employees with no check-in recorded today",
        },
        {
          id: "missing_checkout",
          type: alertsData.missing_checkout_yesterday > 500 ? "danger" : "warning",
          label: "Missing Checkout Yesterday",
          value: alertsData.missing_checkout_yesterday,
          subtext: "Employees who forgot to check out yesterday",
        },
        {
          id: "depts_below_60",
          type: alertsData.depts_below_60pct > 0 ? "info" : "neutral",
          label: "Depts Below 60%",
          value: `${alertsData.depts_below_60pct} dept${alertsData.depts_below_60pct !== 1 ? "s" : ""}`,
          subtext: alertsData.lowest_dept_name
            ? `Lowest: ${alertsData.lowest_dept_name} (${alertsData.lowest_dept_pct}%)`
            : "All departments above threshold",
        },
        
        {
          id: "consecutive_absent",
          type: alertsData.consecutive_absent_3plus > 500 ? "danger" : "warning",
          label: "Consecutive Absent 3+",
          value: alertsData.consecutive_absent_3plus.toLocaleString(),
          subtext: "Absent for 3 or more consecutive days",
        },
        {
          id: "overtime",
          type: alertsData.overtime_count > 100 ? "success" : "info",
          label: "Overtime Count",
          value: alertsData.overtime_count,
          subtext: "Employees clocking overtime today",
        },
      ]
    : [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-2 flex flex-col">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-text-primary">Active Alerts</p>
          {/* {alertsData && (
            <span className="text-xs text-text-secondary bg-background border border-border rounded-full px-2 py-0.5">
              {alertsData.targetDate}
            </span>
          )} */}
        </div>

        {alertsError && (
          <div className="rounded-[10px] p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-sm text-red-700">
            Failed to load alerts
          </div>
        )}

        {loadingAlerts && !alertsData ? (
          <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-border rounded-[10px]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const style = typeStyles[alert.type];
              return (
                <div
                  key={alert.id}
                  className={`rounded-[10px] p-3 shadow-card border flex gap-3 items-start ${style.card}`}
                >
                  <div className={`${style.icon} p-2 rounded-lg shrink-0 mt-0.5`}>
                    <span className={`block h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${style.title}`}>{alert.label}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
                        {alert.value}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-tight mt-0.5 ${style.sub}`}>{alert.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
