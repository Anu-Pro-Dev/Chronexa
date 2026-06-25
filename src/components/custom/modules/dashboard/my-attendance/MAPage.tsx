"use client";
import React, { Suspense, useEffect, useState } from "react";
import { AttendanceDataProvider } from "../my-attendance/AttendanceData";
import LeaveCard from "./LeaveCard";
import LeaveAnalyticsCard from "./LeaveAnalyticsCard";
import ViolationsCard from "./ViolationsCard";
import WorkTrendsCard from "./WorkTrendsCard";
import WeeklyReportCard from "./WeeklyReportCard";
import ScheduleCard from "./ScheduleCard";
import InsightsCard from "./InsightsCard";
import { InlineLoading } from "@/src/app/loading";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import PunchStatusWidget from "./PunchStatusWidget";
import { useNotificationSettings } from "@/src/components/custom/common/notification-settings";
import { getTodayStatus } from "@/src/lib/apiHandler";
import { usePunch } from "@/src/providers/PunchProvider";

interface TodayStatusData {
  has_schedule: boolean;
  is_open_shift: boolean;
  schedule_source: string;
  day_type: "working_day" | "off_day" | "holiday";
  schedule_info?: {
    schedule_id: number;
    schedule_code: string;
    in_time: string;
    out_time: string;
    flexible_minutes: number;
    grace_in_minutes: number;
    grace_out_minutes: number;
    is_night_shift: boolean;
    is_ramadan_schedule: boolean;
    required_work_hours: string;
    schedule_color: string;
    calculate_worked_hours: boolean;
    default_overtime: boolean;
    actual_in_time?: string;
    actual_out_time?: string;
    location?: {
      location_id: number;
      location_name_eng: string;
      location_name_arb: string;
      city: string;
      geolocation: string;
      radius: number;
    };
  };
}

function PunchStatusSection() {
  const { userInfo } = useAuthGuard();
  const notificationSettings = useNotificationSettings();
  const [todayStatus, setTodayStatus] = useState<TodayStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      
      if (newTime.getHours() === 20 && newTime.getMinutes() === 0) {
        fetchTodayStatusData();
      }
    }, 60 * 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const fetchTodayStatusData = async () => {
    try {
      setLoading(true);
      const response = await getTodayStatus();
      
      if (response.success && response.data) {
        setTodayStatus(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch today's status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatusData();

    const interval = setInterval(() => {
      if (!document.hidden) fetchTodayStatusData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const parseDateTime = (dateTimeString: string): Date => {
    if (dateTimeString.includes('T') || dateTimeString.includes('Z')) {
      return new Date(dateTimeString.replace('Z', ''));
    }
    const [hours, minutes, seconds] = dateTimeString.split(':').map(Number);
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes || 0,
      seconds || 0
    );
  };

  const calculateExpectedPunchOut = (actualInTime: string, requiredWorkHours: string): Date => {
    const punchInDate = parseDateTime(actualInTime);
    const [hours, minutes, seconds] = requiredWorkHours.split(':').map(Number);
    const workHoursInMs = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
    return new Date(punchInDate.getTime() + workHoursInMs);
  };

  if (loading) {
    return null;
  }

  if (!notificationSettings.enabled) {
    return null;
  }

  if (!todayStatus?.has_schedule || todayStatus.day_type !== "working_day") {
    return null;
  }

  const now = currentTime;
  const currentHour = now.getHours();
  const isPast8PM = currentHour >= 20;

  if (isPast8PM) {
    return null;
  }

  if (todayStatus.schedule_info?.actual_out_time) {
    if (!todayStatus.schedule_info?.actual_in_time) {
      return (
        <div className="shadow-card rounded-[10px] bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-orange-200/50">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                You punched out but forgot to punch in!
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Punch out time: {parseDateTime(todayStatus.schedule_info.actual_out_time).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <PunchStatusWidget
        todayStatus={todayStatus}
        enableNotifications={notificationSettings.enabled}
        notificationMinutes={notificationSettings.notificationTimes}
        enableBrowserNotifications={notificationSettings.browserNotifications}
        enableSound={notificationSettings.soundEnabled}
      />
    );
  }

  if (todayStatus.schedule_info?.actual_in_time) {
    const actualInTime = todayStatus.schedule_info.actual_in_time;
    const requiredWorkHours = todayStatus.schedule_info.required_work_hours;
    
    const expectedPunchOut = calculateExpectedPunchOut(actualInTime, requiredWorkHours);
    
    const timeDiffMs = now.getTime() - expectedPunchOut.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

    if (timeDiffHours >= 2) {
      return (
        <div className="shadow-card rounded-[10px] bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-400 to-rose-500 p-2.5 rounded-xl shadow-lg shadow-red-200/50">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                You missed to punch out!
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Expected punch out was at {expectedPunchOut.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}. Please punch out now.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <PunchStatusWidget
        todayStatus={todayStatus}
        enableNotifications={notificationSettings.enabled}
        notificationMinutes={notificationSettings.notificationTimes}
        enableBrowserNotifications={notificationSettings.browserNotifications}
        enableSound={notificationSettings.soundEnabled}
      />
    );
  }

  const scheduleInTime = todayStatus.schedule_info?.in_time;
  if (!scheduleInTime) return null;

  const flexibleMinutes = todayStatus.schedule_info?.flexible_minutes || 0;
  
  let scheduledInTime: Date;
  
  if (scheduleInTime.includes('T') || scheduleInTime.includes('Z')) {
    const tempDate = new Date(scheduleInTime.replace('Z', ''));
    scheduledInTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      tempDate.getHours(),
      tempDate.getMinutes(),
      tempDate.getSeconds()
    );
  } else {
    const [hours, minutes, seconds] = scheduleInTime.split(':').map(Number);
    scheduledInTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes || 0,
      seconds || 0
    );
  }
  
  const oneHourBefore = new Date(scheduledInTime.getTime() - 60 * 60 * 1000);
  const flexibleEnd = new Date(scheduledInTime.getTime() + flexibleMinutes * 60 * 1000);
  
  const isWithinFlexibleWindow = now >= oneHourBefore && now <= flexibleEnd;
  const hasMissedPunchIn = now > flexibleEnd;
  
  if (now < oneHourBefore) {
    return null;
  }
  
  if (hasMissedPunchIn) {
    return (
      <div className="shadow-card rounded-[10px] bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-400 to-rose-500 p-2.5 rounded-xl shadow-lg shadow-red-200/50">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              You missed to punch in for today!
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Punch in window was until {flexibleEnd.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isWithinFlexibleWindow) {
    const minutesUntilEnd = Math.floor((flexibleEnd.getTime() - now.getTime()) / (1000 * 60));
    
    return (
      <div className="shadow-card rounded-[10px] bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-yellow-200/50">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              Don't forget to punch in!
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {minutesUntilEnd > 0 
                ? `Punch in window closes in ${minutesUntilEnd} minute${minutesUntilEnd !== 1 ? 's' : ''} (by ${flexibleEnd.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })})`
                : `Punch in now! Window closes at ${flexibleEnd.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}`
              }
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

function MyAttendancePage() {
  const { userInfo } = useAuthGuard();
  const { isPunchedIn, punchInTime } = usePunch();

  return (
    <AttendanceDataProvider>
      <Suspense fallback={<InlineLoading message="Loading dashboard..." />}>
        <div className="flex flex-col gap-4">
          {/* Top decorative banner */}
          <div className="rounded-[12px] shadow-card p-5 text-white" style={{ background: "linear-gradient(135deg, #0078D4 0%, #00BCD4 100%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Welcome back,</p>
                <h2 className="text-2xl font-bold mt-0.5">{userInfo?.employeename?.firsteng || userInfo?.employeename?.firstarb || "Employee"}</h2>
                <p className="text-xs opacity-75 mt-1">Here&apos;s your attendance overview for today</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20 min-w-[90px]">
                {isPunchedIn && punchInTime ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Check In</p>
                    <p className="text-xl font-bold mt-0.5">{punchInTime}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                      {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Punch status section */}
          <PunchStatusSection />

          {/* Leave / Permission section with gradient accent header */}
          <div className="bg-accent rounded-[10px] shadow-card overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <div className="flex items-center gap-2.5">
                <h5 className="text-lg text-text-primary font-bold">Leave & Permission</h5>
              </div>
            </div>
            <LeaveCard />
          </div>

          {/* Two-column grid for Analytics + Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <LeaveAnalyticsCard />
            </div>
            <div className="flex flex-col">
              <ScheduleCard />
            </div>
          </div>

          {/* Discrepancies section with gradient accent header */}
          <ViolationsCard />

          {/* Work Trends - full width */}
          <WorkTrendsCard />

          {/* Last week report table with month-to-date export */}
          <WeeklyReportCard />
        </div>
      </Suspense>
    </AttendanceDataProvider>
  );
}

export default MyAttendancePage;