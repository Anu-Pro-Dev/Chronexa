"use client";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useSelectedDate } from "@/src/store/useSelectedDate";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";

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
  const mountedRef = useRef(false);
  const didInit = useRef(false);
  const prevDateRef = useRef<string>("");

  useEffect(() => {
    if (!userInfo?.roleId) return;
    if (didInit.current) return;

    didInit.current = true;
    mountedRef.current = true;

    setRole(userInfo.roleId);

    return () => {
      mountedRef.current = false;
    };
  }, [userInfo?.roleId, setRole]);

  const getCacheKey = () => {
    const formattedDate = formatLocalDate(selectedDate);
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    return `date-${formattedDate}`;
  };

  useEffect(() => {
    if (!mountedRef.current) return;

    const cacheKey = getCacheKey();
    const cachedData = teamAttendanceCache[cacheKey];

    if (cachedData && cachedData.length > 0) {
      const apiData = cachedData[0];
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
  }, [teamAttendanceCache, selectedDate]);

  useEffect(() => {
    if (!didInit.current || !mountedRef.current) return;

    const formattedDate = formatLocalDate(selectedDate);
    
    if (prevDateRef.current === formattedDate) return;
    
    prevDateRef.current = formattedDate;

    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    fetchTeamAttendance(formattedDate, month, year);
  }, [selectedDate, fetchTeamAttendance]);

  const refetch = useCallback(async () => {
    if (!mountedRef.current) return;

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