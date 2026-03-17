"use client";
import React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";

const badgeStyle = (mins: number) =>
  mins > 30 ? { bg: "#FAECE7", text: "#993C1D" }
  : mins > 10 ? { bg: "#FAEEDA", text: "#854F0B" }
  : { bg: "#F1EFE8", text: "#5F5E5A" };

const dotColor = (mins: number) =>
  mins > 30 ? "#D85A30" : mins > 10 ? "#EF9F27" : "#888780";

export default function LateArrivalsCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  // Use lateArrivals from Spark API
  const data  = useUserInsightsStore((s) => s.data);
  const lateArrivals  = data?.lateArrivals ?? [];

  const totalLate = lateArrivals.length;
  const totalEmployees = data?.totals?.totalEmployees || 1;
  const avgDelay = totalLate > 0 
    ? Math.round(lateArrivals.reduce((sum, emp) => sum + (emp.delayMinutes || 0), 0) / totalLate)
    : 0;
  // On-time % derived from total workforce vs late count
  const onTimePct = Math.max(0, Math.round(((totalEmployees - totalLate) / totalEmployees) * 100));

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <h5 className="text-base font-bold text-text-primary mb-3">
        {t?.late_in || "Late Arrivals"}{" "}
        <span className="text-xs font-normal text-text-secondary">{t?.monthly_absent || "Today"}</span>
      </h5>

      <div className="flex justify-between mb-4">
        {[
          { label: t?.late_in  || "Late",    value: totalLate,          color: "#D85A30" },
          { label: "Avg delay",               value: `${avgDelay} min`,  color: "#EF9F27" },
          { label: t?.progress || "On time",  value: `${onTimePct}%`,  color: "#1D9E75" },
        ].map((s) => (
          <div key={s.label} className="text-center flex-1">
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {lateArrivals.length === 0 && (
          <p className="text-xs text-text-secondary text-center py-4">
            {t?.no_records || "No late arrivals recorded"}
          </p>
        )}
        {lateArrivals.slice(0, 10).map((emp, i) => {
          const delayMins = emp.delayMinutes || 0;
          const badge = badgeStyle(delayMins);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor(delayMins) }} />
              <span className="flex-1 text-text-primary truncate">{emp.name || "Unknown"}</span>
              <span className="text-xs text-text-secondary">{emp.time || "N/A"}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: badge.bg, color: badge.text }}
              >
                +{delayMins} min
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
