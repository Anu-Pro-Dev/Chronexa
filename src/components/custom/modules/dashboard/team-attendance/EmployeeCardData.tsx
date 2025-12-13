"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import { EmployeesIcon, OrgIcon, ManagerIcon, EmployeeCountIcon, VoilationIcon, LeaveTakenIcon, AbsentIcon } from "@/src/icons/icons";
import { useTeamAttendanceData } from "./TeamAttendanceDataProvider";
import { CheckCircleIcon, XCircleIcon, UserMinusIcon, UserPlusIcon, ClockIcon } from '@heroicons/react/24/solid'

export default function EmployeeCardData() {
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};
  const { teamAttendanceDetails, loading } = useTeamAttendanceData();
  
  const [animatedValues, setAnimatedValues] = useState<any>(null);

  useEffect(() => {
    if (teamAttendanceDetails && !loading) {
      animateValues(teamAttendanceDetails);
    }
  }, [teamAttendanceDetails, loading]);

  const animateValues = (data: any) => {
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValues = {
        Workforce: Math.floor(formatValue(data?.Workforce) * progress),
        ProjectManagers: Math.floor(formatValue(data?.ProjectManagers) * progress),
        CheckInCount: Math.floor(formatValue(data?.CheckInCount) * progress),
        CheckOutCount: Math.floor(formatValue(data?.CheckOutCount) * progress),
        ApprovedLeaves: Math.floor(formatValue(data?.ApprovedLeaves) * progress),
        AbsentCount: Math.floor(formatValue(data?.AbsentCount) * progress),
        MissedCheckIn: Math.floor(formatValue(data?.MissedCheckIn) * progress),
        MissedCheckOut: Math.floor(formatValue(data?.MissedCheckOut) * progress),
        MissingHours: parseHours(data?.MissedHrs || "00:00") * progress,
        Overtime: parseHours(data?.OvertimeHrs || "00:00") * progress,
      };

      setAnimatedValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const formatValue = (v: any) => (v === null || v === undefined ? 0 : v);

  const parseHours = (timeString: string): number => {
    if (!timeString || timeString === "00:00") return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const displayValues = animatedValues || {
    Workforce: 0,
    ProjectManagers: 0,
    CheckInCount: 0,
    CheckOutCount: 0,
    ApprovedLeaves: 0,
    AbsentCount: 0,
    MissedCheckIn: 0,
    MissedCheckOut: 0,
    MissingHours: 0,
    Overtime: 0,
  };

  const employeeData = [
    { label: "Workforce", value: displayValues.Workforce, color: "text-primary", icon: EmployeesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]", isHours: false },
    { label: "Project Managers", value: displayValues.ProjectManagers, color: "text-[#FF6B2D]", icon: <ManagerIcon color="#FF6B2D" />, shadow: "shadow-[0_0_20px_15px_rgba(255,107,45,0.15)]", isHours: false },
    { label: "Check In", value: displayValues.CheckInCount, color: "text-[#1DAA61]", icon: <CheckCircleIcon className="size-6 text-[#1DAA61]" />, shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]", isHours: false },
    { label: "Check Out", value: displayValues.CheckOutCount, color: "text-[#7D3FFF]", icon: <XCircleIcon className="size-6 text-[#7D3FFF]" />, shadow: "shadow-[0_0_20px_15px_rgba(125,63,255,0.05)]", isHours: false },
    { label: t?.approved_leaves || "Approved Leaves", value: displayValues.ApprovedLeaves, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]", isHours: false },
    { label: "Absent", value: displayValues.AbsentCount, color: "text-[#FF3B3B]", icon: <AbsentIcon color="#FF3B3B" />, shadow: "shadow-[0_0_20px_15px_rgba(255,59,59,0.1)]", isHours: false },
    { label: "Missed CheckIn", value: displayValues.MissedCheckIn, color: "text-[#2AD90F]", icon: <UserPlusIcon className="size-5 text-[#2AD90F]" />, shadow: "shadow-[0_0_20px_15px_rgba(42,214,15,0.15)]", isHours: false },
    { label: "Missed CheckOut", value: displayValues.MissedCheckOut, color: "text-[#E6107C]", icon: <UserMinusIcon className="size-5 text-[#E6107C]" />, shadow: "shadow-[0_0_20px_15px_rgba(230,16,124,0.1)]", isHours: false },
    { label: "Missing Hours", value: displayValues.MissingHours, color: "text-[#DA153E]", icon: <VoilationIcon color="#DA153E" />, shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]", isHours: true },
    { label: "Overtime", value: displayValues.Overtime, color: "text-[#158993]", icon: <ClockIcon className="size-5 text-[#158993]" />, shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]", isHours: true },
  ];

  const formatDisplayValue = (value: number, isHours: boolean) => {
    if (isHours) {
      return `${value.toFixed(0)} hrs`;
    }
    return Math.floor(value);
  };

  return (
    <>
      <div className="flex justify-between p-3">
        {employeeData.slice(0, 5).map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            <div>
              <div className="flex gap-10">
                <p className="text-text-secondary font-semibold text-sm w-[5rem]">{item.label}</p>
                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <p className={`text-2xl ${item.color} font-bold pt-2`}>{formatDisplayValue(item.value, item.isHours)}</p>
            </div>
            {index < 4 && <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex justify-around py-2">
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <div key={`line-${index}`} className="h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10"></div>
          ))}
      </div>

      <div className="flex justify-between p-3">
        {employeeData.slice(5).map((item, index) => (
          <React.Fragment key={`${item.label}-${index + 5}`}>
            <div>
              <div className="flex gap-10">
                <p className="text-text-secondary font-semibold text-sm w-[60px]">{item.label}</p>
                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                  {item.icon}
                </div>
              </div>
              <p className={`text-2xl ${item.color} font-bold pt-2`}>{formatDisplayValue(item.value, item.isHours)}</p>
            </div>
            {index < 4 && <div className="w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15"></div>}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}