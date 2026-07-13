"use client";
import { useState, useMemo, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { ExportButton } from "../export/ExportButton";
import type { ExportColumn } from "../export/DashboardExcelExporter";

interface LeaveAnalytic {
  LeaveYear: number;
  LVMonth: number;
  LeaveCount: number;
  AbsentCount: number;
}

function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = useMemo(() => translations?.modules?.dashboard || {}, [translations]);

  const translationDefaults = useMemo(() => ({
    leave_analytics: t?.leave_analytics || "Leave Analytics",
    select_year: translations?.select_year || "Select year",
    leaves: t?.leaves || "Leaves",
    absent: t?.absent || "Absent",
    january: translations?.january || "January",
    february: translations?.february || "February",
    march: translations?.march || "March",
    april: translations?.april || "April",
    may: translations?.may || "May",
    june: translations?.june || "June",
    july: translations?.july || "July",
    august: translations?.august || "August",
    september: translations?.september || "September",
    october: translations?.october || "October",
    november: translations?.november || "November",
    december: translations?.december || "December",
  }), [t, translations]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  const leaveAnalyticsCache = useDashboardStore((state) => state.leaveAnalyticsCache);
  const loadingLeaveAnalytics = useDashboardStore((state) => state.loadingLeaveAnalytics);
  const fetchLeaveAnalyticsForYear = useDashboardStore((state) => state.fetchLeaveAnalyticsForYear);

  useEffect(() => {
    fetchLeaveAnalyticsForYear(selectedYear);
  }, [selectedYear, fetchLeaveAnalyticsForYear]);

  const leaveAnalytics = useMemo(() => leaveAnalyticsCache[selectedYear] || [], [leaveAnalyticsCache, selectedYear]);

  const monthNames = useMemo(() => [
    translationDefaults.january,
    translationDefaults.february,
    translationDefaults.march,
    translationDefaults.april,
    translationDefaults.may,
    translationDefaults.june,
    translationDefaults.july,
    translationDefaults.august,
    translationDefaults.september,
    translationDefaults.october,
    translationDefaults.november,
    translationDefaults.december,
  ], [translationDefaults]);

  const chartData = useMemo(() => {
    const monthDataMap = new Map();

    leaveAnalytics.forEach((item: LeaveAnalytic) => {
      monthDataMap.set(item.LVMonth, {
        leaves: item.LeaveCount || 0,
        absent: item.AbsentCount || 0,
      });
    });

    const data = monthNames.map((monthName, index) => ({
      month: monthName,
      monthIndex: index + 1,
      leaves: monthDataMap.get(index + 1)?.leaves || 0,
      absent: monthDataMap.get(index + 1)?.absent || 0,
    }));

    return dir === "rtl" ? [...data].reverse() : data;
  }, [dir, leaveAnalytics, monthNames]);

  const summaryStats = useMemo(() => {
    const totalLeaves = chartData.reduce((s, d) => s + d.leaves, 0);
    const totalAbsent = chartData.reduce((s, d) => s + d.absent, 0);
    const monthsWithData = chartData.filter((d) => d.leaves > 0 || d.absent > 0);

    let peakLeaveMonth = "-";
    let peakLeaveVal = 0;
    let peakAbsentMonth = "-";
    let peakAbsentVal = 0;

    monthsWithData.forEach((d) => {
      if (d.leaves > peakLeaveVal) {
        peakLeaveVal = d.leaves;
        peakLeaveMonth = d.month;
      }
      if (d.absent > peakAbsentVal) {
        peakAbsentVal = d.absent;
        peakAbsentMonth = d.month;
      }
    });

    return { totalLeaves, totalAbsent, peakLeaveMonth, peakLeaveVal, peakAbsentMonth, peakAbsentVal };
  }, [chartData]);

  const chartConfig = {
    leaves: {
      label: translationDefaults.leaves,
      color: "hsl(var(--chart-leaves))",
    },
    absent: {
      label: translationDefaults.absent,
      color: "hsl(var(--chart-absent))",
    },
  } satisfies ChartConfig;

  const years = useMemo(() => {
    const START_YEAR = 2025;
    const count = Math.max(currentYear - START_YEAR + 1, 1);
    return Array.from({ length: count }, (_, i) => currentYear - i);
  }, [currentYear]);

  const leaveExportColumns: ExportColumn[] = [
    { header: "Month", key: "month", width: 14 },
    { header: "Leaves", key: "leaves", width: 10 },
    { header: "Absent", key: "absent", width: 10 },
  ];

  const leaveExportData = chartData.map((d) => ({
    month: d.month,
    leaves: d.leaves,
    absent: d.absent,
  }));

  const activeData = activeMonth ? chartData.find((d) => d.monthIndex === activeMonth) : null;

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h5 className="text-lg text-text-primary font-bold">
            {translationDefaults.leave_analytics}
          </h5>
          <ExportButton
            data={leaveExportData}
            columns={leaveExportColumns}
            meta={{
              title: "Leave Analytics",
              filters: { Year: String(selectedYear) },
            }}
          />
        </div>
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
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => { setSelectedYear(Number(value)); setActiveMonth(null); }}
          >
            <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
              <Calendar1Icon width="14" height="16" />
              <SelectValue placeholder={translationDefaults.select_year}>
                {selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-accent rounded-md shadow-dropdown">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year.toString()}
                  className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-primary"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingLeaveAnalytics ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-text-secondary">{translations?.buttons?.loading || "Loading..."}</p>
        </div>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className={`relative w-full h-[260px] ${dir === "rtl" ? "-right-[40px]" : "-left-[30px]"}`}
            dir={dir}
          >
            <BarChart data={chartData} onClick={(e) => {
              if (e?.activeLabel) {
                const idx = monthNames.findIndex((m) => m === e.activeLabel);
                setActiveMonth(idx + 1);
              }
            }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                interval={0}
              />
              <YAxis
                type="number"
                tickLine={false}
                tickMargin={2}
                axisLine={false}
                orientation={dir === "rtl" ? "right" : "left"}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="leaves"
                fill="var(--color-leaves)"
                radius={[3, 3, 0, 0]}
                name={translationDefaults.leaves}
                activeBar={{ fill: "hsl(var(--chart-leaves-hover))" }}
                onClick={(entry: any) => setActiveMonth(entry?.monthIndex || null)}
                style={{ cursor: 'pointer' }}
              />
              <Bar
                dataKey="absent"
                fill="var(--color-absent)"
                radius={[3, 3, 0, 0]}
                name={translationDefaults.absent}
                activeBar={{ fill: "hsl(var(--chart-absent-hover))" }}
                onClick={(entry: any) => setActiveMonth(entry?.monthIndex || null)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ChartContainer>

          {/* Summary row */}
          {/* <div className="grid grid-cols-4 gap-3">
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-lg font-bold" style={{ color: "hsl(var(--chart-leaves))" }}>
                {summaryStats.totalLeaves}
              </p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">
                Total Leaves
              </p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-lg font-bold" style={{ color: "hsl(var(--chart-absent))" }}>
                {summaryStats.totalAbsent}
              </p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">
                Total Absent
              </p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-text-primary truncate" title={summaryStats.peakLeaveMonth}>
                {summaryStats.peakLeaveMonth.slice(0, 3)}
              </p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">
                Peak Leaves ({summaryStats.peakLeaveVal})
              </p>
            </div>
            <div className="bg-background rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-text-primary truncate" title={summaryStats.peakAbsentMonth}>
                {summaryStats.peakAbsentMonth.slice(0, 3)}
              </p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">
                Peak Absent ({summaryStats.peakAbsentVal})
              </p>
            </div>
          </div> */}

          {/* Active month detail */}
          {activeData && (
            <div className="bg-background rounded-lg px-4 py-2 flex items-center gap-4 text-sm">
              <span className="font-semibold text-text-primary">{activeData.month}</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-leaves))" }} />
                <span className="text-text-secondary">Leaves:</span>
                <span className="font-semibold text-text-primary">{activeData.leaves}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-absent))" }} />
                <span className="text-text-secondary">Absent:</span>
                <span className="font-semibold text-text-primary">{activeData.absent}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMonth(null)}
                className="ml-auto text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LeaveAnalyticsCard;