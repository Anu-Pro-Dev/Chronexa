"use client";
import React, { useState } from "react";
import Link from "next/link";
import ProgressBarChart from "@/components/ui/ProgressBarChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonthlyRoasterTable from "./MonthlyRoasterTable";

function ScheduleCard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="shadow-card rounded-[10px] bg-white p-6">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col gap-2">
          <h5 className="text-lg text-text-primary font-bold">Schedule</h5>
          <p className="text-sm text-text-secondary font-semibold">
            Monthly working hours can be viewed here
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link
            href="/scheduling"
            className="text-primary text-sm font-medium flex items-center justify-center gap-1"
          >
            Show all
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <ProgressBarChart
          totalHours={206}
          workedHours={140}
          overtimeHours={32}
          pendingHours={12}
          barCount={50}
        />
      </div>

      <MonthlyRoasterTable month={months[parseInt(selectedMonth)]} />
    </div>
  );
}

export default ScheduleCard;
