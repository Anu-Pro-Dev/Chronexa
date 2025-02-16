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
      <div>
        <div className="flex flex-col">
          <div>
            <div className="flex items-center justify-between">
              <h5 className="text-lg text-text-primary font-bold">Schedule</h5>   
              <Link href="/scheduling"  className="text-primary text-sm font-medium"> Show all </Link>
            </div>
          </div>
          <p className="text-sm text-text-secondary font-semibold">
            Monthly working hours can be viewed here
          </p>
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

      {/* <MonthlyRoasterTable month={months[parseInt(selectedMonth)]} /> */}
    </div>
  );
}

export default ScheduleCard;
