"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { getAllDashboardData } from '@/src/lib/apiHandler';

interface AttendanceDetails {
    TimeIn: string | null;
    TimeOut: string | null;
    SchCode: string;
    Late: string;
    Early: string;
    AbsentDays: string;
    LeaveTaken: number;
    ApprovedLeaves: number | null;
    LateMinutes: string;
    EarlyMinutes: string;
    AbsentMinutes: string;
    MonthlyLate: string;
    MonthlyEarly: string;
    MonthlyAbsent: string;
    MonthlyLateMinutes: string;
    MonthlyEarlyMinutes: string;
    MonthlyAbsentMinutes: string;
    GroupLate: string;
    GroupEarly: string;
    GroupAbsent: string;
    GroupLateMinutes: string;
    GroupEarlyMinutes: string;
    GroupAbsentMinutes: string;
    MonthlyGroupLate: string;
    MonthlyGroupEarly: string;
    MonthlyGroupAbsent: string;
    MonthlyGroupLateMinutes: string;
    MonthlyGroupEarlyMinutes: string;
    MonthlyGroupAbsentMinutes: string;
    Flexible: string;
    GraceIn: string;
    GraceOut: string;
    InTime: string;
    OutTime: string;
    TotalMissedIn: number;
    TotalMissedOut: number;
    TotalWorkingDays: number | null;
    TotalPermissionCnt: number;
    ApprovedPermissionHrs: string;
    UnapprovedPermisions: string;
}

interface WorkSchedule {
    TimeIn: string | null;
    TimeOut: string | null;
    SchCode: string;
    Flexible: string;
    GraceIn: string;
    GraceOut: string;
    InTime: string;
    OutTime: string;
    DayReqdHrs: string;
    TotalExpectingWrkHrs: number | null;
}

interface LeaveAnalytics {
    employee_id: number;
    LeaveMonth: number;
    LeaveYear: number;
    LeaveCount: number;
}

interface WorkHourTrends {
    DayofDate: string;
    WorkingDay: number;
    WorkMinutes: number;
    MissedMinutes: number;
    ExpectedWork: number;
}

interface DashboardData {
    attendanceDetails: AttendanceDetails | null;
    workSchedule: WorkSchedule | null;
    leaveAnalytics: LeaveAnalytics[];
    workHourTrends: WorkHourTrends[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const AttendanceDataContext = createContext<DashboardData | undefined>(undefined);

export const useAttendanceData = () => {
    const context = useContext(AttendanceDataContext);
    if (!context) {
        throw new Error('useAttendanceData must be used within AttendanceDataProvider');
    }
    return context;
};

interface AttendanceDataProviderProps {
    children: React.ReactNode;
}

export const AttendanceDataProvider = ({ children }: AttendanceDataProviderProps) => {
    const [attendanceDetails, setAttendanceDetails] = useState<AttendanceDetails | null>(null);
    const [workSchedule, setWorkSchedule] = useState<WorkSchedule | null>(null);
    const [leaveAnalytics, setLeaveAnalytics] = useState<LeaveAnalytics[]>([]);
    const [workHourTrends, setWorkHourTrends] = useState<WorkHourTrends[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getAllDashboardData();

            if (response.success && response.data) {
                if (response.data.getMyAttnDetails?.length > 0) {
                    setAttendanceDetails(response.data.getMyAttnDetails[0]);
                }

                if (response.data.WorkSchedule?.length > 0) {
                    setWorkSchedule(response.data.WorkSchedule[0]);
                }

                if (response.data.getLeaveAnalytics) {
                    setLeaveAnalytics(response.data.getLeaveAnalytics);
                }

                if (response.data.WorkHourTrends) {
                    setWorkHourTrends(response.data.WorkHourTrends);
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const value: DashboardData = {
        attendanceDetails,
        workSchedule,
        leaveAnalytics,
        workHourTrends,
        loading,
        error,
        refetch: fetchDashboardData
    };

    return (
        <AttendanceDataContext.Provider value={value}>
            {children}
        </AttendanceDataContext.Provider>
    );
};