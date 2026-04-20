"use client";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import TeamAttendancePage from "@/src/components/custom/modules/dashboard/team-attendance/TAPage";
import { InlineLoading } from "@/src/app/loading";
import { useDashboardStore } from "@/src/store/useDashboardStore";

export default function Page() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const setRole = useDashboardStore((s) => s.setRole);
  const fetchTeamAttendance = useDashboardStore((s) => s.fetchTeamAttendance);
  const fetchTeamLeaveAnalytics = useDashboardStore((s) => s.fetchTeamLeaveAnalyticsForYear);
  const fetchTeamViolations = useDashboardStore((s) => s.fetchTeamViolationAnalyticsForYear);
  
  const loadingTeamAttendance = useDashboardStore((s) => s.loadingTeamAttendance);
  const teamAttendanceCache = useDashboardStore((s) => s.teamAttendanceCache);

  const didInit = useRef(false);

  useEffect(() => {
    if (!userInfo?.roleId) return;
    if (didInit.current) return;

    didInit.current = true;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    setRole(userInfo.roleId);
    
    fetchTeamAttendance(undefined, currentMonth, currentYear);
    fetchTeamLeaveAnalytics(currentYear);
    fetchTeamViolations(currentYear);
  }, [userInfo?.roleId, setRole, fetchTeamAttendance, fetchTeamLeaveAnalytics, fetchTeamViolations]);

  const hasCachedData = Object.keys(teamAttendanceCache).length > 0;
  const isInitialLoading = loadingTeamAttendance && !hasCachedData;

  return (
    <div className="flex flex-col gap-4">
      <PowerHeader
        disableAdd
        disableDelete
        disableSearch
        items={modules?.dashboard.items}
      />
      
      {isInitialLoading ? (
        <InlineLoading message="Loading team attendance data..." />
      ) : (
        <div>
          <TeamAttendancePage />
        </div>
      )}
    </div>
  );
}