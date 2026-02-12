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
        <div className="shadow-card rounded-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          {/* Notification Permission Banner */}
          {enableNotifications && enableBrowserNotifications && !hasPermission && (
            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <div>
                  <p className="text-blue-900 dark:text-blue-100 font-medium">
                    {t?.enable_notifications || "Enable notifications"}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                    {t?.notification_help ||
                      "Get reminded when it's time to punch out"}
                  </p>
                </div>
              </div>
            </div>
          )}


          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-success bg-opacity-10 p-2 rounded-lg">
                <PunchInIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {t?.punch_in || "Punch In"}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{punchInTime}</p>
              </div>
            </div>

            <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>

            <div className="flex items-center gap-3">
              <div className="bg-destructive bg-opacity-10 p-2 rounded-lg">
                <PunchOutIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {hasPunchedOut
                    ? (t?.punch_out || "Punch Out")
                    : (t?.expected_punch_out || "Expected Punch Out")
                  }
                </p>
                <p
                  className={`text-lg font-bold ${hasPunchedOut
                    ? "text-gray-900 dark:text-white"
                    : timeRemaining?.isOvertime
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                    }`}
                >
                  {hasPunchedOut ? punchOutTime : expectedPunchOutTime}
                </p>
              </div>
            </div>
          </div>

          {/* Time Remaining Badge */}
          {!hasPunchedOut && timeRemaining && (
            <div className="mt-3 text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${timeRemaining.isOvertime
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {timeRemaining.text}
              </span>
            </div>
          )}

          {/* Shift Completed Badge - shown when punched out */}
          {hasPunchedOut && workedHours !== null && punchOutDate && expectedPunchOut && (
            <div className="mt-3 text-center">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
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

          {/* Progress bar showing time progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{hasPunchedOut ? (t?.shift_complete || "Shift Completed") : (t?.shift_progress || "Shift Progress")}</span>
              <span>
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
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 bg-primary dark:bg-primary-100`}
                style={{
                  width: `${Math.min(100, progress)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="mt-1 pt-1">
            {/* Schedule Type Badge */}
            {scheduleLabel && (
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    backgroundColor: `${todayStatus.schedule_info?.schedule_color}15`,
                    color: todayStatus.schedule_info?.schedule_color || '#3B82F6',
                    borderLeft: `3px solid ${todayStatus.schedule_info?.schedule_color || '#3B82F6'}`
                  }}
                >
                  {scheduleLabel}
                </span>
                <div className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t?.progress || "Progress"}:
                  </span>
                  <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                    {Math.min(100, progress).toFixed(1)}%
                  </span>
                </div>
                {todayStatus.schedule_info?.location && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {todayStatus.schedule_info.location.location_name_eng}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PunchStatusWidget;