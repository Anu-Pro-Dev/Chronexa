"use client";
import React, { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
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

const chartConfig = {
  missedin: {
    label: "Missed in",
    color: "#0078D4",
  },
  missedout: {
    label: "Missed out",
    color: "#1E9090",
  },
  latein: {
    label: "Late in",
    color: "#FF6347",
  },
  earlyout: {
    label: "Early out",
    color: "#FFBF00",
  },
} satisfies ChartConfig;

function ViolationsCard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState("This year");

  const years = ["This year", ...Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString()).slice(1)];

  return (
    <div className="shadow-card rounded-[10px] bg-white p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          Violations
        </h5>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-md shadow-dropdown">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year}
                className="text-text-primary gap-0 bg-white hover:bg-primary hover:text-white"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer config={chartConfig} className="relative left-[-35px]">
        <LineChart
          accessibilityLayer
          data={chartData}
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
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
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
