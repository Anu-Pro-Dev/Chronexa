"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import { WorkingDaysIcon, TotalLeavesIcon, LeaveTakenIcon, AbsentIcon, PendingIcon, ApprovedIcon } from "@/icons/icons";
import { LeaveCardData } from './LeaveCardData';
import { LeaveCardHeader } from './LeaveCardHeader';

function LeaveCard() {
    const [page, setPage] = useState("Leaves");
    const { translations } = useLanguage();
    const t = translations?.modules?.dashboard || {};

    const leavesData = [
        { label: t?.working_days, value: 212, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" },
        { label: t?.total_leaves, value: 9, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" },
        { label: t?.leaves_taken, value: 6, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" },
        { label: t?.leaves_absent, value: 3, color: "text-[#DA153E]", icon: AbsentIcon(), shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" },
        { label: t?.approved_leaves, value: 2, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" },
        { label: t?.pending_leaves, value: 1, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]" }
    ];

    const permissionsData = [
        { label: t?.working_days, value: 212, color: "text-primary", icon: WorkingDaysIcon(), shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" },
        { label: t?.total_perms, value: 9, color: "text-[#6741CA]", icon: TotalLeavesIcon(), shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" },
        { label: t?.permissions_taken, value: 6, color: "text-[#FFBF00]", icon: LeaveTakenIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" },
        { label: t?.leaves_absent, value: 3, color: "text-[#DA153E]", icon: AbsentIcon(), shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" },
        { label: t?.approved_perms, value: 2, color: "text-[#1DAA61]", icon: ApprovedIcon(), shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" },
        { label: t?.pending_perms, value: 1, color: "text-[#FF6347]", icon: PendingIcon(), shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]" }
    ];

    return (
        <div className='shadow-card rounded-[10px] bg-accent p-2'>
            <LeaveCardHeader page={page} setPage={setPage} />
            {page === "Leaves" && <LeaveCardData data={leavesData} />}
            {page === "Permissions" && <LeaveCardData data={permissionsData} />}
        </div>
    );
}

export default LeaveCard;