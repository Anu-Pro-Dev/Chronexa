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
    employee: translations?.employee || "Employee",
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
  };

  const monthNames = [
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
    return [...new Set(leaveAnalytics.map(e => e.employeeid))];
  }, [leaveAnalytics]);

  const employeeColors = useMemo(() => {
    const colors: Record<number, string> = {};
    employees.forEach((id, i) => {
      colors[id] = `hsl(${i * 3}, 100%, 64%)`;
    });
    return colors;
  }, [employees]);

  const chartData = useMemo(() => {
    const data = monthNames.map((month, index) => {
      const row: any = { month };

      leaveAnalytics.forEach(item => {
        if (item.LVMonth === index + 1) {
          row[`emp${item.employeeid}`] =
            (row[`emp${item.employeeid}`] || 0) +
            item.LeaveCount +
            item.AbsentCount;
        }
      });

      return row;
    });

    return dir === "rtl" ? [...data].reverse() : data;
  }, [leaveAnalytics, monthNames, dir]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    employees.forEach(empId => {
      config[`emp${empId}`] = {
        label: `${translationDefaults.employee} ${empId}`,
        color: employeeColors[empId],
      };
    });
    return config;
  }, [employees, employeeColors, translationDefaults.employee]);

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear]
  );

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex justify-between p-4">
        <h5 className="text-lg font-bold text-text-primary">
          {translationDefaults.leave_analytics}
        </h5>

        <Select
          value={selectedYear.toString()}
          onValueChange={v => setSelectedYear(Number(v))}
        >
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

      <ChartContainer config={chartConfig} dir={dir} className={`relative w-full h-[300px] 3xl:h-[450px] ${dir === "rtl" ? "-right-[30px]" : "-left-[25px]"}`}>
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.slice(0, 3)}
          />
          <YAxis type="number" tickLine={false} axisLine={false} tickMargin={10} orientation={dir === "rtl" ? "right" : "left"} />

          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(0,0,0,0.01)" }} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ height: 'auto', width: '100%', justifyContent: 'center' }}
          />

          {employees.map(empId => (
            <Bar
              key={empId}
              dataKey={`emp${empId}`}
              name={`${translationDefaults.employee} ${empId}`}
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