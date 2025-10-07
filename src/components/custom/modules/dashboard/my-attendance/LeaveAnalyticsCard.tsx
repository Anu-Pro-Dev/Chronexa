"use client";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";
import { useAttendanceData } from "../my-attendance/AttendanceData";
import { useMemo, useState } from "react";

function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { leaveAnalytics } = useAttendanceData();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState("this_year");

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

  const chartData = useMemo(() => {
    const year = selectedYear === "this_year" ? currentYear : Number(selectedYear);
    const data = monthNames.map((monthName, index) => {
      const monthNumber = index + 1;
      const monthData = leaveAnalytics.find(
        (l) => l.LeaveMonth === monthNumber && l.LeaveYear === year
      );
      return {
        month: monthName,
        leaves: monthData?.LeaveCount || 0,
        absent: 0,
      };
    });
    return dir === "rtl" ? data.reverse() : data;
  }, [leaveAnalytics, selectedYear, dir, currentYear, monthNames]);

  const chartConfig: ChartConfig = {
    leaves: { label: t?.leaves_taken, color: "hsl(var(--chart-leaves))" },
    absent: { label: t?.leaves_absent, color: "hsl(var(--chart-absent))" },
  };

  const years = [
    "this_year",
    ...Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString()).slice(1),
  ];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">{t?.leave_analytics}</h5>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder={translations?.select_year}>
              {selectedYear === "this_year" ? translations?.this_year : selectedYear}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year}
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-primary"
              >
                {year === "this_year" ? translations?.this_year : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer config={chartConfig} className={`relative ${dir === "rtl" ? "-right-[40px]" : "-left-[30px]"}`} dir={dir}>
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
            textAnchor={dir === "rtl" ? "end" : "start"}
            tick={{ dx: dir === "rtl" ? -10 : 0 }}
          />
          <YAxis type="number" tickLine={false} tickMargin={2} axisLine={false} orientation={dir === "rtl" ? "right" : "left"} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegendContent className="pb-3" />
          <Bar dataKey="leaves" stackId="a" fill="var(--color-leaves)" radius={[0, 0, 2, 2]} />
          <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default LeaveAnalyticsCard;
