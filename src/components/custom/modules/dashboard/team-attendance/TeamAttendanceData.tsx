"use client";
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { getAttendanceDetails, getWorkSchedule } from '@/src/lib/dashboardApiHandler';

interface TeamAttendanceDetails {
    [key: string]: any;
}

interface TeamDashboardData {
    teamAttendanceDetails: TeamAttendanceDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const TeamAttendanceDataContext = createContext<TeamDashboardData | undefined>(undefined);

export const useTeamAttendanceData = () => {
    const context = useContext(TeamAttendanceDataContext);
    if (!context) {
        throw new Error('useTeamAttendanceData must be used within TeamAttendanceDataProvider');
    }
    return context;
};

interface TeamAttendanceDataProviderProps {
    children: React.ReactNode;
}

export const TeamAttendanceDataProvider = ({ children }: TeamAttendanceDataProviderProps) => {
    const [teamAttendanceDetails, setTeamAttendanceDetails] = useState<TeamAttendanceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const mountedRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const fetchTeamDashboardData = useCallback(async (): Promise<void> => {
        if (!mountedRef.current) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const attendance = await getAttendanceDetails();
            
            if (!mountedRef.current) {
                return;
            }
            
            if (attendance?.success && attendance.data?.length > 0) {
                const apiData = attendance.data[0];
                
                const teamData = {
                    CheckInCount: 120, 
                    CheckOutCount: 12, 
                    ApprovedLeaves: apiData.ApprovedLeaves || 0,
                    AbsentCount: parseInt(apiData.AbsentDays || "0"),
                    MissedCheckIn: apiData.TotalMissedIn || 0,
                    MissedCheckOut: apiData.TotalMissedOut || 0,
                    MissingHours: "15.5", 
                    Overtime: "8.2", 
                    Workforce: 250,
                    ProjectManagers: 18, 
                    
                    TotalMissedIn: apiData.TotalMissedIn || 0,
                    TotalMissedOut: apiData.TotalMissedOut || 0,
                    MonthlyLate: apiData.MonthlyLate || 0,
                    MonthlyEarly: apiData.MonthlyEarly || 0,
                };
                
                setTeamAttendanceDetails(teamData);
            } else {
                const dummyTeamData = {
                    CheckInCount: 120,
                    CheckOutCount: 12,
                    ApprovedLeaves: 30,
                    AbsentCount: 5,
                    MissedCheckIn: 8,
                    MissedCheckOut: 12,
                    MissingHours: "15.5",
                    Overtime: "8.2",
                    Workforce: 250,
                    ProjectManagers: 18,
                    TotalMissedIn: 12,
                    TotalMissedOut: 8,
                    MonthlyLate: 15,
                    MonthlyEarly: 10,
                };
                setTeamAttendanceDetails(dummyTeamData);
            }
            
        } catch (err) {
            console.error('Error in fetchTeamDashboardData:', err);
            if (mountedRef.current) {
                setError('Failed to fetch team dashboard data');
                const dummyTeamData = {
                    CheckInCount: 120,
                    CheckOutCount: 12,
                    ApprovedLeaves: 30,
                    AbsentCount: 5,
                    MissedCheckIn: 8,
                    MissedCheckOut: 12,
                    MissingHours: "15.5",
                    Overtime: "8.2",
                    Workforce: 250,
                    ProjectManagers: 18,
                    TotalMissedIn: 12,
                    TotalMissedOut: 8,
                    MonthlyLate: 15,
                    MonthlyEarly: 10,
                };
                setTeamAttendanceDetails(dummyTeamData);
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
            fetchTeamDashboardData();
        }

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const value: TeamDashboardData = {
        teamAttendanceDetails,
        loading,
        error,
        refetch: fetchTeamDashboardData
    };

    return (
        <TeamAttendanceDataContext.Provider value={value}>
            {children}
        </TeamAttendanceDataContext.Provider>
    );
};