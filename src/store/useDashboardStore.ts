import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "@/src/lib/apiHandler";
import {
  getAttendanceDetails,
  getWorkSchedule,
  getLeaveAnalytics,
  getWorkHourTrends,
  getTeamAttendanceDetails,
  getTeamLeaveAnalytics,
  getTeamViolationAnalytics,
} from "@/src/lib/dashboardApiHandler";

interface DashboardStore {
  roleId: number | null;
  privileges: any[];
  loadedPrivileges: boolean;
  setRole: (roleId: number) => void;
  fetchPrivileges: () => Promise<void>;
  clearRoleAndPrivileges: () => void;

  attendanceDetails: any | null;
  workSchedule: any | null;
  
  leaveAnalyticsCache: Record<number, any[]>;
  loadingLeaveAnalytics: boolean;
  fetchLeaveAnalyticsForYear: (year: number) => Promise<void>;
  
  workHourTrendsCache: Record<number, any[]>;
  loadingWorkHourTrends: boolean;
  fetchWorkHourTrendsForMonth: (month: number) => Promise<void>;
  
  loadingDashboard: boolean;
  errorDashboard: string | null;
  fetchDashboardData: () => Promise<void>;

  teamAttendanceCache: Record<string, any[]>; 
  loadingTeamAttendance: boolean;
  fetchTeamAttendance: (date?: string, month?: number, year?: number) => Promise<void>;

  teamLeaveAnalyticsCache: Record<number, any[]>; 
  loadingTeamLeaveAnalytics: boolean;
  fetchTeamLeaveAnalyticsForYear: (year: number) => Promise<void>;

  teamViolationAnalyticsCache: Record<number, any[]>;
  loadingTeamViolationAnalytics: boolean;
  fetchTeamViolationAnalyticsForYear: (year: number) => Promise<void>;

  errorTeamDashboard: string | null;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      roleId: null,
      privileges: [],
      loadedPrivileges: false,

      setRole: (roleId: number) => set({ roleId }),

      fetchPrivileges: async () => {
        const { roleId, loadedPrivileges } = get();

        if (!roleId) {
          console.error("Cannot fetch privileges: roleId is not set");
          return;
        }
        if (loadedPrivileges) {
          const currentState = get();
          if (currentState.roleId === roleId) {
            return;
          }
        }

        try {
          const res = await apiRequest(`/secRolePrivilege?roleId=${roleId}`, "GET");
          set({ privileges: res?.data || [], loadedPrivileges: true });
        } catch (err) {
          console.error(`Failed to fetch privileges for roleId=${roleId}`, err);
          set({ privileges: [], loadedPrivileges: true });
        }
      },

      clearRoleAndPrivileges: () => {
        set({ 
          roleId: null, 
          privileges: [], 
          loadedPrivileges: false 
        });
      },

      attendanceDetails: null,
      workSchedule: null,
      leaveAnalyticsCache: {},
      loadingLeaveAnalytics: false,
      workHourTrendsCache: {},
      loadingWorkHourTrends: false,
      loadingDashboard: true,
      errorDashboard: null,

      fetchLeaveAnalyticsForYear: async (year: number) => {
        const { leaveAnalyticsCache } = get();
        
        if (leaveAnalyticsCache[year]) {
          return;
        }

        set({ loadingLeaveAnalytics: true });

        try {
          const response = await getLeaveAnalytics(year);
          
          if (response?.success && response?.data) {
            set((state) => ({
              leaveAnalyticsCache: {
                ...state.leaveAnalyticsCache,
                [year]: response.data,
              },
              loadingLeaveAnalytics: false,
            }));
          } else {
            set((state) => ({
              leaveAnalyticsCache: {
                ...state.leaveAnalyticsCache,
                [year]: [],
              },
              loadingLeaveAnalytics: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch leave analytics for year ${year}:`, err);
          set((state) => ({
            leaveAnalyticsCache: {
              ...state.leaveAnalyticsCache,
              [year]: [],
            },
            loadingLeaveAnalytics: false,
          }));
        }
      },

      fetchWorkHourTrendsForMonth: async (month: number) => {
        const { workHourTrendsCache } = get();
        
        if (workHourTrendsCache[month]) {
          return;
        }

        set({ loadingWorkHourTrends: true });

        try {
          const response = await getWorkHourTrends(month.toString());
          
          if (response?.success && response?.data) {
            set((state) => ({
              workHourTrendsCache: {
                ...state.workHourTrendsCache,
                [month]: response.data,
              },
              loadingWorkHourTrends: false,
            }));
          } else {
            set((state) => ({
              workHourTrendsCache: {
                ...state.workHourTrendsCache,
                [month]: [],
              },
              loadingWorkHourTrends: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch work hour trends for month ${month}:`, err);
          set((state) => ({
            workHourTrendsCache: {
              ...state.workHourTrendsCache,
              [month]: [],
            },
            loadingWorkHourTrends: false,
          }));
        }
      },

      fetchDashboardData: async () => {
        set({ loadingDashboard: true, errorDashboard: null });

        try {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          const [attendance, schedule, leaveAnalytics, workHours] = await Promise.all([
            getAttendanceDetails(),
            getWorkSchedule(),
            getLeaveAnalytics(currentYear),
            getWorkHourTrends(currentMonth.toString()),
          ]);

          set({
            attendanceDetails: attendance?.data[0] || null,
            workSchedule: schedule?.data[0] || null,
            leaveAnalyticsCache: {
              [currentYear]: leaveAnalytics?.data || [],
            },
            workHourTrendsCache: {
              [currentMonth]: workHours?.data || [],
            },
            loadingDashboard: false,
          });
        } catch (err) {
          console.error("Failed to fetch dashboard data:", err);
          set({ loadingDashboard: false, errorDashboard: "Failed to fetch dashboard data" });
        }
      },

      teamAttendanceCache: {},
      loadingTeamAttendance: false,
      teamLeaveAnalyticsCache: {},
      loadingTeamLeaveAnalytics: false,
      teamViolationAnalyticsCache: {},
      loadingTeamViolationAnalytics: false,
      errorTeamDashboard: null,

      fetchTeamAttendance: async (date?: string, month?: number, year?: number) => {
        const cacheKey = date 
          ? `date-${date}` 
          : month && year 
          ? `month-${month}-${year}` 
          : `current`;

        const { teamAttendanceCache } = get();
        
        if (teamAttendanceCache[cacheKey]) {
          return;
        }

        set({ loadingTeamAttendance: true, errorTeamDashboard: null });

        try {
          const response = await getTeamAttendanceDetails(date, month, year);
          
          if (response?.success && response?.data) {
            set((state) => ({
              teamAttendanceCache: {
                ...state.teamAttendanceCache,
                [cacheKey]: response.data,
              },
              loadingTeamAttendance: false,
            }));
          } else {
            set((state) => ({
              teamAttendanceCache: {
                ...state.teamAttendanceCache,
                [cacheKey]: [],
              },
              loadingTeamAttendance: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch team attendance:`, err);
          set((state) => ({
            teamAttendanceCache: {
              ...state.teamAttendanceCache,
              [cacheKey]: [],
            },
            loadingTeamAttendance: false,
            errorTeamDashboard: "Failed to fetch team attendance data",
          }));
        }
      },

      fetchTeamLeaveAnalyticsForYear: async (year: number) => {
        const { teamLeaveAnalyticsCache } = get();
        
        if (teamLeaveAnalyticsCache[year]) {
          return;
        }

        set({ loadingTeamLeaveAnalytics: true });

        try {
          const response = await getTeamLeaveAnalytics(year);
          
          if (response?.success && response?.data) {
            set((state) => ({
              teamLeaveAnalyticsCache: {
                ...state.teamLeaveAnalyticsCache,
                [year]: response.data,
              },
              loadingTeamLeaveAnalytics: false,
            }));
          } else {
            set((state) => ({
              teamLeaveAnalyticsCache: {
                ...state.teamLeaveAnalyticsCache,
                [year]: [],
              },
              loadingTeamLeaveAnalytics: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch team leave analytics for year ${year}:`, err);
          set((state) => ({
            teamLeaveAnalyticsCache: {
              ...state.teamLeaveAnalyticsCache,
              [year]: [],
            },
            loadingTeamLeaveAnalytics: false,
          }));
        }
      },

      fetchTeamViolationAnalyticsForYear: async (year: number) => {
        const { teamViolationAnalyticsCache } = get();
        
        if (teamViolationAnalyticsCache[year]) {
          return;
        }

        set({ loadingTeamViolationAnalytics: true });

        try {
          const response = await getTeamViolationAnalytics(year);
          
          if (response?.success && response?.data) {
            set((state) => ({
              teamViolationAnalyticsCache: {
                ...state.teamViolationAnalyticsCache,
                [year]: response.data,
              },
              loadingTeamViolationAnalytics: false,
            }));
          } else {
            set((state) => ({
              teamViolationAnalyticsCache: {
                ...state.teamViolationAnalyticsCache,
                [year]: [],
              },
              loadingTeamViolationAnalytics: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch team violation analytics for year ${year}:`, err);
          set((state) => ({
            teamViolationAnalyticsCache: {
              ...state.teamViolationAnalyticsCache,
              [year]: [],
            },
            loadingTeamViolationAnalytics: false,
          }));
        }
      },
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        roleId: state.roleId,
        privileges: state.privileges,
        loadedPrivileges: state.loadedPrivileges,
      }),
    }
  )
);