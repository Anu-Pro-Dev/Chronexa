"use client";

import React from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";
import ProgressBarChart from "../my-attendance/ProgressBarChart";
import { useAttendanceData } from "../my-attendance/AttendanceData";

function ScheduleCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { workSchedule, loading, error } = useAttendanceData();

  if (error) {
    return (
      <div className='flex justify-center items-center h-[200px] shadow-card rounded-[10px] bg-accent'>
        <p className='text-text-secondary'>No schedule data available</p>
      </div>
    );
  }

  if (loading || !workSchedule) {
    return (
      <div className='flex justify-center items-center h-[200px] shadow-card rounded-[10px] bg-accent'>
        <p className='text-text-secondary'>Loading...</p>
      </div>
    );
  }

  // The API returns data in an array, get the first item
  const scheduleData = Array.isArray(workSchedule) ? workSchedule[0] : workSchedule;

  if (!scheduleData) {
    return (
      <div className='flex justify-center items-center h-[200px] shadow-card rounded-[10px] bg-accent'>
        <p className='text-text-secondary'>No schedule data available</p>
      </div>
    );
  }

  return (
    <div className="shadow-card rounded-[10px] bg-accent p-5">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg text-text-primary font-bold">{t?.schedule}</h5>
        <Link href="/scheduling/weekly-schedule/organization-schedule" className="text-primary text-sm font-medium">
          {translations?.buttons?.show_all}
        </Link>
      </div>

      {/* Display Raw API Response Data */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Monthly Expected</p>
            <p className="text-xl font-bold text-text-primary">{scheduleData.TotalMonthlyExpectedWrkHrs}</p>
          </div>
          
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Working Days</p>
            <p className="text-xl font-bold text-text-primary">{scheduleData.TotalWorkingDays}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Worked Hours</p>
            <p className="text-xl font-bold text-green-600">{scheduleData.TotalWorkedHrs}</p>
          </div>
          
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Pending Hours</p>
            <p className="text-xl font-bold text-orange-600">{scheduleData.PendingWorkHrs}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Extra Hours</p>
            <p className="text-xl font-bold text-blue-600">{scheduleData.TotalExtraHrs}</p>
          </div>
          
          <div className="bg-background p-3 rounded-lg">
            <p className="text-xs text-text-secondary mb-1">Completion</p>
            <p className="text-xl font-bold text-text-primary">{scheduleData.WorkCompletionPercent}%</p>
          </div>
        </div>

        <div className="bg-background p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-text-secondary">Schedule</span>
            <span className="text-sm font-medium">{scheduleData.SchCode?.trim()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">Day Required Hours</span>
            <span className="text-sm font-medium">{scheduleData.DayReqdHrs}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleCard;