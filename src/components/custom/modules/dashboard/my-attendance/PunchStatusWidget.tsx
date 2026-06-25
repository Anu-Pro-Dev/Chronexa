"use client";
import React, { useEffect, useState } from "react";
import { PunchInIcon, PunchOutIcon } from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { usePunchNotifications } from "@/src/hooks/usePunchNotifications";
import { ToastContainer } from "./ToastNotification";

interface ScheduleInfo {
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
}

interface TodayStatusData {
  has_schedule: boolean;
  is_open_shift: boolean;
  schedule_source: string;
  day_type: "working_day" | "off_day" | "holiday";
  schedule_info?: ScheduleInfo;
}

interface PunchStatusWidgetProps {
  todayStatus: TodayStatusData;
  /** Enable notifications (default: true) */
  enableNotifications?: boolean;
  /** Minutes before punch-out to notify (default: [30, 15, 5]) */
  notificationMinutes?: number[];
  /** Enable browser notifications (default: true) */
  enableBrowserNotifications?: boolean;
  /** Enable sound notifications (default: true) */
  enableSound?: boolean;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  duration?: number;
}

function PunchStatusWidget({
  todayStatus,
  enableNotifications = true,
  notificationMinutes = [30, 15, 5],
  enableBrowserNotifications = true,
  enableSound = true,
}: PunchStatusWidgetProps) {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  const parseWorkHours = (workHours: string): number => {
    const [hours, minutes, seconds] = workHours.split(':').map(Number);
    return hours + (minutes / 60) + (seconds / 3600);
  };

  const scheduleHours = todayStatus.schedule_info?.required_work_hours
    ? parseWorkHours(todayStatus.schedule_info.required_work_hours)
    : 9;

  const lastTransaction = todayStatus.schedule_info?.actual_in_time
    ? {
      id: todayStatus.schedule_info.schedule_id,
      date: todayStatus.schedule_info.actual_in_time,
      type: "IN" as const,
    }
    : undefined;

  const { notifications, hasPermission } = usePunchNotifications(
    lastTransaction,
    scheduleHours,
    {
      minutesBefore: notificationMinutes,
      enableBrowserNotifications: enableNotifications && enableBrowserNotifications,
      enableSound: enableNotifications && enableSound,
      hasPunchedOut: !!todayStatus.schedule_info?.actual_out_time, 
    }
  );

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];

      let type: "info" | "warning" | "success" | "error" = "info";
      let title = "Punch Out Reminder";
      let message = latestNotification;

      if (latestNotification.includes("overtime")) {
        type = "error";
        title = "Missed Punch Out! ⏰";
        message = "You missed your punch out time. Please punch out now.";
      } else if (latestNotification.includes("5 Minutes") || latestNotification.includes("ended")) {
        type = "warning";
        title = "Time to Punch Out! ⏰";
      } else if (latestNotification.includes("15 Minutes")) {
        type = "warning";
        title = "15 Minutes Remaining ⏱️";
      } else {
        type = "info";
        title = "Shift Update 📋";
      }

      const newToast: ToastNotification = {
        id: `notification-${Date.now()}`,
        title,
        message,
        type,
        duration: type === "error" ? undefined : 10000,
      };

      setToastNotifications((prev) => [...prev, newToast]);
    }
  }, [notifications]);

  const dismissToast = (id: string) => {
    setToastNotifications((prev) => prev.filter((toast) => toast.id !== id));
  };

  const shouldShowWidget = () => {
    if (!todayStatus.has_schedule || todayStatus.day_type !== "working_day") {
      return false;
    }

    if (!todayStatus.schedule_info?.actual_in_time) {
      return false;
    }

    const punchInDate = parseLocalDateTime(todayStatus.schedule_info.actual_in_time);
    const today = new Date();

    const isToday =
      punchInDate.getDate() === today.getDate() &&
      punchInDate.getMonth() === today.getMonth() &&
      punchInDate.getFullYear() === today.getFullYear();

    return isToday;
  };

  const parseLocalDateTime = (dateString: string): Date => {
    const localDateString = dateString.replace('Z', '');
    return new Date(localDateString);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const calculateExpectedPunchOut = () => {
    if (!todayStatus.schedule_info?.actual_in_time) return null;

    const punchInDate = parseLocalDateTime(todayStatus.schedule_info.actual_in_time);
    const expectedPunchOut = new Date(
      punchInDate.getTime() + scheduleHours * 60 * 60 * 1000
    );
    return expectedPunchOut;
  };

  const getTimeRemaining = () => {
    const expectedPunchOut = calculateExpectedPunchOut();
    if (!expectedPunchOut) return null;

    const diffMs = expectedPunchOut.getTime() - currentTime.getTime();
    const minutesRemaining = Math.floor(diffMs / (1000 * 60));

    if (minutesRemaining < 0) {
      const overtimeMinutes = Math.abs(minutesRemaining);
      const hours = Math.floor(overtimeMinutes / 60);
      const mins = overtimeMinutes % 60;
      return {
        text: hours > 0 ? `${hours}h ${mins}m ${t?.overtime || "overtime"}` : `${mins}m ${t?.overtime || "overtime"}`,
        isOvertime: true,
      };
    }

    const hours = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;
    return {
      text: hours > 0 ? `${hours}h ${mins}m ${t?.remaining || "remaining"}` : `${mins}m ${t?.remaining || "remaining"}`,
      isOvertime: false,
    };
  };

  const getScheduleTypeLabel = () => {
    const scheduleInfo = todayStatus.schedule_info;
    if (!scheduleInfo) return "";
    return scheduleInfo.schedule_code.trim();
  };

  if (!isClient || !shouldShowWidget()) {
    return null;
  }

  const punchInDate = parseLocalDateTime(todayStatus.schedule_info!.actual_in_time!);
  const punchInTime = formatTime(punchInDate);

  const hasPunchedOut = !!todayStatus.schedule_info?.actual_out_time;
  const punchOutDate = hasPunchedOut
    ? parseLocalDateTime(todayStatus.schedule_info!.actual_out_time!)
    : null;
  const punchOutTime = punchOutDate ? formatTime(punchOutDate) : null;

  const expectedPunchOut = calculateExpectedPunchOut();
  const expectedPunchOutTime = expectedPunchOut ? formatTime(expectedPunchOut) : null;
  const timeRemaining = getTimeRemaining();

  const workedHours = hasPunchedOut && punchOutDate
    ? (punchOutDate.getTime() - punchInDate.getTime()) / (1000 * 60 * 60)
    : null;

  const progress = hasPunchedOut && punchOutDate
    ? Math.min(100, ((punchOutDate.getTime() - punchInDate.getTime()) / (scheduleHours * 60 * 60 * 1000)) * 100)
    : Math.min(
      100,
      ((currentTime.getTime() - punchInDate.getTime()) /
        (scheduleHours * 60 * 60 * 1000)) *
      100
    );
  const scheduleLabel = getScheduleTypeLabel();

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer notifications={toastNotifications} onDismiss={dismissToast} />

      <div className="space-y-3">
        {/* Main Widget */}
        <div className="shadow-card rounded-[10px] bg-accent border border-border p-5">
          {/* Notification Permission Banner */}
          {enableNotifications && enableBrowserNotifications && !hasPermission && (
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-2 rounded-lg shadow-md shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-blue-900 dark:text-blue-100 font-semibold">
                    {t?.enable_notifications || "Enable notifications"}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-0.5">
                    {t?.notification_help ||
                      "Get reminded when it's time to punch out"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Punch In/Out Time Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-2.5 rounded-xl shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
                <PunchInIcon color="white" width="22" height="22" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {t?.punch_in || "Punch In"}
                </p>
                <p className="text-xl font-bold text-text-primary mt-0.5">{punchInTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shadow-lg ${
                hasPunchedOut
                  ? "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-200/50 dark:shadow-blue-900/30"
                  : timeRemaining?.isOvertime
                    ? "bg-gradient-to-br from-red-400 to-rose-500 shadow-red-200/50 dark:shadow-red-900/30"
                    : "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-blue-200/50 dark:shadow-blue-900/30"
              }`}>
                <PunchOutIcon color="white" width="22" height="22" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {hasPunchedOut
                    ? (t?.punch_out || "Punch Out")
                    : (t?.expected_punch_out || "Expected Punch Out")
                  }
                </p>
                <p className={`text-xl font-bold mt-0.5 ${
                  hasPunchedOut
                    ? "text-text-primary"
                    : timeRemaining?.isOvertime
                      ? "text-red-600 dark:text-red-400"
                      : "text-[#0078D4] dark:text-[#00BCD4]"
                }`}>
                  {hasPunchedOut ? punchOutTime : expectedPunchOutTime}
                </p>
              </div>
            </div>
          </div>

          {/* Time Remaining / Completed Badge */}
          {!hasPunchedOut && timeRemaining && (
            <div className="mt-4 text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold ${
                  timeRemaining.isOvertime
                    ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-sm"
                    : "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeRemaining.text}
              </span>
            </div>
          )}

          {/* Shift Completed Badge */}
          {hasPunchedOut && workedHours !== null && punchOutDate && expectedPunchOut && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(() => {
                  const diffMs = expectedPunchOut.getTime() - punchOutDate.getTime();
                  const diffMinutes = Math.round(diffMs / (1000 * 60));

                  if (diffMinutes > 0) {
                    return `${diffMinutes}m ${t?.remaining || "remaining"}`;
                  } else if (diffMinutes < 0) {
                    const overtimeMinutes = Math.abs(diffMinutes);
                    return `${overtimeMinutes}m ${t?.overtime || "overtime"}`;
                  } else {
                    return t?.on_time || "On time";
                  }
                })()}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
              <span className="font-medium">{hasPunchedOut ? (t?.shift_complete || "Shift Completed") : (t?.shift_progress || "Shift Progress")}</span>
              <span className="font-semibold">
                {hasPunchedOut && workedHours !== null
                  ? (() => {
                    const workedHoursInt = Math.floor(workedHours);
                    const workedMinutes = Math.round((workedHours - workedHoursInt) * 60);
                    return `${workedHoursInt}h ${workedMinutes}m ${t?.worked || "worked"}`;
                  })()
                  : `${scheduleHours.toFixed(1)} ${t?.hours || "hours"}`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, progress)}%`,
                  background: hasPunchedOut
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : timeRemaining?.isOvertime
                      ? 'linear-gradient(90deg, #EF4444, #F87171)'
                      : 'linear-gradient(90deg, #0078D4, #00BCD4)',
                }}
              />
            </div>
          </div>

          {/* Schedule Details */}
          <div className="mt-4 pt-3 border-t border-border">
            {scheduleLabel && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase"
                    style={{
                      background: `linear-gradient(135deg, ${todayStatus.schedule_info?.schedule_color}18, ${todayStatus.schedule_info?.schedule_color}08)`,
                      color: todayStatus.schedule_info?.schedule_color || '#3B82F6',
                      border: `1.5px solid ${todayStatus.schedule_info?.schedule_color}44`,
                      boxShadow: `0 0 12px ${todayStatus.schedule_info?.schedule_color}22`,
                    }}
                  >
                    {scheduleLabel}
                  </span>
                  {todayStatus.schedule_info?.location && (
                    <span className="text-xs text-text-secondary flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{todayStatus.schedule_info.location.location_name_eng}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-text-secondary bg-background px-2.5 py-1 rounded-lg">
                  <span>{t?.progress || "Progress"}: </span>
                  <span className="text-text-primary">{Math.min(100, progress).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PunchStatusWidget;