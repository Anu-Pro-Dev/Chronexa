"use client";
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { getAllDashboardData } from '@/src/lib/apiHandler';

interface AttendanceDetails {
    [key: string]: any;
}

interface WorkSchedule {
    [key: string]: any;
}

interface LeaveAnalytics {
    [key: string]: any;
}

interface WorkHourTrends {
    [key: string]: any;
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
    
    const isFetchingRef = useRef(false);
    const hasFetchedRef = useRef(false);

    const fetchDashboardData = useCallback(async () => {
        if (isFetchingRef.current) {
            console.log('⏳ Fetch already in progress, skipping...');
            return;
        }

        try {
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);
            
            console.log('🔄 Fetching dashboard data...');
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
                
                console.log('✅ Dashboard data fetched successfully');
            } else {
                console.warn('⚠️ No data returned from API');
            }
        } catch (err) {
            console.error('❌ Error fetching dashboard data:', err);
            setError('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
            hasFetchedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (!hasFetchedRef.current) {
            fetchDashboardData();
        }
    }, [fetchDashboardData]);

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