"use client";
import React from "react";
import { useUserInsightsStore } from "@/src/store/useUserInsightsStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#378ADD", "#D85A30", "#7F77DD", "#888780"];

export default function AttendanceSplitCard() {
  const data   = useUserInsightsStore((s) => s.data);
  const split  = data?.attendanceSplit;
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const segments = [
    { name: t?.check_in       || "Checked in",   value: split?.checkedIn  ?? 0 },
    { name: t?.missed_in      || "Missed in",    value: split?.missedIn   ?? 0 },
    { name: t?.approved_leaves || "On leave",    value: split?.onLeave    ?? 0 },
    { name: "No login",                           value: split?.noLogin ?? 0 },
  ];

  const total = split?.total || segments.reduce((s, r) => s + r.value, 0) || 1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-accent border border-border-accent rounded-lg p-2 text-xs shadow-md">
        <p className="font-semibold text-text-primary">{payload[0].name}</p>
        <p className="text-text-secondary">{payload[0].value}</p>
      </div>
    );
  };

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 h-full flex flex-col">
      <h5 className="text-base font-bold text-text-primary mb-4">
        Today's attendance split
      </h5>
      <div className="flex items-center gap-4 flex-1">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={segments} cx="50%" cy="50%" innerRadius={38} outerRadius={55}
              paddingAngle={2} dataKey="value">
              {segments.map((_, i) => <Cell key={i} fill={COLORS[i]} strokeWidth={0} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 flex flex-col gap-2">
          {segments.map((s, i) => (
            <div key={s.name} className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                {s.name}
              </span>
              <span className="font-semibold text-text-primary">{s.value}</span>
            </div>
          ))}
          <div className="mt-1 pt-2 border-t border-border-accent flex justify-between text-sm">
            <span className="font-semibold text-text-primary">{t?.total_workforce || "Total staff"}</span>
            <span className="font-bold text-text-primary">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
