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
  getWeeklyViolationSummary,
  getWeeklyViolationDetail,
} from "@/src/lib/dashboardApiHandler";

interface DashboardStore {
  roleId: number | null;
  privileges: any[];
  loadedPrivileges: boolean;
  loadingPrivileges: boolean;
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
  fetchDashboardData: (date?: string) => Promise<void>;
  clearDashboardData: () => void;

  teamAttendanceCache: Record<string, any[]>;
  loadingTeamAttendance: boolean;
  fetchTeamAttendance: (date?: string, month?: number, year?: number) => Promise<void>;

  teamLeaveAnalyticsCache: Record<number, any[]>;
  loadingTeamLeaveAnalytics: boolean;
  fetchTeamLeaveAnalyticsForYear: (year: number) => Promise<void>;

  teamViolationAnalyticsCache: Record<number, any[]>;
  loadingTeamViolationAnalytics: boolean;
  fetchTeamViolationAnalyticsForYear: (year: number) => Promise<void>;

  weeklyViolationCache: Record<string, any>;
  loadingWeeklyViolation: boolean;
  fetchWeeklyViolationSummary: (weekstart: string, weekend: string) => Promise<void>;

  weeklyViolationDetailCache: Record<string, any>;
  loadingWeeklyViolationDetail: boolean;
  fetchWeeklyViolationDetail: (summaryId: number, filter: string, limit?: number) => Promise<void>;

  errorTeamDashboard: string | null;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      roleId: null,
      privileges: [],
      loadedPrivileges: false,
      loadingPrivileges: false,


      setRole: (roleId: number) =>
        set((state) => {
          if (state.roleId === roleId) return state;

          return {
            roleId,
            privileges: [],
            loadedPrivileges: false,
            loadingPrivileges: false,
          };
        }),


      fetchPrivileges: async () => {
        const { roleId, loadedPrivileges, loadingPrivileges } = get();

        if (!roleId || loadedPrivileges || loadingPrivileges) return;

        set({ loadingPrivileges: true });

        try {
          const res = await apiRequest(`/secRolePrivilege?roleId=${roleId}`, "GET");
          set({
            privileges: res?.data || [],
            loadedPrivileges: true,
            loadingPrivileges: false,
          });
        } catch (err) {
          console.error(`Failed to fetch privileges for roleId=${roleId}`, err);
          set({
            privileges: [],
            loadedPrivileges: true,
            loadingPrivileges: false,
          });
        }
      },


      clearRoleAndPrivileges: () => {
        set({
          roleId: null,
          privileges: [],
          loadedPrivileges: false,
          loadingPrivileges: false,
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

      clearDashboardData: () => set({ attendanceDetails: null, workSchedule: null }),

      fetchDashboardData: async (date?: string) => {
        const targetDate = date || new Date().toISOString().split('T')[0];

        set({ loadingDashboard: true, errorDashboard: null });

        try {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();

          const [attendance, schedule, leaveAnalytics, workHours] = await Promise.all([
            getAttendanceDetails(targetDate),
            getWorkSchedule(targetDate),
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
      weeklyViolationCache: {},
      loadingWeeklyViolation: false,
      weeklyViolationDetailCache: {},
      loadingWeeklyViolationDetail: false,
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

      fetchWeeklyViolationSummary: async (weekstart: string, weekend: string) => {
        const cacheKey = `${weekstart}_${weekend}`;
        const { weeklyViolationCache } = get();

        if (weeklyViolationCache[cacheKey]) {
          return;
        }

        set({ loadingWeeklyViolation: true });

        try {
          const response = await getWeeklyViolationSummary(weekstart, weekend);

          if (response?.success && response?.data) {
            set((state) => ({
              weeklyViolationCache: {
                ...state.weeklyViolationCache,
                [cacheKey]: response.data,
              },
              loadingWeeklyViolation: false,
            }));
          } else {
            set((state) => ({
              weeklyViolationCache: {
                ...state.weeklyViolationCache,
                [cacheKey]: null,
              },
              loadingWeeklyViolation: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch weekly violation summary for ${cacheKey}:`, err);
          set((state) => ({
            weeklyViolationCache: {
              ...state.weeklyViolationCache,
              [cacheKey]: null,
            },
            loadingWeeklyViolation: false,
          }));
        }
      },

      fetchWeeklyViolationDetail: async (summaryId: number, filter: string, limit?: number) => {
        const cacheKey = `${summaryId}_${filter}_${limit ?? 10000}`;
        const { weeklyViolationDetailCache } = get();

        if (weeklyViolationDetailCache[cacheKey]) {
          return;
        }

        set({ loadingWeeklyViolationDetail: true });

        try {
          const response = await getWeeklyViolationDetail(summaryId, filter, limit);

          if (response?.success && response?.data) {
            set((state) => ({
              weeklyViolationDetailCache: {
                ...state.weeklyViolationDetailCache,
                [cacheKey]: response.data,
              },
              loadingWeeklyViolationDetail: false,
            }));
          } else {
            set((state) => ({
              weeklyViolationDetailCache: {
                ...state.weeklyViolationDetailCache,
                [cacheKey]: [],
              },
              loadingWeeklyViolationDetail: false,
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch weekly violation detail for ${cacheKey}:`, err);
          set((state) => ({
            weeklyViolationDetailCache: {
              ...state.weeklyViolationDetailCache,
              [cacheKey]: [],
            },
            loadingWeeklyViolationDetail: false,
          }));
        }
      },
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        roleId: state.roleId,
      }),
    }
  )
);