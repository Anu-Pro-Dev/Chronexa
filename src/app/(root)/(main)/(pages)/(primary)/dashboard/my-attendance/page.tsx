"use client";
import MyAttendancePage from "@/src/components/custom/modules/dashboard/my-attendance/MAPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import { useLanguage } from "@/src/providers/LanguageProvider";
import React, { useEffect, useRef } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { InlineLoading } from "@/src/app/loading";

import { useDashboardStore } from "@/src/store/useDashboardStore";

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo, userRole } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

  const setRole = useDashboardStore((s) => s.setRole);
  const fetchDashboardData = useDashboardStore((s) => s.fetchDashboardData);
  const loadingDashboard = useDashboardStore((s) => s.loadingDashboard);

  const didInit = useRef(false);

  useEffect(() => {
    if (!userInfo) return;
    if (didInit.current) return;

    didInit.current = true;

    const roleId = userInfo.roleId ?? userInfo.role_id ?? (userRole ? Number(userRole) : null);
    if (roleId) {
      setRole(roleId);
    }
    fetchDashboardData();
  }, [userInfo, userRole, setRole, fetchDashboardData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
        <div className="flex gap-4">
          <CurrentDate interactive />
          <div className="h-9">
            {shouldShowPunchButton && <PunchButton />}
          </div>
        </div>
      </div>

      {loadingDashboard ? (
        <InlineLoading message="Loading attendance data..." />
      ) : (
        <MyAttendancePage />
      )}
    </div>
  );
}
