"use client";
import { cn } from "@/lib/utils";
import MyAttendancePage from "@/components/custom/dashboard-comps/my-attendance/MAPage";
import PowerHeader from "@/components/custom/power-comps/power-header";
import { PunchButton } from "@/components/custom/punch-button";
import { 
  AbsentIcon,
  ApprovedIcon,
  LeaveTakenIcon,
  PendingIcon,
  TotalLeavesIcon,
  WorkingDaysIcon,
}
from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import React, { useEffect, useState } from "react";
import CurrentDate from "@/components/ui/currentdate";

export default function Dashboard() {
  const { modules } = useLanguage();
  const [LeaveAndAttendanceElements, SetLeaveAndAttendance] = useState<any>([]);

  useEffect(() => {
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
    ])
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
        {/* <div className="absolute right-40 bottom-55">
          <CurrentDate />
        </div> */}
        <div className="flex gap-5">
          <CurrentDate />
          <PunchButton />
        </div>
      </div>
      <MyAttendancePage />
    </div>
  );
}

