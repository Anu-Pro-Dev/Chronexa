"use client";

import * as React from "react";
import { useLanguage } from "@/providers/LanguageProvider";

type ProgressBarChartProps = {
  totalHours: number; 
  workedHours: number; 
  overtimeHours: number; 
  pendingHours: number; 
  barCount?: number; 
  colors?: { worked: string; overtime: string; pending: string }; 
};

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  totalHours,
  workedHours,
  overtimeHours,
  pendingHours,
  barCount = 30,
  colors = { worked: "#0078D4", overtime: "#80BBE9", pending: "#D9EBF9" },
}) => {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const workedBars = Math.round((workedHours / totalHours) * barCount);
  const overtimeBars = Math.round((overtimeHours / totalHours) * barCount);
  const pendingBars = Math.round((pendingHours / totalHours) * barCount);

  const bars = Array.from({ length: barCount }, (_, i) => {
    if (i < workedBars) return colors.worked;
    if (i < workedBars + overtimeBars) return colors.overtime;
    if (i < workedBars + overtimeBars + pendingBars) return colors.pending;
    return "#EBEBEB";
  });

  // Flip bars order if RTL (so bars render right-to-left)
  const barsToRender = dir === "rtl" ? [...bars].reverse() : bars;

  return (
    <div>
      <div className="flex items-center mt-5 mb-2 font-bold text-3xl">
        {totalHours}
        <span className="pl-2 font-medium text-sm text-text-secondary">
          {t?.exp_work_hrs || "Expected working hours"}
        </span>
      </div>
      <div
        className={`flex justify-between ${
          dir === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        {barsToRender.map((barColor, index) => (
          <div
            key={index}
            className="w-[3px] h-[40px] rounded-[3px]"
            style={{ backgroundColor: barColor }}
          />
        ))}
      </div>
      <div className={`flex justify-between mt-3 ${dir === "rtl" ? "flex-row-reverse" : ""}`}>
        <div className="font-semibold text-xs text-text-secondary">
          {t?.worked || "Worked"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#0078D4] mt-1"
            style={{ paddingLeft: dir === "rtl" ? 0 : "0.5rem", paddingRight: dir === "rtl" ? "0.5rem" : 0, borderLeftWidth: dir === "rtl" ? 0 : "2px", borderRightWidth: dir === "rtl" ? "2px" : 0, borderRightColor: dir === "rtl" ? "#0078D4" : "transparent" }}
          >
            {workedHours}
          </p>
        </div>
        <div className="font-semibold text-xs text-text-secondary">
          {t?.overtime || "Overtime"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#80BBE9] mt-1"
            style={{ paddingLeft: dir === "rtl" ? 0 : "0.5rem", paddingRight: dir === "rtl" ? "0.5rem" : 0, borderLeftWidth: dir === "rtl" ? 0 : "2px", borderRightWidth: dir === "rtl" ? "2px" : 0, borderRightColor: dir === "rtl" ? "#80BBE9" : "transparent" }}
          >
            {overtimeHours}
          </p>
        </div>
        <div className="font-semibold text-xs text-text-secondary">
          {t?.pending || "Pending"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#D9EBF9] mt-1"
            style={{ paddingLeft: dir === "rtl" ? 0 : "0.5rem", paddingRight: dir === "rtl" ? "0.5rem" : 0, borderLeftWidth: dir === "rtl" ? 0 : "2px", borderRightWidth: dir === "rtl" ? "2px" : 0, borderRightColor: dir === "rtl" ? "#D9EBF9" : "transparent" }}
          >
            {pendingHours}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarChart;
