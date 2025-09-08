
"use client"
import { useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";

const chartData = [
  { activity: "Missed in", value: 24 },
  { activity: "Leaves", value: 21 },
  { activity: "Absent", value: 14 },
  { activity: "Early out", value: 13 },
  { activity: "Late in", value: 17 },
  { activity: "Missed out", value: 16 },
]

const chartConfig = {
  value: {
    label: "value",
    color: "#0078D4",
  },
} satisfies ChartConfig

function TeamAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState("this_month");

  const months = [
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

  const monthsWithThisMonth = months.map((month, index) =>
    index === currentMonthIndex ? translations?.this_month || "This Month" : month
  );

  const chartData = [
    { key: "leaves", value: 21 },
    { key: "absent", value: 14 },
    { key: "missed_in", value: 24 },
    { key: "missed_out", value: 16 },
    { key: "late_in", value: 17 },
    { key: "early_out", value: 13 },
  ].map(({ key, value }) => ({
    activity: t[key] || key.replace(/_/g, " "), 
    value,
  }));


  const chartDataToRender = dir === "rtl" ? [...chartData].reverse() : chartData;

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className='flex flex-row justify-between p-4'>
        <h5 className='text-lg text-text-primary font-bold'> {t?.team_analytics}</h5>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
              <SelectValue placeholder={translations?.select_month || "Select month"}>
              {selectedMonth === "this_month"
                ? translations?.this_month || "This Month"
                : selectedMonth}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {monthsWithThisMonth.map((month, index) => {
              const value = index === currentMonthIndex ? "this_month" : month;
              return (
                <SelectItem
                  key={value}
                  value={value}
                  className="text-text-primary bg-accent"
                >
                  {month}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
        dir={dir}
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] w-full"
      >
        <RadarChart data={chartDataToRender}>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideIndicator hideLabel/>}
          />
          <PolarGrid gridType="circle" className="stoke-[--color-desktop] opacity-20"/>
          <PolarAngleAxis dataKey="activity"/>
          <Radar
            dataKey="value"
            fill="var(--color-value)"
            fillOpacity={0.2}
            dot={{
              r: 4,
              fillOpacity: 1,
            }}
          />
        </RadarChart>
      </ChartContainer>
    </div> 
  )
}

export default TeamAnalyticsCard;