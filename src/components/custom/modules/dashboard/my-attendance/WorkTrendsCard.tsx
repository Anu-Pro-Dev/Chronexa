"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { getWorkHourTrends } from '@/src/lib/apiHandler';

const colorMapping = {
  worked: "#0078D4",
  missed: "#EBEBEB",
  expected: "#C7E7FF",
};

const CustomLegend = ({ payload }: any) => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const customLabels: { [key in "worked" | "missed" | "expected"]: string } = {
    worked: t?.worked_hrs || "Worked Hrs",
    missed: t?.missed_hrs || "Missed Hrs",
    expected: t?.expected_hrs || "Expected Hrs",
  };

  return (
    <div className="flex justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={`legend-${entry.value}-${index}`} className="flex items-center mx-2">
          <div
            className="w-3 h-3 mr-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-gray-700 px-1">
            {customLabels[entry.value as "worked" | "missed" | "expected"] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function WorkTrendsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentMonth = new Date().getMonth() + 1; 
  
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [workHourTrends, setWorkHourTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKeys = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const months = monthKeys.map(
    (key, i) => translations?.[key] || new Date(0, i).toLocaleString("en", { month: "long" })
  );

  useEffect(() => {
    const fetchWorkHourData = async () => {
      try {
        setLoading(true);
        const monthParam = selectedMonth.toString().padStart(2, '0');        
        const response = await getWorkHourTrends(monthParam);        
        if (response?.success && response?.data) {
          setWorkHourTrends(response.data);
        } else {
          setWorkHourTrends([]);
        }
      } catch (error) {
        console.error('Error fetching work hour trends:', error);
        setWorkHourTrends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkHourData();
  }, [selectedMonth]);

  const chartDataToRender = useMemo(() => {
    if (!workHourTrends?.length) return [];

    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();

    const data = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      
      const dayData = workHourTrends.find(item => item.DayofDate === dayNumber);
      
      if (!dayData || dayData.ExpectedWork === null || dayData.ExpectedWork === 0) {
        return {
          date: dayNumber.toString(),
          worked: 0,
          missed: 0,
          expected: 0,
        };
      }

      const expectedHours = dayData.ExpectedWork / 60;
      const workedHours = (dayData.WorkMinutes || 0) / 60;
      const missedHours = Math.max(0, expectedHours - workedHours);
      
      return {
        date: dayNumber.toString(),
        worked: workedHours,
        missed: missedHours,
        expected: expectedHours,
      };
    });

    return data;
  }, [workHourTrends, selectedMonth]);

  const chartDataFinal = dir === "rtl" ? [...chartDataToRender].reverse() : chartDataToRender;

  const maxExpectedHours = Math.max(
    ...chartDataToRender.map(d => d.expected),
  );

  const yAxisMax = Math.ceil(maxExpectedHours);

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <div className="flex flex-row justify-between p-3">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.work_hrs_trends || "Work Hour Trends"}
        </h5>

        <Select 
          value={selectedMonth.toString()} 
          onValueChange={(value) => setSelectedMonth(Number(value))}
        >
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue>
              {selectedMonth === currentMonth
                ? translations?.this_month || "This Month"
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
                    ? translations?.this_month || "This Month"
                    : month}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <p className="text-text-secondary">Loading...</p>
        </div>
      ) : (
        <ChartContainer
          dir={dir}
          className={`relative w-full flex justify-center ${dir === "rtl" ? "-right-[45px]" : "-left-[35px]"}`}
          config={{
            type: { label: "Bar Chart", icon: undefined, color: "#0078D4" },
            options: {},
          }}
        >
          <BarChart accessibilityLayer data={chartDataFinal}>
            <CartesianGrid vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              tickMargin={2} 
              axisLine={false} 
              interval={0} 
            />
            <YAxis
              type="number"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              domain={[0, yAxisMax]}
              orientation={dir === "rtl" ? "right" : "left"}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<CustomLegend />} />

            {/* <Bar 
              dataKey="expected" 
              stackId="a" 
              fill={colorMapping.expected} 
              radius={0} 
              barSize={5} 
            /> */}
            <Bar 
              dataKey="worked" 
              stackId="b" 
              fill={colorMapping.worked} 
              radius={0} 
              barSize={5} 
            />
            <Bar 
              dataKey="missed" 
              stackId="b" 
              fill={colorMapping.missed} 
              radius={0} 
              barSize={5} 
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

export default WorkTrendsCard;