"use client";
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { getAllDashboardData } from '@/src/lib/dashboardApiHandler';

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
    
    const mountedRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const fetchDashboardData = useCallback(async () => {
        // Skip if component not mounted
        if (!mountedRef.current) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Requesting dashboard data...');
            const response = await getAllDashboardData();
            
            // Only update state if still mounted
            if (!mountedRef.current) {
                console.log('⏭️ Component unmounted, skipping state update');
                return;
            }
            
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
                
                console.log('✅ Dashboard state updated');
            } else {
                console.warn('⚠️ No data returned from API');
            }
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
        
        // Only fetch once on mount
        if (!hasInitializedRef.current) {
            hasInitializedRef.current = true;
            fetchDashboardData();
        }

        return () => {
            mountedRef.current = false;
        };
    }, []); // Empty deps - runs once

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