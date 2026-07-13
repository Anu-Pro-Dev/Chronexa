"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
} from "@/src/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Calendar1Icon } from "@/src/icons/icons";

interface LeaveAnalytic {
  employeeid: number;
  LVMonth: number;
  LeaveYear: number;
  LeaveCount: number;
  AbsentCount: number;
}

export default function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const translationDefaults = {
    leave_analytics: t?.leave_analytics || "Leave Analytics",
    select_year: translations?.select_year || "Select Year",
    total_leaves: "Total Leaves",
    employees_on_leave: "Employees on Leave",
    avg_per_employee: "Avg per Employee",
    peak_month: "Peak Month",
  };

  const fetchTeamLeaveAnalytics = useDashboardStore((s) => s.fetchTeamLeaveAnalyticsForYear);
  const teamLeaveAnalyticsCache = useDashboardStore((s) => s.teamLeaveAnalyticsCache);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const leaveAnalytics: LeaveAnalytic[] = useMemo(() => teamLeaveAnalyticsCache[selectedYear] || [], [teamLeaveAnalyticsCache, selectedYear]);

  const employees = useMemo(() => {
    return [...new Set(leaveAnalytics.map(e => e.employeeid))];
  }, [leaveAnalytics]);

  const chartData = useMemo(() => {
    const monthNames = [
      translations?.january || "January",
      translations?.february || "February",
      translations?.march || "March",
      translations?.april || "April",
      translations?.may || "May",
      translations?.june || "June",
      translations?.july || "July",
      translations?.august || "August",
      translations?.september || "September",
      translations?.october || "October",
      translations?.november || "November",
      translations?.december || "December",
    ];

    const data = monthNames.map((month, index) => {
      const monthData = leaveAnalytics.filter(item => item.LVMonth === index + 1);

      const totalLeaves = monthData.reduce(
        (sum, item) => sum + item.LeaveCount + item.AbsentCount,
        0
      );

      const employeesOnLeave = monthData.filter(
        item => item.LeaveCount + item.AbsentCount > 0
      ).length;

      return {
        month,
        totalLeaves,
        employeesOnLeave,
        avgPerEmployee: employeesOnLeave > 0 ? totalLeaves / employeesOnLeave : 0,
        details: monthData.filter(item => item.LeaveCount + item.AbsentCount > 0),
      };
    });

    return dir === "rtl" ? [...data].reverse() : data;
  }, [leaveAnalytics, dir, translations]);

  const chartConfig: ChartConfig = {
    totalLeaves: {
      label: translationDefaults.total_leaves,
      color: "#3b82f6",
    },
    employeesOnLeave: {
      label: translationDefaults.employees_on_leave,
      color: "#8b5cf6",
    },
  };

  const years = useMemo(() => {
    const START_YEAR = 2025;
    const count = Math.max(currentYear - START_YEAR + 1, 1);
    return Array.from({ length: count }, (_, i) => currentYear - i);
  }, [currentYear]);

  const handleYearChange = (year: string) => {
    const newYear = Number(year);
    setSelectedYear(newYear);
    if (!teamLeaveAnalyticsCache[newYear]) {
      fetchTeamLeaveAnalytics(newYear);
    }
  };

  const summaryStats = useMemo(() => {
    const totalYearLeaves = chartData.reduce((sum, d) => sum + d.totalLeaves, 0);
    const peakMonthData = chartData.reduce((max, d) =>
      d.totalLeaves > max.totalLeaves ? d : max
      , chartData[0]);

    const employeesWithLeaves = employees.filter(empId => {
      const empLeaves = leaveAnalytics
        .filter(item => item.employeeid === empId)
        .reduce((sum, item) => sum + item.LeaveCount + item.AbsentCount, 0);
      return empLeaves > 0;
    }).length;

    const avgPerEmployee = employeesWithLeaves > 0 ? totalYearLeaves / employeesWithLeaves : 0;

    return {
      totalYearLeaves,
      peakMonth: peakMonthData?.month || "N/A",
      peakMonthLeaves: peakMonthData?.totalLeaves || 0,
      avgPerEmployee,
    };
  }, [chartData, employees, leaveAnalytics]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2 text-text-primary text-sm">{data.month}</p>
        <div className="space-y-1 text-xs">
          <p style={{ color: "#3b82f6" }}>
            Total Leaves: <span className="font-medium">{data.totalLeaves}</span>
          </p>
          <p style={{ color: "#8b5cf6" }}>
            Employees: <span className="font-medium">{data.employeesOnLeave}</span>
          </p>
          <p className="text-text-secondary">
            Avg: <span className="font-medium">{data.avgPerEmployee.toFixed(1)}</span>
          </p>
        </div>
        {data.details.length > 0 && (
          <>
            <hr className="my-2 border-border" />
            <p className="text-[11px] font-semibold mb-1 text-text-secondary uppercase tracking-wider">Top Contributors</p>
            <div className="max-h-32 overflow-y-auto text-xs space-y-0.5">
              {data.details
                .sort((a: any, b: any) =>
                  (b.LeaveCount + b.AbsentCount) - (a.LeaveCount + a.AbsentCount)
                )
                .slice(0, 5)
                .map((emp: any) => (
                  <p key={emp.employeeid} className="text-text-secondary">
                    Emp {emp.employeeid}: {emp.LeaveCount + emp.AbsentCount} days
                  </p>
                ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-accent rounded-[10px] shadow-card p-4 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h5 className="text-lg font-bold text-text-primary">
            {translationDefaults.leave_analytics}
          </h5>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex justify-center items-center gap-2 text-xs text-text-secondary">
            <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "#3b82f6" }} />
            <span>{translationDefaults.total_leaves}</span>
          </div>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
              <Calendar1Icon width="14" height="16" />
              <SelectValue placeholder={translationDefaults.select_year}>
                {selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-accent rounded-md shadow-dropdown">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()} className="text-text-primary bg-accent">
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
        className={`w-full h-[220px] relative ${dir === "rtl" ? "-right-[25px]" : "-left-[20px]"}`}
      >
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={v => v.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickMargin={10}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
          <Bar
            dataKey="totalLeaves"
            name={translationDefaults.total_leaves}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={800}
          />
        </BarChart>
      </ChartContainer>

      {/* Summary stat cards — matches KpiCard style */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          { label: translationDefaults.total_leaves, value: summaryStats.totalYearLeaves, color: "#3b82f6", sub: null },
          { label: translationDefaults.peak_month, value: summaryStats.peakMonth, color: "#8b5cf6", sub: `${summaryStats.peakMonthLeaves} leaves` },
          { label: translationDefaults.avg_per_employee, value: summaryStats.avgPerEmployee.toFixed(1), color: "#1DAA61", sub: "per employee" },
        ].map((stat) => (
          <div key={stat.label} className="bg-background rounded-[10px] shadow-card p-3 flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary leading-tight">
              {stat.label}
            </p>
            <p className="text-2xl font-medium leading-none" style={{ color: stat.color }}>
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-xs text-text-secondary">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}