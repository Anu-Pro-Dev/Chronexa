"use client";

import React, { useMemo } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import Link from "next/link";
import ProgressBarChart from "../my-attendance/ProgressBarChart";
import { useAttendanceData } from "../my-attendance/AttendanceData";

function ScheduleCard() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { workSchedule, loading } = useAttendanceData();

  // Compute chart values for current month
  const { totalHours, workedHours, overtimeHours, pendingHours } = useMemo(() => {
    if (!workSchedule) {
      return { totalHours: 0, workedHours: 0, overtimeHours: 0, pendingHours: 0 };
    }

    const totalHours = parseFloat(workSchedule.TotalExpectingWrkHrs as any) || 0;

    // All hours are considered worked, no absent or late
    const workedHours = totalHours;
    const overtimeHours = 0;
    const pendingHours = 0;

    return { totalHours, workedHours, overtimeHours, pendingHours };
  }, [workSchedule]);

  if (loading) {
    return <div className="shadow-card rounded-[10px] bg-accent p-5">Loading...</div>;
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
