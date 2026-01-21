"use client";
import { cn } from "@/src/lib/utils";
import MyAttendancePage from "@/src/components/custom/modules/dashboard/my-attendance/MAPage";
import PowerHeader from "@/src/components/custom/power-comps/power-header";
import { PunchButton } from "@/src/components/custom/common/punch-button";
import {
  AbsentIcon,
  ApprovedIcon,
  LeaveTakenIcon,
  PendingIcon,
  TotalLeavesIcon,
  WorkingDaysIcon,
} from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import React, { useEffect, useState, useRef } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { InlineLoading } from "@/src/app/loading";

import { useDashboardStore } from "@/src/store/useDashboardStore";

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();

  const shouldShowPunchButton = userInfo?.isWebPunch === true;

  const setRole = useDashboardStore((s) => s.setRole);
  const fetchDashboardData = useDashboardStore((s) => s.fetchDashboardData);
  const loadingDashboard = useDashboardStore((s) => s.loadingDashboard);

  const [LeaveAndAttendanceElements, SetLeaveAndAttendance] = useState<any>([]);

  useEffect(() => {
    const loadStaticElements = () => {
      SetLeaveAndAttendance([
        { label: "Working Days", icon: <WorkingDaysIcon />, value: "212" },
        { label: "Total leaves", icon: <TotalLeavesIcon />, value: "09" },
        { label: "Leaves Taken", icon: <LeaveTakenIcon />, value: "06" },
        { label: "Leaves Absent", icon: <AbsentIcon />, value: "03" },
        { label: "Approved leaves", icon: <ApprovedIcon />, value: "02" },
        { label: "Pending leaves", icon: <PendingIcon />, value: "01" },
      ]);
    };

    loadStaticElements();
  }, []);

  const didInit = useRef(false);

  useEffect(() => {
    if (!userInfo?.roleId) return;
    if (didInit.current) return;

    didInit.current = true;

    setRole(userInfo.roleId);
    fetchDashboardData();       
  }, [userInfo?.roleId, setRole, fetchDashboardData]);

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
          <CurrentDate />
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
