"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

import { getTeamLeaveAnalytics } from "@/src/lib/dashboardApiHandler";

interface LeaveAnalytic {
  employee_id: number;
  LVMonth: number;
  LeaveYear: number;
  LeaveCount: number;
  AbsentCount: number;
}

export default function LeaveAnalyticsCard() {
  const [dir] = useState<"ltr" | "rtl">("ltr");

  const translations = {
    leave_analytics: "Leave Analytics",
    select_year: "Select Year",
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  };

  const monthNames = [
    translations.january,
    translations.february,
    translations.march,
    translations.april,
    translations.may,
    translations.june,
    translations.july,
    translations.august,
    translations.september,
    translations.october,
    translations.november,
    translations.december,
  ];

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [leaveAnalytics, setLeaveAnalytics] = useState<LeaveAnalytic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTeamLeaveAnalytics(selectedYear);
        setLeaveAnalytics(res?.success ? res.data || [] : []);
      } catch (err) {
        console.error("Leave analytics error:", err);
        setLeaveAnalytics([]);
      }
    };

    fetchData();
  }, [selectedYear]);

  const employees = useMemo(() => {
    return [...new Set(leaveAnalytics.map(e => e.employee_id))];
  }, [leaveAnalytics]);

  const employeeColors = useMemo(() => {
    const colors: Record<number, string> = {};
    employees.forEach((id, i) => {
      colors[id] = `hsl(${i * 9}, 100%, 64%)`;
    });
    return colors;
  }, [employees]);

  const chartData = useMemo(() => {
    return monthNames.map((month, index) => {
      const row: any = { month };

      leaveAnalytics.forEach(item => {
        if (item.LVMonth === index + 1) {
          row[`emp${item.employee_id}`] =
            (row[`emp${item.employee_id}`] || 0) +
            item.LeaveCount +
            item.AbsentCount;
        }
      });

      return row;
    });
  }, [leaveAnalytics, monthNames]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    employees.forEach(empId => {
      config[`emp${empId}`] = {
        label: `Employee ${empId}`,
        color: employeeColors[empId],
      };
    });
    return config;
  }, [employees, employeeColors]);

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear]
  );

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex justify-between p-4">
        <h5 className="text-lg font-bold text-text-primary">
          {translations.leave_analytics}
        </h5>

        <Select
          value={selectedYear.toString()}
          onValueChange={v => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="h-9 w-auto rounded-lg border shadow-button text-sm font-semibold">
            <SelectValue>{selectedYear}</SelectValue>
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

      <ChartContainer config={chartConfig} dir={dir} className={`relative w-full h-[300px] ${dir === "rtl" ? "-right-[30px]" : "-left-[25px]"}`}>
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(0, 3)}
          />
          <YAxis tickLine={false} axisLine={false} />

          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(0,0,0,0.01)" }}/>
          <Legend />

          {employees.map(empId => (
            <Bar
              key={empId}
              dataKey={`emp${empId}`}
              name={`Employee ${empId}`}
              fill={employeeColors[empId]}
              barSize={18}
              radius={[2, 2, 0, 0]}
              activeBar={{
                fill: employeeColors[empId].replace("64%", "50%"),
                stroke: employeeColors[empId],
                strokeWidth: 1,
              }}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}