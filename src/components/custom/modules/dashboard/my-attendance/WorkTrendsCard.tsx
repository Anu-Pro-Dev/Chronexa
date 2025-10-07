"use client";
import React, { useState, useMemo } from "react";
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
import { useAttendanceData } from "../my-attendance/AttendanceData";

const colorMapping = {
  worked: "#0078D4",
  leave: "#EBEBEB",
  holidays: "#C7E7FF",
};

const CustomLegend = ({ payload }: any) => {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const customLabels: { [key in "worked" | "leave" | "holidays"]: string } = {
    worked: t?.worked_hrs,
    leave: t?.leave_hrs,
    holidays: t?.holiday_hrs,
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
            {customLabels[entry.value as "worked" | "leave" | "holidays"] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function WorkTrendsCard() {
  const { dir, translations } = useLanguage();
  const { workHourTrends } = useAttendanceData();
  const t = translations?.modules?.dashboard || {};
  const currentMonthIndex = new Date().getMonth();

  const [selectedMonth, setSelectedMonth] = useState<"this_month" | string>("this_month");

  const monthKeys = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const months = monthKeys.map(
    (key, i) => translations?.[key] || new Date(0, i).toLocaleString("en", { month: "long" })
  );

  const chartDataToRender = useMemo(() => {
    if (!workHourTrends?.length) return [];

    const monthIndex =
      selectedMonth === "this_month" ? currentMonthIndex : parseInt(selectedMonth, 10);

    return workHourTrends
      .filter((d) => new Date(d.DayofDate).getMonth() === monthIndex)
      .map((d) => ({
        date: new Date(d.DayofDate).getDate().toString(),
        worked: d.WorkMinutes / 60,
        leave: d.MissedMinutes > 0 ? d.MissedMinutes / 60 : 0,
        holidays: d.WorkingDay === 0 ? d.ExpectedWork / 60 : 0,
      }));
  }, [workHourTrends, selectedMonth, currentMonthIndex]);

  const chartDataFinal = dir === "rtl" ? [...chartDataToRender].reverse() : chartDataToRender;

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-4">
      <div className="flex flex-row justify-between p-3">
        <h5 className="text-lg text-text-primary font-bold">{t?.work_hrs_trends}</h5>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue>
              {selectedMonth === "this_month"
                ? translations?.this_month
                : months[parseInt(selectedMonth, 10)]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {months.map((month, index) => {
              const value = index === currentMonthIndex ? "this_month" : index.toString();
              return (
                <SelectItem
                  key={`month-${index}`}
                  value={value}
                  className="text-text-primary bg-accent"
                >
                  {index === currentMonthIndex ? translations?.this_month : month}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

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
          <XAxis dataKey="date" tickLine={false} tickMargin={2} axisLine={false} interval={0} />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            domain={[0, 10]}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<CustomLegend />} />

          <Bar dataKey="worked" stackId="a" fill={colorMapping.worked} radius={0} barSize={5} />
          <Bar dataKey="leave" stackId="a" fill={colorMapping.leave} radius={0} barSize={5} />
          <Bar dataKey="holidays" stackId="a" fill={colorMapping.holidays} radius={0} barSize={5} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default WorkTrendsCard;
