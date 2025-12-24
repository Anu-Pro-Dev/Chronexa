"use client";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { getTeamAttendanceDetails } from "@/src/lib/dashboardApiHandler";
import { useSelectedDate } from "@/src/store/useSelectedDate";

interface TeamAttendanceDetails {
  [key: string]: any;
}

interface TeamDashboardData {
  teamAttendanceDetails: TeamAttendanceDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const TeamAttendanceDataContext = createContext<TeamDashboardData | undefined>(undefined);

export const useTeamAttendanceData = () => {
  const context = useContext(TeamAttendanceDataContext);
  if (!context) throw new Error("useTeamAttendanceData must be used within TeamAttendanceDataProvider");
  return context;
};

// --- UTILITY: Local date formatting to avoid UTC shift ---
const pad = (n: number) => (n < 10 ? `0${n}` : n);
const formatLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

interface ProviderProps {
  children: React.ReactNode;
}

export const TeamAttendanceDataProvider = ({ children }: ProviderProps) => {
  const selectedDate = useSelectedDate((s) => s.date);
  const [teamAttendanceDetails, setTeamAttendanceDetails] = useState<TeamAttendanceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const fetchTeamDashboardData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        date: formatLocalDate(selectedDate),
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      };

      const res = await getTeamAttendanceDetails(params.date, params.month, params.year);

      if (!mountedRef.current) return;

      if (res?.success && res.data?.length > 0) {
        const apiData = res.data[0];
        setTeamAttendanceDetails({
          CheckInCount: apiData.CheckedIn || 0,
          CheckOutCount: apiData.CheckedOut || 0,
          MissedCheckIn: apiData.MissedCheckIn || 0,
          MissedCheckOut: apiData.MissedCheckOut || 0,
          MissingHours: apiData.MissedHrs || "0:00",
          Overtime: apiData.OvertimeHrs || "0:00",
          Workforce: apiData.WorkForce || 0,
          ProjectManagers: apiData.ProjectManagers || 0,
          ApprovedLeaves: apiData.ApprovedLeaves ?? 0,
          AbsentCount: apiData.AbsentCount || 0,
          TotalMissedIn: apiData.MissedCheckIn || 0,
          TotalMissedOut: apiData.MissedCheckOut || 0,
          MonthlyLate: apiData.MonthlyLate || 0,
          MonthlyEarly: apiData.MonthlyEarly || 0,
        });
      } else {
        setTeamAttendanceDetails(null);
      }
    } catch (err) {
      console.error("Error fetching team attendance:", err);
      setError("Failed to fetch team attendance data");
      setTeamAttendanceDetails(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTeamDashboardData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchTeamDashboardData]);

  return (
    <TeamAttendanceDataContext.Provider
      value={{
        teamAttendanceDetails,
        loading,
        error,
        refetch: fetchTeamDashboardData,
      }}
    >
      {children}
    </TeamAttendanceDataContext.Provider>
  );
};
