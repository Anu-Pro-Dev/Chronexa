"use client";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

interface TeamAttendanceDetails {
  Workforce: number;
  ProjectManagers: number;
  CheckInCount: number;
  CheckOutCount: number;
  MissedCheckIn: number;
  MissedCheckOut: number;
  MissingHours: string;
  Overtime: string;
  ApprovedLeaves: number;
  AbsentCount: number;
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

const pad = (n: number) => (n < 10 ? `0${n}` : n);
const formatLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

interface ProviderProps {
  children: React.ReactNode;
}

export const TeamAttendanceDataProvider = ({ children }: ProviderProps) => {
  const { userInfo } = useAuthGuard();
  const selectedDate = useSelectedDate((s) => s.date);

  const setRole = useDashboardStore((s) => s.setRole);
  const fetchTeamAttendance = useDashboardStore((s) => s.fetchTeamAttendance);
  const teamAttendanceCache = useDashboardStore((s) => s.teamAttendanceCache);
  const loadingTeamAttendance = useDashboardStore((s) => s.loadingTeamAttendance);
  const errorTeamDashboard = useDashboardStore((s) => s.errorTeamDashboard);

  const [teamAttendanceDetails, setTeamAttendanceDetails] = useState<TeamAttendanceDetails | null>(null);

  const prevDateRef = useRef<string>("");

  useEffect(() => {
    if (userInfo?.roleId) {
      setRole(userInfo.roleId);
    }
  }, [userInfo?.roleId, setRole]);

  useEffect(() => {
    const formattedDate = formatLocalDate(selectedDate);
    
    if (prevDateRef.current === formattedDate) {
      return;
    }

    prevDateRef.current = formattedDate;

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    fetchTeamAttendance(formattedDate, month, year);
  }, [selectedDate, fetchTeamAttendance]);

  useEffect(() => {
    const cacheKey = `date-${formatLocalDate(selectedDate)}`;
    const cachedData = teamAttendanceCache[cacheKey];

    if (cachedData && cachedData.length > 0) {
      const apiData = cachedData[0];

      const mapped = {
        Workforce: Number(apiData.WorkForce) || 0,
        ProjectManagers: Number(apiData.ProjectManagers) || 0,
        CheckInCount: Number(apiData.CheckedIn) || 0,
        CheckOutCount: Number(apiData.CheckedOut) || 0,
        MissedCheckIn: Number(apiData.MissedCheckIn) || 0,
        MissedCheckOut: Number(apiData.MissedCheckOut) || 0,
        MissingHours: apiData.MissedHrs || "00:00",
        Overtime: apiData.OvertimeHrs || "00:00",
        ApprovedLeaves: Number(apiData.ApprovedLeaves) || 0,
        AbsentCount: Number(apiData.AbsentCount) || 0,
      };


      setTeamAttendanceDetails(mapped);
    } else {
      setTeamAttendanceDetails(null);
    }
  }, [teamAttendanceCache, selectedDate]);

  const refetch = useCallback(async () => {
    const formattedDate = formatLocalDate(selectedDate);
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    await fetchTeamAttendance(formattedDate, month, year);
  }, [selectedDate, fetchTeamAttendance]);

  return (
    <TeamAttendanceDataContext.Provider
      value={{
        teamAttendanceDetails,
        loading: loadingTeamAttendance,
        error: errorTeamDashboard,
        refetch,
      }}
    >
      {children}
    </TeamAttendanceDataContext.Provider>
  );
};