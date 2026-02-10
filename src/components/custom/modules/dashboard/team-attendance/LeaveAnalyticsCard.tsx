"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
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

  const fetchTeamLeaveAnalytics = useDashboardStore((s) => s.fetchTeamLeaveAnalyticsForYear);
  const teamLeaveAnalyticsCache = useDashboardStore((s) => s.teamLeaveAnalyticsCache);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const leaveAnalytics: LeaveAnalytic[] = teamLeaveAnalyticsCache[selectedYear] || [];

  const employees = useMemo(() => {
    return [...new Set(leaveAnalytics.map(e => e.employeeid))];
  }, [leaveAnalytics]);

  const chartData = useMemo(() => {
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
  }, [leaveAnalytics, monthNames, dir]);

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

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear]
  );

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
      peakMonth: peakMonthData?.month || 'N/A',
      peakMonthLeaves: peakMonthData?.totalLeaves || 0,
      avgPerEmployee,
    };
  }, [chartData, employees, leaveAnalytics]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">{data.month}</p>
        <div className="space-y-1 text-sm">
          <p style={{ color: '#3b82f6' }}>
            Total Leaves: <span className="font-bold">{data.totalLeaves}</span>
          </p>
          <p style={{ color: '#8b5cf6' }}>
            Employees: <span className="font-bold">{data.employeesOnLeave}</span>
          </p>
          <p className="text-muted-foreground">
            Avg: <span className="font-bold">{data.avgPerEmployee.toFixed(1)}</span>
          </p>
        </div>
        
        {data.details.length > 0 && (
          <>
            <hr className="my-2" />
            <p className="text-xs font-semibold mb-1">Top Contributors:</p>
            <div className="max-h-32 overflow-y-auto text-xs space-y-0.5">
              {data.details
                .sort((a: any, b: any) => 
                  (b.LeaveCount + b.AbsentCount) - (a.LeaveCount + a.AbsentCount)
                )
                .slice(0, 5)
                .map((emp: any) => (
                  <p key={emp.employeeid} className="text-muted-foreground">
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
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex justify-between p-4">
        <h5 className="text-lg font-bold text-text-primary">
          {translationDefaults.leave_analytics}
        </h5>

        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder={translationDefaults.select_year}>
              {selectedYear}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer 
        config={chartConfig} 
        dir={dir} 
        className={`relative w-full h-[300px] 3xl:h-[450px] ${dir === "rtl" ? "-right-[30px]" : "-left-[25px]"}`}
      >
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(0, 3)}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={10} 
            orientation={dir === "rtl" ? "right" : "left"} 
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
          
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />

          <Bar
            dataKey="totalLeaves"
            name={translationDefaults.total_leaves}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 px-4 pb-4 pt-2">
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
            {summaryStats.totalYearLeaves}
          </p>
          <p className="text-xs text-muted-foreground">{translationDefaults.total_leaves}</p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-lg font-bold" style={{ color: '#8b5cf6' }}>
            {summaryStats.peakMonth}
          </p>
          <p className="text-xs text-muted-foreground">{translationDefaults.peak_month}</p>
          <p className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>
            {summaryStats.peakMonthLeaves} leaves
          </p>
        </div>
        <div className="text-center bg-background rounded-lg p-3 border border-border">
          <p className="text-2xl font-bold" style={{ color: '#10b981' }}>
            {summaryStats.avgPerEmployee.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">{translationDefaults.avg_per_employee}</p>
        </div>
      </div>
    </div>
  );
}