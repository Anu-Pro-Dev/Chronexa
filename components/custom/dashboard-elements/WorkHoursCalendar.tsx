"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkHour {
  date: string;
  hours: number;
}

interface WorkHoursCalendarProps {
  data: WorkHour[];
  year?: number;
}

export default function WorkHoursCalendar({
  data,
  year = 2024,
}: WorkHoursCalendarProps) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getColorClass = (hours: number) => {
    if (hours === 0) return "bg-gray-50";
    if (hours < 4) return "bg-blue-100";
    if (hours < 8) return "bg-blue-300";
    return "bg-blue-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work hour trends</h2>
          <p className="text-gray-500">Work hour trends can be viewed here</p>
        </div>
        <Select defaultValue={year.toString()}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[auto_repeat(48,1fr)] gap-1 mb-2">
            <div className="w-12" /> 
            {months.map((month) => (
              <div key={month} className="col-span-4 text-sm">
                {month}
              </div>
            ))}
          </div>

    
          {days.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[auto_repeat(48,1fr)] gap-1 mb-1"
            >
              <div className="w-12 text-sm">{day}</div>
              {Array.from({ length: 48 }).map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-sm ${getColorClass(
                    Math.random() * 10
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-8 text-sm text-gray-500">
        <div>Overview of this year (2024)</div>
        <div className="flex items-center gap-2">
          <span>0Hrs</span>
          <div className="w-4 h-4 bg-gray-50 rounded-sm" />
          <div className="w-4 h-4 bg-blue-100 rounded-sm" />
          <div className="w-4 h-4 bg-blue-300 rounded-sm" />
          <div className="w-4 h-4 bg-blue-500 rounded-sm" />
          <span>8+ Hrs</span>
        </div>
      </div>
    </div>
  );
}
