"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { getLeaveAnalytics } from '@/src/lib/apiHandler';
import { useMemo, useState, useEffect } from "react";

function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [leaveAnalytics, setLeaveAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    translations.january || "January",
    translations.february || "February",
    translations.march || "March",
    translations.april || "April",
    translations.may || "May",
    translations.june || "June",
    translations.july || "July",
    translations.august || "August",
    translations.september || "September",
    translations.october || "October",
    translations.november || "November",
    translations.december || "December",
  ];

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);        
        const response = await getLeaveAnalytics(selectedYear);        
        if (response?.success && response?.data) {
          setLeaveAnalytics(response.data);
        } else {
          setLeaveAnalytics([]);
        }
      } catch (error) {
        console.error('Error fetching leave analytics:', error);
        setLeaveAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [selectedYear]);

  const chartData = useMemo(() => {
    const data = monthNames.map((monthName, index) => {
      const monthNumber = index + 1;
      

      const monthData = leaveAnalytics.find(
        (item) => item.LVMonth === monthNumber && item.LeaveYear === selectedYear
      );

      return {
        month: monthName,
        leaves: monthData?.LeaveCount || 0,
        absent: monthData?.AbsentCount || 0,
      };
    });

    return dir === "rtl" ? [...data].reverse() : data;
  }, [leaveAnalytics, selectedYear, dir, monthNames]);

  const chartConfig: ChartConfig = {
    leaves: { 
      label: t?.leaves_taken || "Leaves", 
      color: "hsl(var(--chart-leaves))"
    },
    absent: { 
      label: t?.leaves_absent || "Absent", 
      color: "hsl(var(--chart-absent))"
    },
  };

  const years = Array.from(
    { length: currentYear - 2019 }, 
    (_, i) => currentYear - i
  );

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.leave_analytics || "Leave Analytics"}
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

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-text-secondary">Loading...</p>
        </div>
      ) : (
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
              name={t?.leaves_taken || "Leaves"}
            />
            <Bar 
              dataKey="absent" 
              stackId="a" 
              fill="var(--color-absent)" 
              radius={[2, 2, 0, 0]}
              name={t?.leaves_absent || "Absent"}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default LeaveAnalyticsCard;