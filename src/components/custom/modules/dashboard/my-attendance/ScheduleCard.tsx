"use client";

import React, { useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";
import ProgressBarChart from "../my-attendance/ProgressBarChart";
import { useDashboardStore } from "@/src/store/useDashboardStore";

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
  
  const workSchedule = useDashboardStore((state) => state.workSchedule);
  const loadingDashboard = useDashboardStore((state) => state.loadingDashboard);
  const errorDashboard = useDashboardStore((state) => state.errorDashboard);

  const { totalHours, workedHours, overtimeHours, pendingHours } = useMemo(() => {
    if (!workSchedule) {
      return { totalHours: 0, workedHours: 0, overtimeHours: 0, pendingHours: 0 };
    }

    const totalHours = timeStringToHours(workSchedule.TotalMonthlyExpectedWrkHrs as string);
    
    const workedHours = timeStringToHours(workSchedule.TotalWorkedHrs as string);
    
    const pendingHours = timeStringToHours(workSchedule.PendingWorkHrs as string);
    
    const overtimeHours = timeStringToHours(workSchedule.OvertimeHrs as string);

    return { 
      totalHours, 
      workedHours,
      overtimeHours, 
      pendingHours 
    };
  }, [workSchedule]);

  if (errorDashboard) {
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