"use client";
import React, { useState } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";
import {
  WorkingDaysIcon, TotalLeavesIcon, LeaveTakenIcon,
  AbsentIcon, PendingIcon, ApprovedIcon,
} from "@/src/icons/icons";
import { useAttendanceData } from "./AttendanceData";
import { KpiCard } from "./KpiCard";
import type { KpiCardData } from "./KpiCard";
import { useCountUpInt, useCountUpFloat } from "./useCountUp";

interface LeaveCardDataProps {
  page: "Leaves" | "Permissions";
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatValue = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseInt(value) || 0 : Number(value) || 0;
};

const parsePermissionHours = (timeString: string): number => {
  if (!timeString || timeString === "00:00") return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function LeaveCardData({ page }: LeaveCardDataProps) {
  const { attendanceDetails, loading, error } = useAttendanceData();
  const { translations } = useLanguage();
  const t = translations?.modules?.dashboard || {};

  const [activeCard, setActiveCard] = useState<string | null>(null);

  const hasData = !!attendanceDetails && !loading;

  // Raw values
  const expectedDays = formatValue(attendanceDetails?.ExpectedMonthlyWorkDays);
  const totalLeaves = formatValue(attendanceDetails?.TotalLeaves);
  const leaveTaken = formatValue(attendanceDetails?.LeaveTaken);
  const monthlyAbsent = formatValue(parseInt(attendanceDetails?.MonthlyAbsent || "0"));
  const approvedLeaves = formatValue(attendanceDetails?.ApprovedLeaves);
  const balanceLeaves = formatValue(attendanceDetails?.BalanceLeaves);

  // Permission hours
  const totalPerm = parsePermissionHours("06:00");
  const pendingPerm = parsePermissionHours(attendanceDetails?.PermBalanceHrs || "00:00");
  const appliedPerm = parsePermissionHours(attendanceDetails?.PermAppliedHrs || "00:00");
  const rejectedPerm = parsePermissionHours(attendanceDetails?.RejectedPermissionMts || "00:00");
  const approvedPerm = parsePermissionHours(attendanceDetails?.ApprovedPermissionHrs || "00:00");

  // Animated values
  const animatedLeaves = useCountUpInt(
    { expectedDays, totalLeaves, leaveTaken, monthlyAbsent, approvedLeaves, balanceLeaves },
    hasData,
  );

  const animatedPerms = useCountUpFloat(
    { totalPerm, pendingPerm, appliedPerm, rejectedPerm, approvedPerm },
    hasData,
  );

  // ── Leaves KPI cards ────────────────────────────────────────────────────

  const denom = expectedDays > 0 ? expectedDays : 1;

  const leavesCards: KpiCardData[] = [
    {
      label: t?.working_days || "WORKING DAYS",
      value: animatedLeaves.expectedDays,
      subLabel: "scheduled work days",
      progress: Math.round((animatedLeaves.expectedDays / denom) * 100),
      color: "#0078D4",
      icon: WorkingDaysIcon(),
    },
    {
      label: t?.total_leaves || "TOTAL LEAVES",
      value: animatedLeaves.totalLeaves,
      subLabel: "leave entitlement",
      progress: Math.round((animatedLeaves.totalLeaves / denom) * 100),
      color: "#6741CA",
      icon: TotalLeavesIcon(),
    },
    {
      label: t?.leaves_taken || "LEAVES TAKEN",
      value: animatedLeaves.leaveTaken,
      subLabel: "used this month",
      progress: Math.round((animatedLeaves.leaveTaken / denom) * 100),
      color: "#FFBF00",
      icon: LeaveTakenIcon(),
    },
    {
      label: t?.monthly_absent || "MONTHLY ABSENT",
      value: animatedLeaves.monthlyAbsent,
      subLabel: "unapproved absences",
      progress: Math.round((animatedLeaves.monthlyAbsent / denom) * 100),
      color: "#DA153E",
      icon: <AbsentIcon color="#DA153E" />,
    },
    {
      label: t?.approved_leaves || "APPROVED LEAVES",
      value: animatedLeaves.approvedLeaves,
      subLabel: "approved requests",
      progress: Math.round((animatedLeaves.approvedLeaves / denom) * 100),
      color: "#1DAA61",
      icon: ApprovedIcon(),
    },
    {
      label: t?.pending_leaves || "PENDING LEAVES",
      value: animatedLeaves.balanceLeaves,
      subLabel: "balance remaining",
      progress: Math.round((animatedLeaves.balanceLeaves / denom) * 100),
      color: "#FF6347",
      icon: PendingIcon(),
    },
  ];

  // ── Permissions KPI cards ──────────────────────────────────────────────

  const permDenom = totalPerm > 0 ? totalPerm : 1;

  const permsCards: KpiCardData[] = [
    {
      label: t?.total_perms || "TOTAL PERMISSION",
      value: `${animatedPerms.totalPerm.toFixed(1)} hrs`,
      subLabel: "total allocation",
      progress: 100,
      color: "#6741CA",
      icon: TotalLeavesIcon(),
    },
    {
      label: t?.pending_perms || "PENDING PERMISSION",
      value: `${animatedPerms.pendingPerm.toFixed(1)} hrs`,
      subLabel: "awaiting approval",
      progress: Math.round((animatedPerms.pendingPerm / permDenom) * 100),
      color: "#FF6347",
      icon: PendingIcon(),
    },
    {
      label: t?.applied_perms || "APPLIED PERMISSION",
      value: `${animatedPerms.appliedPerm.toFixed(1)} hrs`,
      subLabel: "total applied",
      progress: Math.round((animatedPerms.appliedPerm / permDenom) * 100),
      color: "#0078D4",
      icon: WorkingDaysIcon(),
    },
    {
      label: t?.approved_perms || "APPROVED PERMISSION",
      value: `${animatedPerms.approvedPerm.toFixed(1)} hrs`,
      subLabel: "approved requests",
      progress: Math.round((animatedPerms.approvedPerm / permDenom) * 100),
      color: "#1DAA61",
      icon: ApprovedIcon(),
    },
    {
      label: t?.rejected_perms || "REJECTED PERMISSION",
      value: `${animatedPerms.rejectedPerm.toFixed(1)} hrs`,
      subLabel: "rejected requests",
      progress: Math.round((animatedPerms.rejectedPerm / permDenom) * 100),
      color: "#DA153E",
      icon: <AbsentIcon color="#DA153E" />,
    },
  ];

  const cards = page === "Leaves" ? leavesCards : permsCards;

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading && !attendanceDetails) {
    return (
      <div className="animate-pulse space-y-4 p-4 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-[10px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-0">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <KpiCard
            key={card.label}
            data={card}
            isActive={activeCard === card.label}
            onClick={() => setActiveCard((prev) => (prev === card.label ? null : card.label))}
          />
        ))}
      </div>
    </div>
  );
}
