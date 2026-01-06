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
import { getLeaveAnalytics } from '@/src/lib/dashboardApiHandler';
import { useLanguage } from "@/src/providers/LanguageProvider";

interface LeaveAnalytic {
  LeaveYear: number;
  [key: string]: any;
}

function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  
  const translationDefaults = {
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
    const fetchYearData = async () => {
      try {
        const response = await getLeaveAnalytics(selectedYear);
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
      label: translationDefaults.leaves,
      color: "hsl(var(--chart-leaves))"
    },
    absent: { 
      label: translationDefaults.absent,
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
          {translationDefaults.leave_analytics}
        </h5>
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(Number(value))}
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
            cursor={{ fill: 'rgba(0, 0, 0, 0.01)' }} 
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
            name={translationDefaults.leaves}
            activeBar={{
              fill: "hsl(var(--chart-leaves-hover))",
            }}
          />
          <Bar 
            dataKey="absent" 
            stackId="a" 
            fill="var(--color-absent)" 
            radius={[2, 2, 0, 0]}
            name={translationDefaults.absent}
            activeBar={{
              fill: "hsl(var(--chart-absent-hover))",
            }}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default LeaveAnalyticsCard;