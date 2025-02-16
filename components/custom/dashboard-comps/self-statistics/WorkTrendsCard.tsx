'use client';
import React, { useState } from 'react';
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

    return(
        <div className='shadow-card rounded-[10px] bg-white p-2'>
          {/* <div className="flex justify-between">
            <div>
              <h5 className='text-lg text-text-primary font-bold'>Work hour trends</h5>
            </div>
            <div>
              <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                <SelectTrigger className="flex items-center gap-2 border border-gray-300 rounded-md p-2">
                  <FaCalendarAlt className="w-5 h-5 text-gray-500" />
                  <SelectValue>{months[parseInt(selectedMonth)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                        {month}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div> */}
          <div className="flex flex-row justify-between p-4">
            <div>
              <h5 className="text-lg text-text-primary font-bold">
                Work hour trends
              </h5>
              <p className='text-sm text-text-secondary font-semibold pb-4'>Work hour trends can be viewed here</p>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-auto h-9 border pl-3 border-border-accent shadow-button rounded-lg text-text-secondary font-semibold text-sm flex gap-2">
                <Calendar1Icon width="14" height="16" />
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-md shadow-dropdown">
                {monthsWithThisMonth.map((month) => (
                  <SelectItem
                    key={month}
                    value={month}
                    className="text-text-primary gap-0 bg-white hover:bg-primary hover:text-white"
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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