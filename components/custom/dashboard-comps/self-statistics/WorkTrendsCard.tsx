"use client";
import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
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

const colorMapping = {
  worked: "#0078D4",   
  leave: "#EBEBEB",    
  holidays: "#C7E7FF",
};

const CustomLegend = ({ payload }: any) => {
  const customLabels: { [key in 'worked' | 'leave' | 'holidays']: string } = {
    worked: "Worked Hours",
    leave: "Leave Hours",
    holidays: "Holiday Hours",
  };

  return (
    <div className="flex justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center mx-2">
          <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: entry.color }}></div>
          <span className="text-sm text-gray-700">
            {customLabels[entry.value as 'worked' | 'leave' | 'holidays'] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const chartData = [
  { date: "1", status: "holidays" },
  { date: "2", status: "holidays" },
  { date: "3", status: "worked" },
  { date: "4", status: "worked" },
  { date: "5", status: "worked" },
  { date: "6", status: "worked" },
  { date: "7", status: "worked" },
  { date: "8", status: "holidays" },
  { date: "9", status: "holidays" },
  { date: "10", status: "worked" },
  { date: "11", status: "worked" },
  { date: "12", status: "leave" },
  { date: "13", status: "worked" },
  { date: "14", status: "worked" },
  { date: "15", status: "holidays" },
  { date: "16", status: "holidays" },
  { date: "17", status: "worked" },
  { date: "18", status: "worked" },
  { date: "19", status: "leave" },
  { date: "20", status: "leave" },
  { date: "21", status: "leave" },
  { date: "22", status: "holidays" },
  { date: "23", status: "holidays" },
  { date: "24", status: "holidays" },
  { date: "25", status: "worked" },
  { date: "26", status: "worked" },
  { date: "27", status: "worked" },
  { date: "28", status: "worked" },
  { date: "29", status: "holidays" },
  { date: "30", status: "holidays" },
  { date: "31", status: "holidays" },
];

const processedChartData = chartData.map((entry) => ({
  date: entry.date,
  worked: entry.status === "worked" ? 8 : 0,
  leave: entry.status === "leave" ?  9 : 0,
  holidays: entry.status === "holidays" ? 10 : 0,
}));

function WorkTrendsCard() {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState("This month");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthsWithThisMonth = months.map((month, index) =>
    index === currentMonthIndex ? "This month" : month
  );

  return (
    <div className="shadow-card rounded-[10px] bg-white p-4">
      <div className="flex flex-row justify-between p-3">
        <h5 className="text-lg text-text-primary font-bold">Work hour trends</h5>
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
                className="text-text-primary bg-white"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        className="relative -left-[35px] w-full flex justify-center"
        config={{
          type: { label: "Bar Chart", icon: undefined, color: "#0078D4" },
          options: {},
        }}
      >
        <BarChart accessibilityLayer data={processedChartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} tickMargin={2} axisLine={false} interval={0}/>
          <YAxis type="number" tickLine={false} tickMargin={2} axisLine={false} domain={[0, 10]}/>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<CustomLegend />} />

          <Bar dataKey="worked" stackId="a" fill={colorMapping.worked} radius={0} barSize={5}/>
          <Bar dataKey="leave" stackId="a" fill={colorMapping.leave} radius={0} barSize={5}/>
          <Bar dataKey="holidays" stackId="a" fill={colorMapping.holidays} radius={0} barSize={5}/>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export default WorkTrendsCard;
