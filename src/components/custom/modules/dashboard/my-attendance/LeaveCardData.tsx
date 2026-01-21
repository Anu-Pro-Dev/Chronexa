"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { 
  WorkingDaysIcon, TotalLeavesIcon, LeaveTakenIcon, 
  AbsentIcon, PendingIcon, ApprovedIcon 
} from "@/src/icons/icons";
import { useAttendanceData } from "./AttendanceData";

interface LeaveCardDataProps {
  page: "Leaves" | "Permissions";
}

export default function LeaveCardData({ page }: LeaveCardDataProps) {
  const { attendanceDetails, loading, error } = useAttendanceData();
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const [animatedValues, setAnimatedValues] = useState<any>(null);

  useEffect(() => {
    if (attendanceDetails && !loading) {
      animateValues(attendanceDetails);
    }
  }, [attendanceDetails, loading]);

  const animateValues = (data: any) => {
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValues = {
        TotalWorkingDays: Math.floor(formatValue(data?.ExpectedMonthlyWorkDays) * progress),
        TotalLeaves: Math.floor(formatValue(data?.TotalLeaves) * progress),
        LeaveTaken: Math.floor(formatValue(data?.LeaveTaken) * progress),
        MonthlyAbsent: Math.floor(formatValue(parseInt(data?.MonthlyAbsent || "0")) * progress),
        ApprovedLeaves: Math.floor(formatValue(data?.ApprovedLeaves) * progress),
        BalanceLeaves: Math.floor(formatValue(data?.BalanceLeaves) * progress),
        TotalPermission: parsePermissionHours("06:00") * progress,
        PendingPermission: parsePermissionHours(data?.PermBalanceHrs || "00:00") * progress,
        AppliedPermission: parsePermissionHours(data?.PermAppliedHrs || "00:00") * progress,
        RejectedPermission: parsePermissionHours(data?.RejectedPermissionMts || "00:00") * progress,
        ApprovedPermission: parsePermissionHours(data?.ApprovedPermissionHrs || "00:00") * progress,
      };

      setAnimatedValues(newValues);

      if (progress < 1) requestAnimationFrame(animate);
    };

    animate();
  };

  const parsePermissionHours = (timeString: string): number => {
    if (!timeString || timeString === "00:00") return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours + minutes / 60;
  };

  const formatValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === "string" ? parseInt(value) || 0 : value;
  };

  const displayValues = animatedValues || {
    TotalWorkingDays: 0,
    TotalLeaves: 0,
    LeaveTaken: 0,
    MonthlyAbsent: 0,
    ApprovedLeaves: 0,
    BalanceLeaves: 0,
    TotalPermission: 0,
    PendingPermission: 0,
    AppliedPermission: 0,
    RejectedPermission: 0,
    ApprovedPermission: 0,
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  const leavesData = [
    { label: t?.working_days, value: displayValues.TotalWorkingDays, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]", isHours: false },
    { label: t?.total_leaves, value: displayValues.TotalLeaves, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]", isHours: false },
    { label: t?.leaves_taken, value: displayValues.LeaveTaken, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]", isHours: false },
    { label: t?.monthly_absent, value: displayValues.MonthlyAbsent, color: "text-[#DA153E]", icon: <AbsentIcon color="#DA153E" />, shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]", isHours: false },
    { label: t?.approved_leaves, value: displayValues.ApprovedLeaves, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]", isHours: false },
    { label: t?.pending_leaves, value: displayValues.BalanceLeaves, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]", isHours: false },
  ];

  const permissionsData = [
    { label: t?.total_perms, value: displayValues.TotalPermission, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]", isHours: true },
    { label: t?.pending_perms, value: displayValues.PendingPermission, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]", isHours: true },
    { label: t?.applied_perms, value: displayValues.AppliedPermission, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]", isHours: true },
    { label: t?.approved_perms, value: displayValues.ApprovedPermission, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]", isHours: true },
    { label: t?.rejected_perms, value: displayValues.RejectedPermission, color: "text-[#DA153E]", icon: <AbsentIcon color="#DA153E" />, shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]", isHours: true },
  ];

  const data = page === "Leaves" ? leavesData : permissionsData;

  const formatDisplayValue = (value: number, isHours: boolean) => (isHours ? `${value.toFixed(1)} hrs` : Math.floor(value));

  return (
    <>
      <div className="flex justify-between p-3">
        {data.slice(0, 3).map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            <div>
              <div className="flex gap-10">
                <p className="text-text-secondary font-semibold text-sm w-[60px]">{item.label}</p>
                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <p className={`text-2xl ${item.color} font-bold pt-2`}>
                {formatDisplayValue(item.value, item.isHours)}
              </p>
            </div>
            {index < 2 && <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex justify-around py-2">
        {Array(3).fill(null).map((_, index) => (
          <div key={`line-${index}`} className="h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10"></div>
        ))}
      </div>

      <div className="flex justify-between p-3">
        {data.slice(3).map((item, index) => (
          <React.Fragment key={`${item.label}-${index + 3}`}>
            <div>
              <div className="flex gap-10">
                <p className="text-text-secondary font-semibold text-sm w-[60px]">{item.label}</p>
                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <p className={`text-2xl ${item.color} font-bold pt-2`}>
                {formatDisplayValue(item.value, item.isHours)}
              </p>
            </div>
            {index < 2 && <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
