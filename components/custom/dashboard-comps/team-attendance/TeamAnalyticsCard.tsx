
"use client"
import { useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
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
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState("This month");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthsWithThisMonth = months.map((month, index) => {
    if (index === currentMonthIndex) {
      return "This month";
    }
    return month;
  })

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-2">
      <div className='flex flex-row justify-between p-4'>
        <h5 className='text-lg text-text-primary font-bold'>Team Analytics</h5>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
            <Calendar1Icon width="14" height="16" />
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="bg-accent rounded-md shadow-dropdown">
            {monthsWithThisMonth.map((month) => (
              <SelectItem
                key={month}
                value={month}
                className="text-text-primary gap-0 bg-accent hover:bg-primary hover:text-accent"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] w-full"
      >
        <RadarChart data={chartData}>
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