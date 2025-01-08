"use client";
import React from "react";
import Link from "next/link";
import ProgressBarChart from "@/components/ui/ProgressBarChart";

function ScheduleCard() {
  return (
    <div className="shadow-card rounded-[10px] bg-white p-6">
      <div className="flex flex-row justify-between">
        <h5 className="text-lg text-text-primary font-bold">Schedule</h5>
        <Link
          href="/scheduling"
          className="text-primary text-sm font-medium flex items-center justify-center gap-1"
        >
          Show all
        </Link>
      </div>
      <p className="text-sm text-text-secondary font-semibold">
        Monthly working hours can be viewed here
      </p>
      <ProgressBarChart
        totalHours={206}
        workedHours={140}
        overtimeHours={32}
        pendingHours={12}
        barCount={50}
      />
    </div>
  );
}

export default ScheduleCard;
