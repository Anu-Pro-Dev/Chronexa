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
}
  from "@/src/icons/icons";
import { useLanguage } from "@/src/providers/LanguageProvider";
import React, { useEffect, useState } from "react";
import { useAuthGuard } from "@/src/hooks/useAuthGuard";
import CurrentDate from "@/src/components/ui/currentdate";
import { InlineLoading } from "@/src/app/loading";

export default function Dashboard() {
  const { modules } = useLanguage();
  const { userInfo } = useAuthGuard();
  const [LeaveAndAttendanceElements, SetLeaveAndAttendance] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const shouldShowPunchButton = userInfo?.isWebPunch === true;
  
  useEffect(() => {
    const loadData = () => {
      SetLeaveAndAttendance([
        {
          label: "Working Days",
          icon: <WorkingDaysIcon />,
          value: "212",
        },
        {
          label: "Total leaves",
          icon: <TotalLeavesIcon />,
          value: "09",
        },
        {
          label: "Leaves Taken",
          icon: <LeaveTakenIcon />,
          value: "06",
        },
        {
          label: "Leaves Absent",
          icon: <AbsentIcon />,
          value: "03",
        },
        {
          label: "Approved leaves",
          icon: <ApprovedIcon />,
          value: "02",
        },
        {
          label: "Pending leaves",
          icon: <PendingIcon />,
          value: "01",
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

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
            {shouldShowPunchButton && (
              <PunchButton />
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <InlineLoading message="Loading attendance data..." />
      ) : (
        <MyAttendancePage />
      )}
    </div>
  );
}

