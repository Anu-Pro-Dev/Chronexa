"use client";
import React, { Suspense, useEffect, useState } from "react";
import { AttendanceDataProvider } from "../my-attendance/AttendanceData";
import LeaveCard from "./LeaveCard";
import LeaveAnalyticsCard from "./LeaveAnalyticsCard";
import ViolationsCard from "./ViolationsCard";
import WorkTrendsCard from "./WorkTrendsCard";
import ScheduleCard from "./ScheduleCard";
import InsightsCard from "./InsightsCard";
import { InlineLoading } from "@/src/app/loading";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import PunchStatusWidget from "./PunchStatusWidget";
import { useNotificationSettings } from "@/src/components/custom/common/notification-settings";
import { getTodayStatus } from "@/src/lib/apiHandler";

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

    const interval = setInterval(fetchTodayStatusData, 5 * 60 * 1000);
    
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
    return (
      <div className="animate-pulse">
        <div className="shadow-card rounded-[10px] bg-gray-200 dark:bg-gray-700 h-48"></div>
      </div>
    );
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
        <div className="shadow-card rounded-[10px] bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-800/30 p-2 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="shadow-card rounded-[10px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="shadow-card rounded-[10px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="shadow-card rounded-[10px] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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

  return (
    <AttendanceDataProvider>
      <Suspense fallback={<InlineLoading message="Loading dashboard..." />}>
        <div className="space-y-4">
          {/* Mobile / Tablet */}
          <div className="3xl:hidden space-y-4">
            <div>
              <PunchStatusSection />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="w-full md:max-w-[calc(100vh/3*4)] h-auto flex flex-col gap-4">
                <LeaveCard />
                <LeaveAnalyticsCard />
              </div>
              <div className="w-full md:max-w-[calc(100vh/1*4)] h-auto flex flex-col gap-4">
                <ViolationsCard />
                <ScheduleCard />
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <div className="w-full h-auto flex flex-col gap-4">
                <WorkTrendsCard />
                <InsightsCard />
              </div>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden 3xl:block space-y-4">
            <div>
              <PunchStatusSection />
            </div>

            <div className="grid grid-cols-3 gap-4 auto-rows-fr">
              <div className="w-full min-h-full">
                <LeaveCard />
              </div>
              <div className="w-full min-h-full">
                <ViolationsCard />
              </div>
              <div className="w-full min-h-full flex flex-col gap-4">
                <ScheduleCard />
                <InsightsCard />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LeaveAnalyticsCard />
              <WorkTrendsCard />
            </div>
          </div>
        </div>
      </Suspense>
    </AttendanceDataProvider>
  );
}

export default MyAttendancePage;