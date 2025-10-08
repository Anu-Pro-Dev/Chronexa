"use client";
import React from "react";
import { useLanguage } from '@/src/providers/LanguageProvider';
import { WorkingDaysIcon, TotalLeavesIcon, LeaveTakenIcon, AbsentIcon, PendingIcon, ApprovedIcon } from "@/src/icons/icons";
import { useAttendanceData } from './AttendanceData';

interface LeaveCardDataProps {
    page: string;
}

export default function LeaveCardData({ page }: LeaveCardDataProps) {
    const { attendanceDetails, loading, error } = useAttendanceData();
    const { translations } = useLanguage();
    const t = translations?.modules?.dashboard || {};

    const parsePermissionHours = (timeString: string): number => {
        if (!timeString || timeString === "00:00") return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + (minutes / 60);
    };

    const formatValue = (value: any): number => {
        if (value === null || value === undefined) return 0;
        return typeof value === 'string' ? parseInt(value) || 0 : value;
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[200px]'>
                <p className='text-text-secondary'>Loading...</p>
            </div>
        );
    }

    if (error || !attendanceDetails) {
        return (
            <div className='flex justify-center items-center h-[200px]'>
                <p className='text-text-secondary'>No data available</p>
            </div>
        );
    }

    const leavesData = [
        { 
            label: t?.working_days, 
            value: formatValue(attendanceDetails?.TotalWorkingDays),
            color: "text-primary", 
            icon: WorkingDaysIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" 
        },
        { 
            label: t?.total_leaves, 
            value: formatValue(attendanceDetails?.TotalLeaves),
            color: "text-[#6741CA]", 
            icon: TotalLeavesIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" 
        },
        { 
            label: t?.leaves_taken, 
            value: formatValue(attendanceDetails?.LeaveTaken),
            color: "text-[#FFBF00]", 
            icon: LeaveTakenIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" 
        },
        { 
            label: t?.leaves_absent, 
            value: formatValue(parseInt(attendanceDetails?.AbsentDays || "0")),
            color: "text-[#DA153E]", 
            icon: AbsentIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" 
        },
        { 
            label: t?.approved_leaves, 
            value: formatValue(attendanceDetails?.ApprovedLeaves),
            color: "text-[#1DAA61]", 
            icon: ApprovedIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" 
        },
        { 
            label: t?.pending_leaves, 
            value: formatValue(attendanceDetails?.PendingLeaves),
            color: "text-[#FF6347]", 
            icon: PendingIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]" 
        }
    ];

    const permissionsData = [
        { 
            label: t?.working_days, 
            value: formatValue(attendanceDetails?.TotalWorkingDays),
            color: "text-primary", 
            icon: WorkingDaysIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" 
        },
        { 
            label: t?.total_perms, 
            value: formatValue(attendanceDetails?.TotalPermissionCnt),
            color: "text-[#6741CA]", 
            icon: TotalLeavesIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" 
        },
        { 
            label: t?.prems_taken, 
            value: attendanceDetails?.PermissionsTaken 
                ? `${parsePermissionHours(attendanceDetails.PermissionsTaken).toFixed(1)} hrs`
                : "0.0 hrs",
            color: "text-[#FFBF00]", 
            icon: LeaveTakenIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]"
        },
        { 
            label: t?.unapproved_perms || "Unapproved Permissions", 
            value: `${parsePermissionHours(attendanceDetails?.UnapprovedPermisions || "00:00").toFixed(1)} hrs`,
            color: "text-[#DA153E]", 
            icon: AbsentIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" 
        },
        { 
            label: t?.approved_perms, 
            value: `${parsePermissionHours(attendanceDetails?.ApprovedPermissionHrs || "00:00").toFixed(1)} hrs`,
            color: "text-[#1DAA61]", 
            icon: ApprovedIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]"
        },
        { 
            label: t?.pending_perms, 
            value: attendanceDetails?.PendingPermissions 
                ? `${parsePermissionHours(attendanceDetails.PendingPermissions).toFixed(1)} hrs`
                : "0.0 hrs",
            color: "text-[#FF6347]", 
            icon: PendingIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,99,71,0.1)]"
        }
    ];

    const data = page === "Leaves" ? leavesData : permissionsData;

    return (
        <>
            <div className='flex justify-between p-3'>
                {data.slice(0, 3).map((item: any, index: number) => (
                    <React.Fragment key={`${item.label}-${index}`}>
                        <div>
                            <div className='flex gap-10'>
                                <p className='text-text-secondary font-semibold text-sm w-[60px]'>{item.label}</p>
                                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <p className={`text-2xl ${item.color} font-bold pt-2`}>
                                {item.value}
                            </p>
                        </div>
                        {index < 2 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className='flex justify-around py-2'>
                {Array(3).fill(null).map((_, index) => (
                    <div key={`line-${index}`} className='h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10'></div>
                ))}
            </div>

            <div className='flex justify-between p-3'>
                {data.slice(3).map((item: any, index: number) => (
                    <React.Fragment key={`${item.label}-${index + 3}`}>
                        <div>
                            <div className='flex gap-10'>
                                <p className='text-text-secondary font-semibold text-sm w-[60px]'>{item.label}</p>
                                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <p className={`text-2xl ${item.color} font-bold pt-2`}>{item.value}</p>
                        </div>
                        {index < 2 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
}