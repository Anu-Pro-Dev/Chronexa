"use client";
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { getAttendanceDetails, getWorkSchedule, getLeaveAnalytics } from '@/src/lib/dashboardApiHandler';

interface AttendanceDetails {
    [key: string]: any;
}

interface WorkSchedule {
    [key: string]: any;
}

interface DashboardData {
    attendanceDetails: AttendanceDetails | null;
    workSchedule: WorkSchedule | null;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const mountedRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const fetchDashboardData = useCallback(async () => {
        if (!mountedRef.current) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('📄 Requesting dashboard data...');
            
            const [attendance, schedule] = await Promise.all([
                getAttendanceDetails(),
                getWorkSchedule()
            ]);
            
            if (!mountedRef.current) {
                console.log('⏹️ Component unmounted, skipping state update');
                return;
            }
            
            if (attendance?.success && attendance.data?.length > 0) {
                setAttendanceDetails(attendance.data[0]);
            }
            
            if (schedule?.success && schedule.data?.length > 0) {
                setWorkSchedule(schedule.data[0]);
            }
            
            console.log('✅ Dashboard state updated');
        } catch (err) {
            console.error('❌ Error in fetchDashboardData:', err);
            if (mountedRef.current) {
                setError('Failed to fetch dashboard data');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            fetchDashboardData();
        }

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const value: DashboardData = {
        attendanceDetails,
        workSchedule,
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