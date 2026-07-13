"use client";
import React, { useState, useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { useDashboardStore } from "@/src/store/useDashboardStore";

interface ViolationAnalytic {
  ViolationMnth: number;
  LeaveYear: number;
  LateCnt: number;
  EarlyCnt: number;
  MissedIn: number;
  MissedOut: number;
}

function ViolationsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchTeamViolations = useDashboardStore((s) => s.fetchTeamViolationAnalyticsForYear);
  const teamViolationAnalyticsCache = useDashboardStore((s) => s.teamViolationAnalyticsCache);

  const violationsData: ViolationAnalytic[] = useMemo(() => teamViolationAnalyticsCache[selectedYear] || [], [teamViolationAnalyticsCache, selectedYear]);

  const formatValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === "string" ? parseInt(value) || 0 : Number(value) || 0;
  };

  const monthTranslationsMap: Record<string, string> = {
    January: translations.january || "January",
    February: translations.february || "February",
    March: translations.march || "March",
    April: translations.april || "April",
    May: translations.may || "May",
    June: translations.june || "June",
    July: translations.july || "July",
    August: translations.august || "August",
    September: translations.september || "September",
    October: translations.october || "October",
    November: translations.november || "November",
    December: translations.december || "December",
  };

  const chartData = useMemo(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const monthDataMap = new Map();
    violationsData.forEach((item: ViolationAnalytic) => {
      monthDataMap.set(item.ViolationMnth, {
        missedin: formatValue(item.MissedIn),
        missedout: formatValue(item.MissedOut),
        latein: formatValue(item.LateCnt),
        earlyout: formatValue(item.EarlyCnt),
      });
    });

    return months.map((month, index) => ({
      month,
      missedin: monthDataMap.get(index + 1)?.missedin || 0,
      missedout: monthDataMap.get(index + 1)?.missedout || 0,
      latein: monthDataMap.get(index + 1)?.latein || 0,
      earlyout: monthDataMap.get(index + 1)?.earlyout || 0,
    }));
  }, [violationsData]);

  const chartConfig = {
    missedin: { label: t?.missed_in || "Missed In", color: "#0078D4" },
    missedout: { label: t?.missed_out || "Missed Out", color: "#1E9090" },
    latein: { label: t?.late_in || "Late In", color: "#FF6347" },
    earlyout: { label: t?.early_out || "Early Out", color: "#FFBF00" },
  } satisfies ChartConfig;

  const localizedChartData = dir === "rtl" ? [...chartData].reverse() : chartData;

  const years = useMemo(() => {
    const START_YEAR = 2025;
    const count = Math.max(currentYear - START_YEAR + 1, 1);
    return Array.from({ length: count }, (_, i) => currentYear - i);
  }, [currentYear]);

  const handleYearChange = (year: string) => {
    const newYear = Number(year);
    setSelectedYear(newYear);
    if (!teamViolationAnalyticsCache[newYear]) {
      fetchTeamViolations(newYear);
    }
  };

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.discerpencies || "Discrepancies"}
        </h5>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex justify-center items-center gap-4 text-xs text-text-secondary">
            {Object.entries(chartConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </span>
            ))}
          </div>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
              <Calendar1Icon width="14" height="16" />
              <SelectValue placeholder={translations?.select_year || "Select Year"}>
                {selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-accent rounded-md shadow-dropdown">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  className="text-text-primary bg-accent"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Chart */}
      <ChartContainer
        config={chartConfig}
        dir={dir}
        className={`w-full h-[260px] relative ${dir === "rtl" ? "-right-[25px]" : "-left-[25px]"}`}
      >
        <LineChart
          accessibilityLayer
          data={localizedChartData}
          margin={{ left: 12, right: 12, top: 4, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => {
              if (dir === "rtl") {
                const translated = monthTranslationsMap[value] || value;
                return translated.slice(0, 3);
              }
              return value.slice(0, 3);
            }}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 11 }}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} defaultIndex={1} />
          <Line dataKey="missedin" type="monotone" stroke="var(--color-missedin)" strokeWidth={2} dot={false} />
          <Line dataKey="missedout" type="monotone" stroke="var(--color-missedout)" strokeWidth={2} dot={false} />
          <Line dataKey="latein" type="monotone" stroke="var(--color-latein)" strokeWidth={2} dot={false} />
          <Line dataKey="earlyout" type="monotone" stroke="var(--color-earlyout)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default ViolationsCard;