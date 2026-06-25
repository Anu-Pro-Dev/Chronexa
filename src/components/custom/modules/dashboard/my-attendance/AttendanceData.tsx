"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useSelectedDate } from "@/src/store/useSelectedDate";

interface AttendanceDataContextType {
  attendanceDetails: any | null;
  workSchedule: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AttendanceDataContext = createContext<AttendanceDataContextType | undefined>(undefined);

export const useAttendanceData = () => {
  const context = useContext(AttendanceDataContext);
  if (!context) {
    throw new Error("useAttendanceData must be used within AttendanceDataProvider");
  }
  return context;
};

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export const AttendanceDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { date } = useSelectedDate();
  const selectedDate = toLocalDateStr(date);

  const {
    attendanceDetails,
    workSchedule,
    fetchDashboardData,
    loadingDashboard,
    errorDashboard,
  } = useDashboardStore();

  const [localLoading, setLocalLoading] = useState(loadingDashboard);
  const [localError, setLocalError] = useState<string | null>(errorDashboard);

  useEffect(() => {
    setLocalLoading(loadingDashboard);
    if (!loadingDashboard) {
      setLocalError(errorDashboard);
    }
  }, [loadingDashboard, errorDashboard]);

  const refetch = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      await fetchDashboardData(selectedDate);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to fetch dashboard data");
    } finally {
      setLocalLoading(false);
    }
  }, [fetchDashboardData, selectedDate]);

  const prevDateRef = useRef(selectedDate);

  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      prevDateRef.current = selectedDate;
      refetch();
    } else if (!attendanceDetails && !loadingDashboard) {
      refetch();
    }
  }, [selectedDate, refetch, attendanceDetails, loadingDashboard]);

  return (
    <AttendanceDataContext.Provider
      value={{
        attendanceDetails,
        workSchedule,
        loading: localLoading,
        error: localError,
        refetch,
      }}
    >
      {children}
    </AttendanceDataContext.Provider>
  );
};
