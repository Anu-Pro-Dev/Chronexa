import { create } from "zustand";
import {
  getUserInsightsData,
  getUserAlertsData,
  getEarlyDespatchData,
  SparkAnalyticsData,
  SparkAlertsData,
  SparkEarlyDespatchData,
} from "@/src/lib/userInsightsApiHandler";

// ─── Cache type definitions ───────────────────────────────────────────────────

type DailySummary = {
  totalStaff: number;
  checkIns: number;
  checkOuts: number;
  presentCount: number;
  missedIn: number;
  withLicense: number;
  missedOut: number;
  onLeave: number;
  
  absentCount: number;
  noAppLogin: number;
  present: number;
  absent: number;
};

type HourlyEntry = {
  hour: number;
  checkins: number;
  checkouts: number;
};

type WeeklyEntry = {
  day: string;
  present: number;
  onLeave: number;
  absent: number;
  missedIn: number;
  missedOut: number;
  total: number;
};

type DeptEntry = {
  name: string;
  present: number;
  total: number;
};

type OvertimeData = {
  avgHoursToday: number;
  overtimeStaff: number;
  earlyDepartures: number;
  shiftCoverage: number;
  weekAttendanceRate: number;
  expectedHours: number;
  totalStaff: number;
};

type AlertItem = {
  targetDate: string;
  no_checkin_today: number;
  missing_checkout_yesterday: number;
  depts_below_60pct: number;
  lowest_dept_name: string;
  lowest_dept_pct: number;
  leave_requests_today: number;
  overtime_count: number;
  geofence_violations: number;
  unapproved_wfh: number;
  consecutive_absent_3plus: number;
};

type EarlyDespatchEntry = {
  targetDate: string;
  thresholdMinutes: number;
  summary: {
    earlyDepartureCount: number;
    avgEarlyMinutes: number;
    onTimePct: number;
  };
  topEarlyDepartures: SparkEarlyDespatchData["topEarlyDepartures"];
};

function getWeekStartStr(fromDate?: string): string {
  const d = fromDate ? new Date(fromDate) : new Date();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

function _mapAnalyticsToCache(data: SparkAnalyticsData, today: string, weekStart: string) {
  const totalEmployees = data.totals.totalEmployees;

  const dailySummary: DailySummary = {
    totalStaff: totalEmployees,
    checkIns: data.today.checkIns,
    checkOuts: data.today.checkOuts,
    presentCount: data.today.presentCount,
    withLicense: data.totals.licenseCounts.withLicense,
    missedIn: data.today.missedIn,
    missedOut: data.today.missedOut,
    onLeave: data.today.onLeave,
    absentCount: data.today.absentCount,
    noAppLogin: data.totals.noAppLogin,
    present: data.attendanceSplit.present,
    absent: data.attendanceSplit.absent,
  };

  const hourlyTrend: HourlyEntry[] = data.hourlyTrend.map((h) => ({
    hour: h.hour,
    checkins: h.checkIns,
    checkouts: h.checkOuts,
  }));

  const weeklyTrend: WeeklyEntry[] = data.weeklyTrend.map((w) => ({
    day: w.label,
    present: w.present,
    onLeave: w.onLeave,
    absent: w.absent,
    missedIn: w.missedIn,
    missedOut: w.missedOut,
    total: w.total,
  }));

  const deptAttendance: DeptEntry[] = data.departmentAttendance.map((d) => ({
    name: d.department,
    present: d.present,
    total: d.total,
  }));

  const overtimeData: OvertimeData = {
    avgHoursToday: data.overtime.avgHoursToday,
    overtimeStaff: data.overtime.overtimeCount,
    earlyDepartures: data.overtime.earlyDepartures,
    shiftCoverage: data.overtime.shiftCoverage,
    weekAttendanceRate: data.overtime.weekAttendanceRate,
    expectedHours: 12,
    totalStaff: totalEmployees,
  };

  return {
    insightsDailySummaryCache: { [today]: dailySummary },
    insightsHourlyTrendCache: { [today]: hourlyTrend },
    insightsWeeklyTrendCache: { [weekStart]: weeklyTrend },
    insightsDeptAttendanceCache: { [today]: deptAttendance },
    insightsOvertimeCache: { [today]: overtimeData },
  };
}

export interface UserInsightsState {
  data: SparkAnalyticsData | null;
  alertsData: SparkAlertsData | null;
  earlyDespatchData: SparkEarlyDespatchData | null;

  loading: boolean;
  loadingAlerts: boolean;
  loadingEarlyDespatch: boolean;
  error: string | null;
  alertsError: string | null;
  earlyDespatchError: string | null;

  fetchData: (date?: string) => Promise<void>;
  fetchAlertsData: (date?: string) => Promise<void>;
  fetchEarlyDespatchData: (date?: string) => Promise<void>;
  fetchAllData: (date?: string) => Promise<void>;
  clearData: () => void;

  loadingUserInsights: boolean;
  fetchUserInsightsData: (date?: string) => Promise<void>;

  insightsDailySummaryCache: Record<string, DailySummary>;
  insightsHourlyTrendCache: Record<string, HourlyEntry[]>;
  insightsWeeklyTrendCache: Record<string, WeeklyEntry[]>;
  insightsDeptAttendanceCache: Record<string, DeptEntry[]>;
  insightsOvertimeCache: Record<string, OvertimeData>;

  insightsAlertsCache: Record<string, AlertItem>;

  insightsEarlyDespatchCache: Record<string, EarlyDespatchEntry>;
}

export const useUserInsightsStore = create<UserInsightsState>((set, get) => ({
  data: null,
  alertsData: null,
  earlyDespatchData: null,

  loading: false,
  loadingAlerts: false,
  loadingEarlyDespatch: false,
  loadingUserInsights: false,
  error: null,
  alertsError: null,
  earlyDespatchError: null,

  insightsDailySummaryCache: {},
  insightsHourlyTrendCache: {},
  insightsWeeklyTrendCache: {},
  insightsDeptAttendanceCache: {},
  insightsOvertimeCache: {},
  insightsAlertsCache: {},
  insightsEarlyDespatchCache: {},

  fetchData: async (date?: string) => {
    set({ loading: true, loadingUserInsights: true, error: null });
    try {
      const data = await getUserInsightsData(date);
      const today = date ?? new Date().toISOString().split("T")[0];
      const weekStart = getWeekStartStr(date);
      const caches = _mapAnalyticsToCache(data, today, weekStart);
      set({ data, loading: false, loadingUserInsights: false, error: null, ...caches });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics data";
      set({ error: errorMessage, loading: false, loadingUserInsights: false, data: null });
      console.error("UserInsightsStore fetchData error:", error);
    }
  },

  fetchAlertsData: async (date?: string) => {
    set({ loadingAlerts: true, alertsError: null });
    try {
      const alertsData = await getUserAlertsData(date);
      const cacheKey = alertsData.targetDate;
      const alertItem: AlertItem = { ...alertsData };
      set((state) => ({
        alertsData,
        loadingAlerts: false,
        alertsError: null,
        insightsAlertsCache: { ...state.insightsAlertsCache, [cacheKey]: alertItem },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch alerts data";
      set({ alertsError: errorMessage, loadingAlerts: false, alertsData: null });
      console.error("UserInsightsStore fetchAlertsData error:", error);
    }
  },

  fetchEarlyDespatchData: async (date?: string) => {
    set({ loadingEarlyDespatch: true, earlyDespatchError: null });
    try {
      const earlyDespatchData = await getEarlyDespatchData(date);
      const cacheKey = earlyDespatchData.targetDate;
      const entry: EarlyDespatchEntry = {
        targetDate: earlyDespatchData.targetDate,
        thresholdMinutes: earlyDespatchData.thresholdMinutes,
        summary: earlyDespatchData.summary,
        topEarlyDepartures: earlyDespatchData.topEarlyDepartures,
      };
      set((state) => ({
        earlyDespatchData,
        loadingEarlyDespatch: false,
        earlyDespatchError: null,
        insightsEarlyDespatchCache: {
          ...state.insightsEarlyDespatchCache,
          [cacheKey]: entry,
        },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch early despatch data";
      set({ earlyDespatchError: errorMessage, loadingEarlyDespatch: false, earlyDespatchData: null });
      console.error("UserInsightsStore fetchEarlyDespatchData error:", error);
    }
  },

  fetchAllData: async (date?: string) => {
    const { fetchData, fetchAlertsData, fetchEarlyDespatchData } = get();
    await Promise.all([
      fetchData(date),
      fetchAlertsData(date),
      fetchEarlyDespatchData(date),
    ]);
  },

  clearData: () => {
    set({
      data: null,
      alertsData: null,
      earlyDespatchData: null,
      loading: false,
      loadingAlerts: false,
      loadingEarlyDespatch: false,
      loadingUserInsights: false,
      error: null,
      alertsError: null,
      earlyDespatchError: null,
      insightsDailySummaryCache: {},
      insightsHourlyTrendCache: {},
      insightsWeeklyTrendCache: {},
      insightsDeptAttendanceCache: {},
      insightsOvertimeCache: {},
      insightsAlertsCache: {},
      insightsEarlyDespatchCache: {},
    });
  },

  fetchUserInsightsData: (date?: string) => get().fetchData(date),
}));