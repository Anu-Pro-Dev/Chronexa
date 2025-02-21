'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { WorkingDaysIcon, TotalLeavesIcon, LeaveTakenIcon, AbsentIcon, PendingIcon, ApprovedIcon } from "@/lib/svg/icons";
import { LeaveCardData } from './LeaveCardData';
import { LeaveCardHeader } from './LeaveCardHeader';

const leavesData = [
    { label: "Working Days", value: 212, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" },
    { label: "Total Leaves", value: 9, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" },
    { label: "Leaves Taken", value: 6, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" },
    { label: "Leaves Absent", value: 3, color: "text-[#DA153E]", icon: AbsentIcon(), shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" },
    { label: "Approved Leaves", value: 2, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" },
    { label: "Pending Leaves", value: 1, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]" }
];

const permissionsData = [
    { label: "Working Days", value: 212, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" },
    { label: "Total Permissions", value: 9, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" },
    { label: "Permissions Taken", value: 6, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" },
    { label: "Leaves Absent", value: 3, color: "text-[#DA153E]", icon: AbsentIcon(), shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" },
    { label: "Approved Permissions", value: 2, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" },
    { label: "Pending Permissions", value: 1, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]" }
];

function LeaveCard() {
    const [page, setPage] = useState("Leaves");

    return (
        <div className='shadow-card rounded-[10px] bg-white p-2'>
            <LeaveCardHeader page={page} setPage={setPage} />
            {page === "Leaves" && <LeaveCardData data={leavesData} />}
            {page === "Permissions" && <LeaveCardData data={permissionsData} />}
        </div>
    );
}

export default LeaveCard;