"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface Alert {
  id: number;
  type: "danger" | "warning" | "info" | "neutral";
  text: string;
  subtext: string;
}

const typeStyles = {
  danger: {
    card: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    icon: "bg-red-100 dark:bg-red-800/30",
    dot: "bg-red-500",
    title: "text-red-800 dark:text-red-200",
    sub: "text-red-700 dark:text-red-300",
  },
  warning: {
    card: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    icon: "bg-orange-100 dark:bg-orange-800/30",
    dot: "bg-orange-500",
    title: "text-orange-800 dark:text-orange-200",
    sub: "text-orange-700 dark:text-orange-300",
  },
  info: {
    card: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    icon: "bg-blue-100 dark:bg-blue-800/30",
    dot: "bg-blue-500",
    title: "text-blue-800 dark:text-blue-200",
    sub: "text-blue-700 dark:text-blue-300",
  },
  neutral: {
    card: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
    icon: "bg-gray-100 dark:bg-gray-800/30",
    dot: "bg-gray-500",
    title: "text-gray-800 dark:text-gray-200",
    sub: "text-gray-700 dark:text-gray-300",
  },
};

export default function AlertsCard() {
  const loadingUserInsights = useUserInsightsStore((s) => s.loadingUserInsights);
  const insightsAlertsCache = useUserInsightsStore((s) => s.insightsAlertsCache);

  const alerts: Alert[] = insightsAlertsCache ?? [];

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-2 flex flex-col">
      <div className="p-4 flex flex-col gap-3">
        <p className="text-lg font-bold text-text-primary">Active Alerts</p>
        {loadingUserInsights && insightsAlertsCache === null ? (
          <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-border rounded-[10px]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => {
              const style = typeStyles[alert.type] ?? typeStyles.neutral;
              return (
                <div
                  key={alert.id}
                  className={`rounded-[10px] p-4 shadow-card border flex gap-3 items-start ${style.card}`}
                >
                  <div className={`${style.icon} p-2 rounded-lg shrink-0`}>
                    <span className={`block h-3 w-3 rounded-full ${style.dot}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${style.title}`}>{alert.text}</p>
                    <p className={`text-xs leading-tight mt-0.5 ${style.sub}`}>{alert.subtext}</p>
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
