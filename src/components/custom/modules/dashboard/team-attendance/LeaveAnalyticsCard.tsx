"use client";
import { useState, useMemo, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { getTeamLeaveAnalytics } from '@/src/lib/dashboardApiHandler';

interface LeaveAnalytic {
  LeaveYear: number;
  [key: string]: any;
}

function LeaveAnalyticsCard() {
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const translations = {
    leave_analytics: "Leave Analytics",
    select_year: "Select Year",
    leaves_taken: "Leaves",
    leaves_absent: "Absent",
    no_data: "No leave data available",
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
    const fetchYearData = async () => {
      try {
        const response = await getTeamLeaveAnalytics(selectedYear);
        if (response?.success && response.data?.length > 0) {
          setLeaveAnalytics(response.data);
        } else {
          setLeaveAnalytics([]);
        }
      } catch (error) {
        console.error('Error fetching leave analytics:', error);
        setLeaveAnalytics([]);
      }
    };

    fetchYearData();
  }, [selectedYear]);

  const chartData = useMemo(() => {
    const monthDataMap = new Map();
    
    leaveAnalytics.forEach((item: any) => {
      monthDataMap.set(item.LVMonth, {
        leaves: item.LeaveCount || 0,
        absent: item.AbsentCount || 0,
      });
    });

    const data = monthNames.map((monthName, index) => ({
      month: monthName,
      leaves: monthDataMap.get(index + 1)?.leaves || 0,
      absent: monthDataMap.get(index + 1)?.absent || 0,
    }));

    return dir === "rtl" ? [...data].reverse() : data;
  }, [dir, monthNames, leaveAnalytics]);

  const chartConfig = {
    leaves: { 
      label: translations.leaves_taken,
      color: "hsl(var(--chart-leaves))"
    },
    absent: { 
      label: translations.leaves_absent,
      color: "hsl(var(--chart-absent))"
    },
  };

  const years = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, [currentYear]);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          {translations.leave_analytics}
        </h5>
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
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
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-primary"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer 
        config={chartConfig} 
        className={`relative ${dir === "rtl" ? "-right-[40px]" : "-left-[30px]"}`} 
        dir={dir}
      >
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
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
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
            content={<ChartTooltipContent />} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingTop: '16px' }}
          />
          <Bar 
            dataKey="leaves" 
            stackId="a" 
            fill="var(--color-leaves)" 
            radius={[0, 0, 2, 2]}
            name={translations.leaves_taken}
          />
          <Bar 
            dataKey="absent" 
            stackId="a" 
            fill="var(--color-absent)" 
            radius={[2, 2, 0, 0]}
            name={translations.leaves_absent}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default LeaveAnalyticsCard;