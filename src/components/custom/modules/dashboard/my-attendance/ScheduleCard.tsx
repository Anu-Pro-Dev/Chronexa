"use client";

import React, { useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";
import ProgressBarChart from "../my-attendance/ProgressBarChart";
import { useAttendanceData } from "../my-attendance/AttendanceData";

const timeStringToHours = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  
  const cleanStr = timeStr.trim();
  const parts = cleanStr.split(':');
  
  if (parts.length < 2) return 0;
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  return hours + (minutes / 60);
};

function ScheduleCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { workSchedule, loading } = useAttendanceData();

  const { totalHours, workedHours, overtimeHours, pendingHours } = useMemo(() => {
    if (!workSchedule) {
      return { totalHours: 0, workedHours: 0, overtimeHours: 0, pendingHours: 0 };
    }

    const totalHours = timeStringToHours(workSchedule.TotalMonthlyExpectedWrkHrs as string);
    
    const workedHours = timeStringToHours(workSchedule.TotalWorkedHrs as string);
    
    const pendingHours = timeStringToHours(workSchedule.PendingWorkHrs as string);
    
    const overtimeHours = Math.max(0, workedHours - totalHours);

    return { 
      totalHours, 
      workedHours: Math.min(workedHours, totalHours),
      overtimeHours, 
      pendingHours 
    };
  }, [workSchedule]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-[200px] shadow-card rounded-[10px] bg-accent'>
        <p className='text-text-secondary'>Loading...</p>
      </div>
    );
  }

  if (!workSchedule) {
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
        <Link href="/scheduling/monthly-schedule" className="text-primary text-sm font-medium">
          {translations?.buttons?.show_all}
        </Link>
      </div>

      <ProgressBarChart
        totalHours={totalHours}
        workedHours={workedHours}
        overtimeHours={overtimeHours}
        pendingHours={pendingHours}
      />
    </div>
  );
}

export default ScheduleCard;