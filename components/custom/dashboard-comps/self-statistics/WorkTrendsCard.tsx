'use client';
import React from 'react';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart"

const chartData = [
  { date: "1", worked: 10, national: 0, holidays: 0 },
  { date: "2", worked: 0, national: 8, holidays: 4 },
  { date: "3", worked: 7, national: 4, holidays: 4 },
  { date: "4", worked: 11, national: 0, holidays: 1 },
  { date: "5", worked: 9, national: 0, holidays: 0 },
  { date: "6", worked: 4, national: 1, holidays: 5  },
  { date: "7", worked: 0, national: 0, holidays: 8 },
  { date: "8", worked: 6, national: 9, holidays: 5 },
  { date: "9", worked: 1, national: 7, holidays: 0 },
  { date: "10", worked: 9, national: 2, holidays:8 },
  { date: "11", worked: 1, national: 0, holidays: 0 },
  { date: "12", worked: 4, national: 0, holidays: 0 },
  { date: "13", worked: 7, national: 4, holidays: 4 },
  { date: "14", worked: 11, national: 0, holidays: 1 },
  { date: "15", worked: 9, national: 0, holidays: 0 },
  { date: "16", worked: 4, national: 1, holidays: 5  },
  { date: "17", worked: 0, national: 0, holidays: 8 },
  { date: "18", worked: 6, national: 9, holidays: 5 },
  { date: "19", worked: 1, national: 7, holidays: 0 },
  { date: "20", worked: 9, national: 2, holidays:8 },
  { date: "21", worked: 1, national: 0, holidays: 0 },
  { date: "22", worked: 4, national: 0, holidays: 0 },
  { date: "23", worked: 7, national: 4, holidays: 4 },
  { date: "24", worked: 11, national: 0, holidays: 1 },
  { date: "25", worked: 9, national: 0, holidays: 0 },
  { date: "26", worked: 4, national: 1, holidays: 5  },
  { date: "27", worked: 0, national: 0, holidays: 8 },
  { date: "28", worked: 6, national: 9, holidays: 5 },
  { date: "29", worked: 1, national: 7, holidays: 0 },
  { date: "30", worked: 9, national: 2, holidays:8 },
  { date: "31", worked: 1, national: 0, holidays: 0 },
]

const chartConfig = {
  worked: {
    label: "Worked Hours",
    color: "#0078D4",
  },
  national: {
    label: "National Holidays",
    color: "#c7e7ff",
  },
  holidays: {
    label: "Holidays",
    color: "#EBEBEB",
  }
} satisfies ChartConfig


function WorkTrendsCard() {
    return(
        <div className='shadow-card rounded-[10px] bg-white p-6'>
            <div className='flex flex-row justify-between'>
                <h5 className='text-lg text-text-primary font-bold'>Work hour trends</h5>
            </div>
            <p className='text-sm text-text-secondary font-semibold pb-6'>Work hour trends can be viewed here</p>
            <ChartContainer config={chartConfig} className="relative left-[-30px]">
                <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
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
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="worked" fill="var(--color-worked)" radius={0} />
                <Bar dataKey="national" fill="var(--color-national)" radius={0} />
                <Bar dataKey="holidays" fill="var(--color-holidays)" radius={0} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export default WorkTrendsCard;