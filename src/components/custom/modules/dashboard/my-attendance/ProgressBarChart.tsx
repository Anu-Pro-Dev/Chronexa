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
  
  const [animatedValues, setAnimatedValues] = React.useState({
    totalHours: 0,
    workedHours: 0,
    overtimeHours: 0,
    pendingHours: 0,
  });

  React.useEffect(() => {
    if (totalHours === 0 && workedHours === 0 && overtimeHours === 0 && pendingHours === 0) {
      return;
    }

    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimatedValues({
        totalHours: totalHours * progress,
        workedHours: workedHours * progress,
        overtimeHours: overtimeHours * progress,
        pendingHours: pendingHours * progress,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [totalHours, workedHours, overtimeHours, pendingHours]);

  // Helper function for RTL hrs placement
  const formatHours = (value: number) => {
    const formatted = value.toFixed(2);
    if (dir === "rtl") {
      return (
        <>
          <span className="px-1 font-medium text-sm text-text-secondary">hrs</span>
          {formatted}
        </>
      );
    }
    return (
      <>
        {formatted}
        <span className="px-1 font-medium text-sm text-text-secondary">hrs</span>
      </>
    );
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const barCount = new Date(year, month + 1, 0).getDate();

  const workedBars = animatedValues.totalHours ? Math.round((animatedValues.workedHours / animatedValues.totalHours) * barCount) : 0;
  const overtimeBars = animatedValues.totalHours ? Math.round((animatedValues.overtimeHours / animatedValues.totalHours) * barCount) : 0;
  const pendingBars = animatedValues.totalHours ? Math.round((animatedValues.pendingHours / animatedValues.totalHours) * barCount) : 0;

  const colors = { worked: "#0078D4", overtime: "#80BBE9", pending: "#D9EBF9" };

  const bars = Array.from({ length: barCount }, (_, i) => {
    if (i < workedBars) return colors.worked;
    if (i < workedBars + overtimeBars) return colors.overtime;
    if (i < workedBars + overtimeBars + pendingBars) return colors.pending;
    return "#EBEBEB";
  });

  const barsToRender = dir === "rtl" ? [...bars].reverse() : bars;

  return (
    <div>
      <div className="flex items-center mt-5 mb-2 font-bold text-3xl">
        {animatedValues.totalHours.toFixed(2)}
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
            className="font-bold text-xl text-text-primary pl-2 border-l-2 mt-1"
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderLeftColor: "#0078D4",
              borderRightColor: dir === "rtl" ? "#0078D4" : "transparent",
            }}
          >
            {formatHours(animatedValues.workedHours)}
          </p>
        </div>

        <div className="font-semibold text-xs text-text-secondary">
          {t?.overtime || "Overtime"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 mt-1"
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderLeftColor: "#80BBE9",
              borderRightColor: dir === "rtl" ? "#80BBE9" : "transparent",
            }}
          >
            {formatHours(animatedValues.overtimeHours)}
          </p>
        </div>

        <div className="font-semibold text-xs text-text-secondary">
          {t?.pending || "Pending"}
          <p
            className="font-bold text-xl text-text-primary pl-2 border-l-2 mt-1"
            style={{
              paddingLeft: dir === "rtl" ? 0 : "0.5rem",
              paddingRight: dir === "rtl" ? "0.5rem" : 0,
              borderLeftWidth: dir === "rtl" ? 0 : 2,
              borderRightWidth: dir === "rtl" ? 2 : 0,
              borderLeftColor: "#D9EBF9",
              borderRightColor: dir === "rtl" ? "#D9EBF9" : "transparent",
            }}
          >
            {formatHours(animatedValues.pendingHours)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarChart;