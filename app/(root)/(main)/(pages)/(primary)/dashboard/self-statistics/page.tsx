"use client";
import SelfStatisticsPage from "@/components/custom/dashboard-comps/self-statistics/SSPage";

import PowerHeader from "@/components/custom/power-comps/power-header";
import { Button } from "@/components/ui/button";
import {
  AbsentIcon,
  ApprovedIcon,
  CalendarIcon,
  LeaveTakenIcon,
  PendingIcon,
  PunchInIcon,
  TotalLeavesIcon,
  WorkingDaysIcon,
} from "@/icons/icons";
import { useLanguage } from "@/providers/LanguageProvider";
import React, { useEffect, useState } from "react";

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
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <PowerHeader
          disableAdd
          disableDelete
          disableSearch
          items={modules?.dashboard.items}
        />
        <div className="text-white">
          <Button>
            {" "}
            <PunchInIcon /> Punch in
          </Button>
        </div>
      </div>
      <SelfStatisticsPage />
    </div>
  );
}
