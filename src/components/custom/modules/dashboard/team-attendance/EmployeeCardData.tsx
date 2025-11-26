"use client";
import React from "react";
import { useLanguage } from '@/src/providers/LanguageProvider';
import { 
    EmployeesIcon, 
    OrgIcon, 
    ManagerIcon, 
    EmployeeCountIcon, 
    VoilationIcon, 
    LeaveTakenIcon 
} from "@/src/icons/icons";
import { useTeamAttendanceData } from './TeamAttendanceData';

export default function EmployeeCardData() {
    const { translations } = useLanguage();
    const t = translations?.modules?.dashboard || {};
    const { teamAttendanceDetails, loading } = useTeamAttendanceData();

    const formatValue = (value: any): string | number => {
        if (value === null || value === undefined) return 0;
        return value;
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-[200px]'>
                <p className='text-text-secondary'>Loading...</p>
            </div>
        );
    }

    if (!teamAttendanceDetails) {
        return (
            <div className='flex justify-center items-center h-[200px]'>
                <p className='text-text-secondary'>No data available</p>
            </div>
        );
    }

    const employeeData = [
        { 
            label: "Check In", 
            value: formatValue(teamAttendanceDetails.CheckInCount),
            color: "text-primary", 
            icon: EmployeesIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" 
        },
        { 
            label: "Check Out", 
            value: formatValue(teamAttendanceDetails.CheckOutCount),
            color: "text-[#7D3FFF]", 
            icon: OrgIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(125,63,255,0.05)]" 
        },
        { 
            label: "Missed Check In", 
            value: formatValue(teamAttendanceDetails.MissedCheckIn),
            color: "text-[#FF6B2D]", 
            icon: ManagerIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,107,45,0.15)]" 
        },
        { 
            label: "Missed Check Out", 
            value: formatValue(teamAttendanceDetails.MissedCheckOut),
            color: "text-[#FFBF00]", 
            icon: ManagerIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,191,0,0.15)]" 
        },
        { 
            label: "Missing Hours", 
            value: `${formatValue(teamAttendanceDetails.MissingHours)} hrs`,
            color: "text-[#DA153E]", 
            icon: VoilationIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(218,21,62,0.05)]" 
        },
        { 
            label: t?.approved_leaves || "Approved Leaves", 
            value: formatValue(teamAttendanceDetails.ApprovedLeaves),
            color: "text-[#1DAA61]", 
            icon: LeaveTakenIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(29,170,97,0.05)]" 
        },
        { 
            label: "Absent", 
            value: formatValue(teamAttendanceDetails.AbsentCount),
            color: "text-[#FF3B3B]", 
            icon: VoilationIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,59,59,0.1)]" 
        },
        { 
            label: "Overtime", 
            value: `${formatValue(teamAttendanceDetails.Overtime)} hrs`,
            color: "text-[#6741CA]", 
            icon: EmployeeCountIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(103,65,202,0.05)]" 
        },
        { 
            label: "Workforce", 
            value: formatValue(teamAttendanceDetails.Workforce),
            color: "text-primary", 
            icon: EmployeesIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(0,120,212,0.05)]" 
        },
        { 
            label: "Project Managers", 
            value: formatValue(teamAttendanceDetails.ProjectManagers),
            color: "text-[#FF6B2D]", 
            icon: ManagerIcon(), 
            shadow: "shadow-[0_0_20px_15px_rgba(255,107,45,0.15)]" 
        }
    ];

    return (
        <>
            <div className='flex justify-between p-3'>
                {employeeData.slice(0, 5).map((item: any, index: number) => (
                    <React.Fragment key={`${item.label}-${index}`}>
                        <div>
                            <div className='flex gap-10'>
                                <p className='text-text-secondary font-semibold text-sm w-[5rem]'>{item.label}</p>
                                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <p className={`text-2xl ${item.color} font-bold pt-2`}>
                                {item.value}
                            </p>
                        </div>
                        {index < 4 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                    </React.Fragment>
                ))}
            </div>

            <div className='flex justify-around py-2'>
                {Array(5).fill(null).map((_, index) => (
                    <div key={`line-${index}`} className='h-[1px] w-[60px] bg-text-secondary flex self-center opacity-10'></div>
                ))}
            </div>

            <div className='flex justify-between p-3'>
                {employeeData.slice(5).map((item: any, index: number) => (
                    <React.Fragment key={`${item.label}-${index + 5}`}>
                        <div>
                            <div className='flex gap-10'>
                                <p className='text-text-secondary font-semibold text-sm w-[60px]'>{item.label}</p>
                                <div className={`icon-group bg-background w-[35px] h-[35px] flex justify-center items-center rounded-[10px] ${item.shadow} ${item.color}`}>
                                    {item.icon}
                                </div>
                            </div>
                            <p className={`text-2xl ${item.color} font-bold pt-2`}>{item.value}</p>
                        </div>
                        {index < 4 && <div className='w-[1px] h-[60px] mx-4 bg-text-secondary flex self-center opacity-15'></div>}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
}