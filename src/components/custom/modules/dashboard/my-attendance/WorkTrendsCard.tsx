"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import type { ChartConfig } from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";

const chartConfig = {
  worked: { label: "Worked", color: "#0078D4" },
  missed: { label: "Missed", color: "#C7E7FF" },
} satisfies ChartConfig;

const formatHoursToHM = (decimalHours: number) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

function WorkTrendsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const workHourTrendsCache = useDashboardStore((state) => state.workHourTrendsCache);
  const loadingWorkHourTrends = useDashboardStore((state) => state.loadingWorkHourTrends);
  const fetchWorkHourTrendsForMonth = useDashboardStore((state) => state.fetchWorkHourTrendsForMonth);

  useEffect(() => {
    fetchWorkHourTrendsForMonth(selectedMonth);
  }, [selectedMonth, fetchWorkHourTrendsForMonth]);

  const workHourTrends = workHourTrendsCache[selectedMonth] || [];

  const monthKeys = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const months = monthKeys.map(
    (key, i) => translations?.[key] || new Date(0, i).toLocaleString("en", { month: "long" })
  );

  const chartDataToRender = useMemo(() => {
    const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();

    if (!workHourTrends?.length) {
      return Array.from({ length: daysInMonth }, (_, i) => ({
        date: (i + 1).toString(),
        worked: 0,
        missed: 0,
      }));
    }

    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const dayData = workHourTrends.find(item => item.DayofDate === dayNumber);

      if (!dayData) {
        return { date: dayNumber.toString(), worked: 0, missed: 0 };
      }

      if (dayData.restday === 1 || dayData.holiday === 1) {
        return { date: dayNumber.toString(), worked: 0, missed: 0 };
      }

      const expectedMinutes = (dayData.ExpectedWork === null || dayData.ExpectedWork === 0)
        ? 540
        : dayData.ExpectedWork;

      const expectedHours = expectedMinutes / 60;
      const workedHours = (dayData.WorkMinutes || 0) / 60;

      let worked, missed;

      if (workedHours > expectedHours) {
        worked = Number(workedHours.toFixed(2));
        missed = 0;
      } else {
        worked = Number(workedHours.toFixed(2));
        missed = Number((expectedHours - workedHours).toFixed(2));
      }

      return { date: dayNumber.toString(), worked, missed };
    });
  }, [workHourTrends, selectedMonth, currentYear]);

  const chartDataFinal = dir === "rtl" ? [...chartDataToRender].reverse() : chartDataToRender;

  const maxValue = Math.max(...chartDataToRender.map(d => d.worked + d.missed), 9);

  const yAxisMax = Math.max(Math.ceil(maxValue / 3) * 3, 9);

  const ticks = [];
  for (let i = 0; i <= yAxisMax; i += 3) {
    ticks.push(i);
  }

  const workTrendsExportColumns: ExportColumn[] = [
    { header: "Date", key: "date", width: 10 },
    { header: "Worked (hrs)", key: "worked", width: 14 },
    { header: "Missed (hrs)", key: "missed", width: 14 },
  ];

  const workTrendsExportData = chartDataToRender.map((d) => ({
    date: d.date,
    worked: d.worked,
    missed: d.missed,
  }));

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="text-lg text-text-primary font-bold">
            {t?.work_hrs_trends}
          </h5>
          <ExportButton
            data={workTrendsExportData}
            columns={workTrendsExportColumns}
            meta={{
              title: "Work Hour Trends",
              filters: { Month: months[selectedMonth - 1] },
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(chartConfig).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1 text-xs text-text-secondary">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              {cfg.label}
            </span>
          ))}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
              <Calendar1Icon width="14" height="16" />
              <SelectValue>
                {selectedMonth === currentMonth
                  ? translations?.this_month || "هذا الشهر"
                  : months[selectedMonth - 1]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-accent rounded-md shadow-dropdown">
              {months.map((month, index) => {
                const monthValue = index + 1;
                return (
                  <SelectItem
                    key={`month-${index}`}
                    value={monthValue.toString()}
                    className="text-text-primary bg-accent"
                  >
                    {monthValue === currentMonth
                      ? translations?.this_month || "هذا الشهر"
                      : month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingWorkHourTrends ? (
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-text-secondary">{translations?.buttons?.loading || "جارٍ التحميل"}</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart data={chartDataFinal} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="workedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="65%" stopColor="#0078D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="missedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="65%" stopColor="#C7E7FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C7E7FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, yAxisMax]} ticks={ticks} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="worked" stackId="1" stroke="#0078D4" strokeWidth={2} fill="url(#workedGrad)" dot={false} isAnimationActive={true} animationDuration={800} />
            <Area type="monotone" dataKey="missed" stackId="1" stroke="#C7E7FF" strokeWidth={2} fill="url(#missedGrad)" dot={false} isAnimationActive={true} animationDuration={800} />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default WorkTrendsCard;
