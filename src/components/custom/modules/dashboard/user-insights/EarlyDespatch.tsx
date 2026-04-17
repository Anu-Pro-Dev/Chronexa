"use client";

import * as React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";

interface EarlyDespatchProps {
  date: string;
}

function severityStyle(severity: "HIGH" | "MEDIUM" | "LOW" | "MINIMAL") {
  if (severity === "HIGH") return { bg: "bg-[#FDECEA]", text: "text-[#E63946]" };
  if (severity === "MEDIUM") return { bg: "bg-[#FEF3E2]", text: "text-[#E6A817]" };
  return { bg: "bg-[#F3F3F3]", text: "text-text-secondary" };
}

export default function EarlyDespatch({ date }: EarlyDespatchProps) {
  const earlyDespatchError = useUserInsightsStore((s) => s.earlyDespatchError);
  const insightsEarlyDespatchCache = useUserInsightsStore((s) => s.insightsEarlyDespatchCache);
  const hasEarlyDespatchData = date in insightsEarlyDespatchCache;

  const despatchData = insightsEarlyDespatchCache[date];
  const summary = despatchData?.summary;
  const employees = despatchData?.topEarlyDepartures ?? [];


  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h5 className="text-lg text-text-primary font-bold pb-2">Early Departures</h5>
        {/* {despatchData && (
          <span className="text-[11px] text-text-secondary bg-background border border-border rounded-full px-2 py-0.5">
            ≥{despatchData.thresholdMinutes}min threshold
          </span>
        )} */}
      </div>

      {earlyDespatchError && (
        <div className="rounded-lg p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 text-xs text-red-700">
          Failed to load early despatch data
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2 pb-3 border-b border-border">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#E63946]">
            {summary?.earlyDepartureCount ?? 0}
          </span>
          <span className="text-xs text-text-secondary text-center">Early today</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-text-primary">
            {summary?.avgEarlyMinutes ?? 0}m
          </span>
          <span className="text-xs text-text-secondary text-center">Avg early</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-[#1D9E75]">
            {summary?.onTimePct ?? 0}%
          </span>
          <span className="text-xs text-text-secondary text-center">On time</span>
        </div>
      </div>

      {/* Top early departures list */}
      <div className="flex flex-col gap-2.5">
        {employees.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">No early departures recorded</p>
        ) : (
          employees.slice(0, 3).map((emp, idx) => {
            const style = severityStyle(emp.severity);
            return (
              <div key={`${emp.name}-${idx}`} className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full shrink-0 mt-1.5 bg-[#E63946]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-text-primary truncate">{emp.name}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.bg} ${style.text}`}>
                      {emp.earlyLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
                    <span>Left {emp.departureTime}</span>
                    <span>·</span>
                    <span className="truncate">{emp.department}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
