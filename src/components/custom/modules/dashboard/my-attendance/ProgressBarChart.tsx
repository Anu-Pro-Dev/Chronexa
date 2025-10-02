"use client";

import * as React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";

type ProgressBarChartProps = {
  totalHours: number;
  workedHours: number;
  overtimeHours: number;
  pendingHours: number;
};

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  totalHours,
  workedHours,
  overtimeHours,
  pendingHours,
}) => {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  // Compute barCount dynamically based on current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const barCount = new Date(year, month + 1, 0).getDate(); // days in month

  // Prevent NaN by defaulting to 0 if totalHours is 0
  const workedBars = totalHours ? Math.round((workedHours / totalHours) * barCount) : 0;
  const overtimeBars = totalHours ? Math.round((overtimeHours / totalHours) * barCount) : 0;
  const pendingBars = totalHours ? Math.round((pendingHours / totalHours) * barCount) : 0;

  const colors = { worked: "#0078D4", overtime: "#80BBE9", pending: "#D9EBF9" };

  const bars = Array.from({ length: barCount }, (_, i) => {
    if (i < workedBars) return colors.worked;
    if (i < workedBars + overtimeBars) return colors.overtime;
    if (i < workedBars + overtimeBars + pendingBars) return colors.pending;
    return "#EBEBEB";
  });

  // Flip bars order if RTL
  const barsToRender = dir === "rtl" ? [...bars].reverse() : bars;

  return (
    <div>
      <div className="flex items-center mt-5 mb-2 font-bold text-3xl">
        {totalHours.toFixed(2)}
        <span className="pl-2 font-medium text-sm text-text-secondary">
          {t?.exp_work_hrs || "Expected working hours"}
        </span>
      </div>

      <div className={`flex justify-between ${dir === "rtl" ? "flex-row-reverse" : ""}`}>
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
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderRightColor: dir === "rtl" ? "#0078D4" : "transparent",
            }}
          >
            {workedHours.toFixed(2)}
          </p>
        </div>

        <div className="font-semibold text-xs text-text-secondary">
          {t?.overtime || "Overtime"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#80BBE9] mt-1"
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderRightColor: dir === "rtl" ? "#80BBE9" : "transparent",
            }}
          >
            {overtimeHours.toFixed(2)}
          </p>
        </div>

        <div className="font-semibold text-xs text-text-secondary">
          {t?.pending || "Pending"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 border-[#D9EBF9] mt-1"
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderRightColor: dir === "rtl" ? "#D9EBF9" : "transparent",
            }}
          >
            {pendingHours.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarChart;
