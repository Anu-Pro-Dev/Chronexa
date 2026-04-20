"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAttendanceDetails, getWorkSchedule } from "@/src/lib/dashboardApiHandler";
import { useDashboardStore } from "@/src/store/useDashboardStore";

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

export const AttendanceDataProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    attendanceDetails,
    workSchedule,
    fetchDashboardData,
    loadingDashboard,
    errorDashboard,
  } = useDashboardStore();

  const [localLoading, setLocalLoading] = useState(loadingDashboard);
  const [localError, setLocalError] = useState<string | null>(errorDashboard);

  const refetch = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      await fetchDashboardData();
    } catch (err: any) {
      setLocalError(err?.message || "Failed to fetch dashboard data");
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!attendanceDetails && !workSchedule) {
      refetch();
    }
  }, []);

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
