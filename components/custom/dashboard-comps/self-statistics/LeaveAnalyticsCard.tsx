
"use client"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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
]

const chartConfig = {
  leaves: {
    label: "Leaves taken",
    color: "hsl(var(--chart-leaves))",
  },
  absent: {
    label: "Leaves absent",
    color: "hsl(var(--chart-absent))",
  },
} satisfies ChartConfig

function LeaveAnalyticsCard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState("This year");

  const years = ["This year", ...Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString()).slice(1)];

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className="flex flex-row justify-between p-4">
        <h5 className="text-lg text-text-primary font-bold">
          Leave Analytics
        </h5>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year}
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-accent"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer config={chartConfig} className="relative left-[-30px]">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            type="number"
            tickLine={false}
            tickMargin={2}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent/>}
          />
          <ChartLegend content={<ChartLegendContent />} className="pb-3"/>
          <Bar dataKey="leaves" stackId="a" fill="var(--color-leaves)" radius={[0, 0, 2, 2]} />
          <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div> 
  )
}

export default LeaveAnalyticsCard;