"use client";
import React, { useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Calendar1Icon } from "@/src/icons/icons";

const chartData = [
  { month: "January", missedin: 1, missedout: 2, latein: 5, earlyout: 0 },
  { month: "February", missedin: 3, missedout: 2, latein: 1, earlyout: 6 },
  { month: "March", missedin: 5, missedout: 3, latein: 6, earlyout: 1 },
  { month: "April", missedin: 3, missedout: 3, latein: 2, earlyout: 3 },
  { month: "May", missedin: 2, missedout: 1, latein: 4, earlyout: 4 },
  { month: "June", missedin: 5, missedout: 4, latein: 3, earlyout: 2 },
  { month: "July", missedin: 6, missedout: 1, latein: 5, earlyout: 1 },
  { month: "August", missedin: 4, missedout: 2, latein: 3, earlyout: 5 },
  { month: "September", missedin: 7, missedout: 3, latein: 7, earlyout: 4 },
  { month: "October", missedin: 1, missedout: 4, latein: 1, earlyout: 2 },
  { month: "November", missedin: 2, missedout: 1, latein: 2, earlyout: 1 },
  { month: "December", missedin: 0, missedout: 0, latein: 0, earlyout: 0 },
];

function ViolationsCard() {
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

  const chartConfig = {
    missedin: {
      label: t?.missed_in ||"Missed in",
      color: "#0078D4",
    },
    missedout: {
      label: t?.missed_out || "Missed out",
      color: "#1E9090",
    },
    latein: {
      label: t?.late_in || "Late in",
      color: "#FF6347",
    },
    earlyout: {
      label: t?.early_out || "Early out",
      color: "#FFBF00",
    },
  } satisfies ChartConfig;

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
          {t?.violations}
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
          dir === "rtl" ? "-right-[45px]" : "-left-[35px]"
        }`}
        dir={dir}
      >
        <LineChart
          accessibilityLayer
          data={localizedChartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              if (dir === "rtl") {
                const translated = monthTranslationsMap[value] || value;
                return translated.slice(0, 3);
              } else {
                return value.slice(0, 3);
              }
            }}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            orientation={dir === "rtl" ? "right" : "left"}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={false}
            defaultIndex={1}
          />
          <Line
            dataKey="missedin"
            type="monotone"
            stroke="var(--color-missedin)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="missedout"
            type="monotone"
            stroke="var(--color-missedout)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="latein"
            type="monotone"
            stroke="var(--color-latein)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="earlyout"
            type="monotone"
            stroke="var(--color-earlyout)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export default ViolationsCard;
