
"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart"

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
  return (
    <div className="shadow-card rounded-[10px] bg-white p-2">
      <div className='flex flex-row justify-between p-4'>
        <h5 className='text-lg text-text-primary font-bold'>Team Analytics</h5>
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