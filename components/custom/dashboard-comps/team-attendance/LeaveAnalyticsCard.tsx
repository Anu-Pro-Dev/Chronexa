"use client";
import { useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar1Icon } from "@/icons/icons";

const chartData = [
  { month: "January", leaves: 8, absent: 1 },
  { month: "February", leaves: 5, absent: 2 },
  { month: "March", leaves: 7, absent: 5 },
  { month: "April", leaves: 3, absent: 3 },
  { month: "May", leaves: 2, absent: 0 },
  { month: "June", leaves: 5, absent: 4 },
  { month: "July", leaves: 6, absent: 1 },
  { month: "August", leaves: 4, absent: 2 },
  { month: "September", leaves: 7, absent: 3 },
  { month: "October", leaves: 1, absent: 0 },
  { month: "November", leaves: 0, absent: 0 },
  { month: "December", leaves: 0, absent: 0 },
];

function LeaveAnalyticsCard() {
  const { dir, translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState("this_year");

  const monthTranslationsMap: Record<string, string> = {
    January: translations.january || "يناير",
    February: translations.february || "فبراير",
    March: translations.march || "مارس",
    April: translations.april || "أبريل",
    May: translations.may || "مايو",
    June: translations.june || "يونيو",
    July: translations.july || "يوليو",
    August: translations.august || "أغسطس",
    September: translations.september || "سبتمبر",
    October: translations.october || "أكتوبر",
    November: translations.november || "نوفمبر",
    December: translations.december || "ديسمبر",
  };

  const chartConfig: ChartConfig = {
    leaves: {
      label: t?.leaves_taken || "Leaves taken",
      color: "hsl(var(--chart-leaves))",
    },
    absent: {
      label: t?.leaves_absent || "Leaves absent",
      color: "hsl(var(--chart-absent))",
    },
  };

  const localizedChartData =
    dir === "rtl" ? [...chartData].reverse() : chartData;

  const years = [
    "this_year",
    ...Array.from({ length: currentYear - 2019 }, (_, i) =>
      (currentYear - i).toString()
    ).slice(1),
  ];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          {t?.leave_analytics}
        </h5>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue
              placeholder={translations?.select_year || "Select year"}
            >
              {selectedYear === "this_year"
                ? translations?.this_year || "This year"
                : selectedYear}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year}
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-accent"
              >
                {year === "this_year"
                  ? translations?.this_year || "This year"
                  : year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer 
        config={chartConfig} 
        className={`relative ${
          dir === "rtl" ? "-right-[40px]" : "-left-[30px]"
        }`}
        dir={dir}
      >
        <BarChart data={localizedChartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            tickFormatter={(value) => {
              if (dir === "rtl") {
                const translated = monthTranslationsMap[value] || value;
                return translated.slice(0, 3);
              } else {
                return value.slice(0, 3);
              }
            }}
            textAnchor={dir === "rtl" ? "end" : "start"}
            tick={{ dx: dir === "rtl" ? -10 : 0 }}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} className="pb-3" />
          <Bar
            dataKey="leaves"
            stackId="a"
            fill="var(--color-leaves)"
            radius={[0, 0, 2, 2]}
          />
          <Bar
            dataKey="absent"
            stackId="a"
            fill="var(--color-absent)"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default LeaveAnalyticsCard;
