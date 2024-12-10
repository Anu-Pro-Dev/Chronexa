"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
import { CalendarIcon } from "lucide-react";

const data = [
  { month: "Jan", total: 8 },
  { month: "Feb", total: 5 },
  { month: "Apr", total: 6 },
  { month: "May", total: 4 },
  { month: "Jun", total: 6 },
  { month: "Jul", total: 8 },
  { month: "Aug", total: 3 },
  { month: "Sep", total: 3 },
  { month: "Oct", total: 8 },
  { month: "Nov", total: 6 },
  { month: "Dec", total: 5 },
];

export default function LeaveAnalytics() {
  return (
    <Card className="w-full max-w-4xl border-none shadow-sm bg-white rounded-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Leave analytics</CardTitle>
        <Select defaultValue="this-year">
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-year">This year</SelectItem>
            <SelectItem value="last-year">Last year</SelectItem>
            <SelectItem value="all-time">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: "Total leaves",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="xl:h-[280px] lg:h-[240px]"
        >
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Bar
              dataKey="total"
              fill="var(--primary-50) "
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg  bg-white p-4">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            {payload[0].payload.month} 2024
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-700" />
                            <span className="text-sm text-muted-foreground">
                              Total leaves
                            </span>
                            <span className="ml-auto font-semibold">
                              {payload[0].value}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm text-muted-foreground">
                              Leaves taken
                            </span>
                            <span className="ml-auto font-semibold">5</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-sm text-muted-foreground">
                              Leaves absent
                            </span>
                            <span className="ml-auto font-semibold">3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
